#!/usr/bin/env python3
"""Compress every image in public/about to JPEG <= 100 KB.

Handles .JPG/.jpg files plus Canon .CR2 raws. True CR2 files are decoded by
extracting the largest embedded JPEG preview (CR2 is TIFF-based and always
embeds a JPEG preview), so no raw decoder dependency is needed.

One known quirk: _MG_6298.CR2 is actually a plain JPEG with a wrong
extension -- it is handled as JPEG automatically.

Output: public/about/optimized/<original-stem>.jpg (all <= 100 KB).

Usage: python3 scripts/optimize-about-images.py  (repo root, needs Pillow)
"""

import io
import struct
import sys
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "about"
DST = SRC / "optimized"
MAX_BYTES = 100 * 1024  # 100 KB
START_DIM = 1600
MIN_DIM = 480
QUALITIES = (82, 74, 66, 58, 50, 42, 34, 28)


def is_jpeg(data: bytes) -> bool:
    return data[:3] == b"\xff\xd8\xff"


def extract_cr2_preview(data: bytes) -> bytes | None:
    """Extract the full-res embedded JPEG preview from a Canon CR2 file.

    CR2 IFD0 stores the preview with Compression=6 (old-style JPEG); the
    StripOffsets (0x0111) / StripByteCounts (0x0117) tags point at the exact
    JPEG byte range. Falls back to a SOI..EOI scan if parsing fails.
    """
    try:
        order = "<" if data[:2] == b"II" else ">"
        ifd_off = struct.unpack(order + "I", data[4:8])[0]
        n = struct.unpack(order + "H", data[ifd_off : ifd_off + 2])[0]
        tags: dict[int, tuple[int, int, bytes]] = {}
        for i in range(n):
            entry = data[ifd_off + 2 + i * 12 : ifd_off + 2 + (i + 1) * 12]
            tag, typ, cnt, raw = struct.unpack(order + "HHI4s", entry)
            tags[tag] = (typ, cnt, raw)

        def values(tag: int) -> list[int]:
            typ, cnt, raw = tags[tag]
            size = {1: 1, 2: 1, 3: 2, 4: 4, 5: 8}[typ]
            fmt = {1: "B", 2: "c", 3: "H", 4: "I"}[typ]
            if cnt * size <= 4:
                chunk = raw[: cnt * size]
            else:
                ptr = struct.unpack(order + "I", raw)[0]
                chunk = data[ptr : ptr + cnt * size]
            if typ == 5:  # RATIONAL pairs
                out = []
                for j in range(cnt):
                    num, den = struct.unpack(order + "II", chunk[j * 8 : (j + 1) * 8])
                    out.append(num // max(den, 1))
                return out
            return list(struct.unpack(order + fmt * cnt, chunk))

        if 0x0103 in tags and values(0x0103)[0] == 6 and 0x0111 in tags and 0x0117 in tags:
            offsets = values(0x0111)
            counts = values(0x0117)
            jpeg = b"".join(
                data[off : off + cnt] for off, cnt in zip(offsets, counts)
            )
            if is_jpeg(jpeg):
                return jpeg
        # thumbnail fallback: JPEGInterchangeFormat tags
        if 0x0201 in tags and 0x0202 in tags:
            off = values(0x0201)[0]
            cnt = values(0x0202)[0]
            jpeg = data[off : off + cnt]
            if is_jpeg(jpeg):
                return jpeg
    except Exception:  # noqa: BLE001 -- fall through to blob scan
        pass
    return extract_embedded_jpeg(data)


def extract_embedded_jpeg(data: bytes) -> bytes | None:
    """Return the largest embedded JPEG stream (SOI..EOI) in a binary blob."""
    candidates: list[tuple[int, int, int]] = []
    start = 0
    while True:
        soi = data.find(b"\xff\xd8\xff", start)
        if soi == -1:
            break
        eoi = data.find(b"\xff\xd9", soi + 3)
        if eoi == -1:
            break
        size = eoi + 2 - soi
        if size > 20_000:  # ignore tiny thumbnails/icons
            candidates.append((size, soi, eoi + 2))
        start = eoi + 2
    if not candidates:
        return None
    candidates.sort()
    _, s, e = candidates[-1]
    return data[s:e]


def fit_to_limit(img: Image.Image) -> bytes:
    """Encode img as JPEG, shrinking dims/quality until <= MAX_BYTES."""
    dim = START_DIM
    last: bytes | None = None
    while dim >= MIN_DIM:
        resized = img.copy()
        resized.thumbnail((dim, dim), Image.LANCZOS)
        for q in QUALITIES:
            buf = io.BytesIO()
            resized.save(buf, "JPEG", quality=q, optimize=True, progressive=True)
            last = buf.getvalue()
            if len(last) <= MAX_BYTES:
                return last
        dim = int(dim * 0.8)
    assert last is not None
    return last


def load_image(path: Path) -> Image.Image:
    raw = path.read_bytes()
    if is_jpeg(raw):
        img = Image.open(io.BytesIO(raw))
    elif path.suffix.lower() == ".cr2":
        embedded = extract_cr2_preview(raw)
        if embedded is None:
            raise ValueError(f"no embedded JPEG preview found in {path.name}")
        img = Image.open(io.BytesIO(embedded))
    else:
        img = Image.open(io.BytesIO(raw))
    img = ImageOps.exif_transpose(img)
    img.load()
    if img.mode in ("RGBA", "LA", "PA"):
        bg = Image.new("RGB", img.size, (255, 255, 255))
        bg.paste(img, mask=img.split()[-1])
        img = bg
    else:
        img = img.convert("RGB")
    return img


def main() -> int:
    DST.mkdir(parents=True, exist_ok=True)
    files = sorted(
        p for p in SRC.iterdir() if p.is_file() and p.parent != DST
    )
    if not files:
        print(f"no source files in {SRC}", file=sys.stderr)
        return 1
    failed: list[str] = []
    for path in files:
        try:
            img = load_image(path)
        except Exception as e:  # noqa: BLE001 -- report per-file, keep going
            print(f"SKIP {path.name}: {e}")
            failed.append(path.name)
            continue
        out = DST / (path.stem + ".jpg")
        payload = fit_to_limit(img)
        out.write_bytes(payload)
        kb = len(payload) / 1024
        status = "OK " if len(payload) <= MAX_BYTES else "OVER"
        print(f"{status} {path.name} -> {out.name}  {kb:.1f} KB")
    over = [p for p in DST.glob("*.jpg") if p.stat().st_size > MAX_BYTES]
    if over:
        print(f"WARNING: {len(over)} file(s) still over 100 KB", file=sys.stderr)
        return 1
    if failed:
        print(f"WARNING: {len(failed)} file(s) skipped", file=sys.stderr)
        return 1
    print(f"done: all files in {DST} are <= 100 KB")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
