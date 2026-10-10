import { useEffect, useRef, useState } from "react";

// ---------------------------------------------------------------------------
// deterministic 2-octave value noise — house field, no deps
// ---------------------------------------------------------------------------
function hash2(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}
function vnoise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
function noise2(x: number, y: number) {
  return 0.65 * vnoise(x, y) + 0.35 * vnoise(x * 2.1 + 19.7, y * 2.1 + 7.3);
}

// ---------------------------------------------------------------------------
// unit scale — the row never gets configured, it is derived from the span that
// is left: inside a day H:M:S, inside 30 days D:H:M:S, beyond that whole
// fixed 30-day months followed by the same D:H:M:S tail. Every scale counts
// down to the second. Months are flat 30-day blocks, not calendar months.
// ---------------------------------------------------------------------------

export type CountdownScale = "time" | "days" | "months";

// the ladder only ever prepends — a wider span gains a leading unit and keeps
// ticking down to the second, so the row never sits still for a whole day
const SCALE_LABELS: Record<CountdownScale, readonly string[]> = {
  time: ["HOURS", "MINUTES", "SECONDS"],
  days: ["DAYS", "HOURS", "MINUTES", "SECONDS"],
  months: ["MONTHS", "DAYS", "HOURS", "MINUTES", "SECONDS"],
};

const SEC_MS = 1_000;
const MIN_MS = 60 * SEC_MS;
const HOUR_MS = 60 * MIN_MS;
const DAY_MS = 24 * HOUR_MS;
const MONTH_SCALE_AT = 30 * DAY_MS; // past this the fixed 30-day months take over
const MONTH_MS = 30 * DAY_MS; // flat month: no calendar lengths involved
const MAX_UNITS = 5; // widest row (months) → 10 digit slots

function breakdown(targetMs: number, nowMs: number) {
  const rem = Math.max(0, targetMs - nowMs);
  // round to the nearest second, not floor: a target set to "24h from now"
  // paints a few ms later than that, and flooring it would open on
  // 23:59:59 instead of the 24:00:00 the caller asked for
  const t = Math.round(rem / SEC_MS);
  if (rem <= DAY_MS) {
    return {
      scale: "time" as const,
      units: [Math.floor(t / 3600), Math.floor((t % 3600) / 60), t % 60],
    };
  }
  if (rem <= MONTH_SCALE_AT) {
    return {
      scale: "days" as const,
      units: [
        Math.floor(t / 86400),
        Math.floor((t % 86400) / 3600),
        Math.floor((t % 3600) / 60),
        t % 60,
      ],
    };
  }
  const totalSec = Math.round(rem / SEC_MS);
  const monthSec = MONTH_MS / SEC_MS;
  const months = Math.floor(totalSec / monthSec);
  const o = totalSec % monthSec;
  return {
    scale: "months" as const,
    units: [
      months,
      Math.floor(o / 86400),
      Math.floor((o % 86400) / 3600),
      Math.floor((o % 3600) / 60),
      o % 60,
    ],
  };
}

// two cells per unit; 99 is the ceiling so the grid never reflows mid-count
const toDigits = (units: number[]) =>
  units
    .map((n) =>
      String(Math.min(99, Math.max(0, Math.floor(n)))).padStart(2, "0"),
    )
    .join("");

// months here are flat 30-day blocks, so folding them into the ISO duration
// as calendar months would lie to anything reading the <time> attribute —
// but the label row says MONTHS, so the attribute keeps that same unit.
function durationAttr(scale: CountdownScale, units: number[]) {
  const [a, b, c, d, e] = units;
  if (scale === "time") return `PT${a}H${b}M${c}S`;
  if (scale === "days") return `P${a}DT${b}H${c}M${d}S`;
  return `P${a}M${b}DT${c}H${d}M${e}S`;
}

// ---------------------------------------------------------------------------
// VaporCountdown — live countdown where every digit change is a phase
// transition: the outgoing digit sublimates into monochrome grains drifting up
// on curl-noise wind while the incoming digit condenses from the same cloud,
// grains spring-seeking their new glyph homes. Canvas 2D over a real <time>
// element (screen-reader truth). Direct-DOM rAF loop, no React state on the
// hot path; only the seconds column wakes every tick, and only when the
// remaining span crosses a scale boundary (1 day, 30 days) does React re-render
// the row and the canvas get re-seated for the new column count.
// ---------------------------------------------------------------------------

const FLOATS = 6; // grains: x, y, vx, vy, hx, hy · vapor: x, y, vx, vy, age, life
const MAX_GRAINS = 2500; // per digit
const SAMPLE_STRIDE = 3; // px between alpha samples on the glyph raster
const SPRING_K = 90; // s⁻² — hero-gravity-well constants exactly
const ZETA = 0.55; // damping ratio; < 1 gives a soft condensation overshoot
const DRAG = 0.92; // per-frame velocity drag
const DT_MAX = 0.032; // s — clamp tab-switch jumps
const FIELD_SCALE = 0.008; // px → noise units for the wind field
const CURL_EPS = 0.75; // noise-space finite-difference step for curl
const PAD_X = 40; // canvas overdraw so vapor is not clipped at the digits' box
const PAD_TOP = 110;
const PAD_BOTTOM = 20;

type Slot = {
  g: Float32Array; // incoming/settled grains
  v: Float32Array; // sublimating vapor grains
  gc: number;
  vc: number;
  active: boolean;
};

export function VaporCountdown({
  targetDate,
  className = "",
}: {
  /** countdown target */
  targetDate: Date;
  /** extra classes merged onto the rendered root element */
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef<HTMLTimeElement>(null);

  // Date identity churns per render, so key the effect on the epoch instead
  const targetMs = targetDate.getTime();

  // the unit row is a function of the span left, so it lives in state only so
  // React can swap its column count when a boundary is crossed mid-count
  const [scale, setScale] = useState<CountdownScale>(
    () => breakdown(targetMs, Date.now()).scale,
  );

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    const timeEl = timeRef.current;
    if (!root || !canvas || !timeEl) return;

    // the rendered row can lag the span — a swapped target or a boundary that
    // landed between the last tick and now. Re-render the column count and let
    // the next run seat the cells; setScale with the same value is a no-op, so
    // this settles in one extra pass.
    const live = breakdown(targetMs, Date.now());
    if (live.scale !== scale) {
      setScale(live.scale);
      return;
    }

    const digitEls = Array.from(
      root.querySelectorAll<HTMLSpanElement>("[data-vc-digit]"),
    );
    // one effect run per scale: the cell count only moves when the row does
    const cellCount = SCALE_LABELS[scale].length * 2;
    if (digitEls.length !== cellCount) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let disposed = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const parts = () => breakdown(targetMs, Date.now());
    let digits = toDigits(live.units);

    // ---- canvas / particle state (unused under reduced motion) -------------
    const ctx = canvas.getContext("2d");

    // grain color tracks the real foreground token — read fresh on theme
    // change so light/dark both draw legible ink, never a hardcoded hex.
    let grainColor = "#ffffff";
    const updateGrainColor = () => {
      grainColor = getComputedStyle(digitEls[0]).color || grainColor;
    };
    updateGrainColor();

    const slots: Slot[] = Array.from({ length: MAX_UNITS * 2 }, () => ({
      g: new Float32Array(MAX_GRAINS * FLOATS),
      v: new Float32Array(MAX_GRAINS * FLOATS),
      gc: 0,
      vc: 0,
      active: false,
    }));
    let glyphs: Float32Array[] | null = null; // cell-relative homes per digit 0-9
    let cells: { x: number; y: number }[] = [];
    let cw = 0;
    let ch = 0;
    let lastW = 0;
    let lastH = 0;
    let raf = 0;
    let last = 0;
    const dampC = 2 * ZETA * Math.sqrt(SPRING_K); // s⁻¹

    const loop = (now: number) => {
      if (!ctx) return;
      const dt = Math.min(Math.max((now - last) / 1000, 0), DT_MAX);
      last = now;
      ctx.clearRect(0, 0, cw, ch);
      ctx.fillStyle = grainColor;
      let anyActive = false;

      for (let s = 0; s < cellCount; s++) {
        const slot = slots[s];
        const g = slot.g;
        const v = slot.v;

        if (!slot.active) {
          // asleep: grains sit on their homes — one flat pass, no physics
          ctx.globalAlpha = 0.5;
          for (let i = 0; i < slot.gc; i++) {
            const o = i * FLOATS;
            ctx.fillRect(g[o] - 1, g[o + 1] - 1, 2, 2);
          }
          continue;
        }
        anyActive = true;
        let settled = true;

        // incoming grains: underdamped spring toward glyph homes
        for (let i = 0; i < slot.gc; i++) {
          const o = i * FLOATS;
          let x = g[o];
          let y = g[o + 1];
          let vx = g[o + 2];
          let vy = g[o + 3];
          const hx = g[o + 4];
          const hy = g[o + 5];

          vx = (vx + (SPRING_K * (hx - x) - dampC * vx) * dt) * DRAG;
          vy = (vy + (SPRING_K * (hy - y) - dampC * vy) * dt) * DRAG;
          x += vx * dt;
          y += vy * dt;

          g[o] = x;
          g[o + 1] = y;
          g[o + 2] = vx;
          g[o + 3] = vy;

          if (
            Math.abs(x - hx) > 0.5 ||
            Math.abs(y - hy) > 0.5 ||
            Math.abs(vx) > 2 ||
            Math.abs(vy) > 2
          ) {
            settled = false;
          }

          const speed = Math.hypot(vx, vy);
          ctx.globalAlpha = 0.5 + 0.5 * Math.min(1, speed / 500);
          ctx.fillRect(x - 1, y - 1, 2, 2);
        }

        // vapor grains: curl-noise wind, biased upward, alpha fade over life
        let j = 0;
        while (j < slot.vc) {
          const o = j * FLOATS;
          const age = v[o + 4] + dt * 1000;
          const life = v[o + 5];
          if (age >= life) {
            // swap-remove with the last live vapor grain
            const lo = (slot.vc - 1) * FLOATS;
            for (let k = 0; k < FLOATS; k++) v[o + k] = v[lo + k];
            slot.vc--;
            continue;
          }
          v[o + 4] = age;
          let x = v[o];
          let y = v[o + 1];
          let vx = v[o + 2];
          let vy = v[o + 3];

          // wind = curl of the noise field: (∂n/∂y, -∂n/∂x) — divergence-free
          const nx = x * FIELD_SCALE;
          const ny = y * FIELD_SCALE;
          const dndx = noise2(nx + CURL_EPS, ny) - noise2(nx - CURL_EPS, ny);
          const dndy = noise2(nx, ny + CURL_EPS) - noise2(nx, ny - CURL_EPS);
          let wx = dndy;
          let wy = -dndx;
          const cl = Math.hypot(wx, wy) || 1;
          const sp = 40 + 50 * hash2(j * 1.31, s * 7.7); // 40-90 px/s per grain
          wx = (wx / cl) * sp * 0.6;
          wy = (wy / cl) * sp * 0.6 - sp * 0.8; // upward bias
          const mix = Math.min(1, dt * 5);
          vx += (wx - vx) * mix;
          vy += (wy - vy) * mix;
          x += vx * dt;
          y += vy * dt;

          v[o] = x;
          v[o + 1] = y;
          v[o + 2] = vx;
          v[o + 3] = vy;

          const speed = Math.hypot(vx, vy);
          ctx.globalAlpha =
            (1 - age / life) * (0.5 + 0.5 * Math.min(1, speed / 500));
          ctx.fillRect(x - 1, y - 1, 2, 2);
          j++;
        }
        if (slot.vc > 0) settled = false;

        if (settled) {
          // snap to homes and let the column sleep
          for (let i = 0; i < slot.gc; i++) {
            const o = i * FLOATS;
            g[o] = g[o + 4];
            g[o + 1] = g[o + 5];
            g[o + 2] = 0;
            g[o + 3] = 0;
          }
          slot.active = false;
        }
      }
      ctx.globalAlpha = 1;
      raf = anyActive ? requestAnimationFrame(loop) : 0;
    };

    const wake = () => {
      if (!raf && ctx) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };

    const transition = (s: number, d: number) => {
      if (!glyphs) return;
      const slot = slots[s];
      const g = slot.g;
      const v = slot.v;

      // outgoing digit sublimates: grains move to the vapor pool
      let vc = 0;
      for (let i = 0; i < slot.gc && vc < MAX_GRAINS; i++) {
        const o = i * FLOATS;
        const vo = vc * FLOATS;
        v[vo] = g[o];
        v[vo + 1] = g[o + 1];
        v[vo + 2] = g[o + 2] * 0.4;
        v[vo + 3] = g[o + 3] * 0.4 - 12; // small upward kick at release
        v[vo + 4] = 0;
        v[vo + 5] = 600 + Math.random() * 300; // ms lifespan
        vc++;
      }
      slot.vc = vc;

      // incoming digit condenses out of the departing cloud region
      const homes = glyphs[d];
      const cell = cells[s];
      const n = homes.length / 2;
      slot.gc = n;
      for (let i = 0; i < n; i++) {
        const o = i * FLOATS;
        const hx = cell.x + homes[i * 2];
        const hy = cell.y + homes[i * 2 + 1];
        if (vc > 0) {
          const src = ((Math.random() * vc) | 0) * FLOATS;
          g[o] = v[src] + (Math.random() - 0.5) * 10;
          g[o + 1] = v[src + 1] + (Math.random() - 0.5) * 10;
          g[o + 2] = (Math.random() - 0.5) * 40;
          g[o + 3] = -20 - Math.random() * 40;
        } else {
          g[o] = hx;
          g[o + 1] = hy;
          g[o + 2] = 0;
          g[o + 3] = 0;
        }
        g[o + 4] = hx;
        g[o + 5] = hy;
      }
      slot.active = true;
    };

    const init = () => {
      if (!ctx) return;
      const rootRect = root.getBoundingClientRect();
      const w = Math.round(rootRect.width);
      const h = Math.round(rootRect.height);
      if (w < 2 || h < 2) return;
      lastW = w;
      lastH = h;
      cw = w + PAD_X * 2;
      ch = h + PAD_TOP + PAD_BOTTOM;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      cells = digitEls.map((el) => {
        const r = el.getBoundingClientRect();
        return {
          x: r.left - rootRect.left + PAD_X,
          y: r.top - rootRect.top + PAD_TOP,
        };
      });

      // rasterize glyphs 0-9 once — tabular figures make every cell identical
      const cellRect = digitEls[0].getBoundingClientRect();
      const gw = Math.max(2, Math.ceil(cellRect.width));
      const gh = Math.max(2, Math.ceil(cellRect.height));
      const off = document.createElement("canvas");
      off.width = gw;
      off.height = gh;
      const octx = off.getContext("2d", { willReadFrequently: true });
      if (!octx) return;
      const cs = getComputedStyle(digitEls[0]);
      octx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      octx.textAlign = "center";
      octx.textBaseline = "middle";
      octx.fillStyle = "#ffffff";
      glyphs = [];
      for (let d = 0; d < 10; d++) {
        octx.clearRect(0, 0, gw, gh);
        octx.fillText(String(d), gw / 2, gh / 2);
        const alpha = octx.getImageData(0, 0, gw, gh).data;
        const pts: number[] = [];
        for (let y = 1; y < gh; y += SAMPLE_STRIDE) {
          const row = y * gw;
          for (let x = 1; x < gw; x += SAMPLE_STRIDE) {
            if (alpha[(row + x) * 4 + 3] > 128) pts.push(x, y);
          }
        }
        const total = pts.length / 2;
        const keepEvery = Math.max(1, Math.ceil(total / MAX_GRAINS));
        const homes = new Float32Array(Math.ceil(total / keepEvery) * 2);
        let n = 0;
        for (let i = 0; i < total; i += keepEvery) {
          homes[n * 2] = pts[i * 2];
          homes[n * 2 + 1] = pts[i * 2 + 1];
          n++;
        }
        glyphs.push(homes.subarray(0, n * 2));
      }

      // seat every slot on its current digit, settled — calm first paint
      for (let s = 0; s < cellCount; s++) {
        const slot = slots[s];
        const homes = glyphs[Number(digits.charAt(s))];
        const cell = cells[s];
        const n = homes.length / 2;
        slot.gc = n;
        slot.vc = 0;
        slot.active = false;
        for (let i = 0; i < n; i++) {
          const o = i * FLOATS;
          const hx = cell.x + homes[i * 2];
          const hy = cell.y + homes[i * 2 + 1];
          slot.g[o] = hx;
          slot.g[o + 1] = hy;
          slot.g[o + 2] = 0;
          slot.g[o + 3] = 0;
          slot.g[o + 4] = hx;
          slot.g[o + 5] = hy;
        }
      }
      wake(); // one paint, then the loop sleeps until the next tick
    };

    // ---- clock: rAF wakes on each second boundary --------------------------
    const schedule = () => {
      timer = setTimeout(tick, 1000 - (Date.now() % 1000) + 15);
    };
    const applyDateTime = (units: number[]) => {
      timeEl.setAttribute("datetime", durationAttr(scale, units));
    };
    const tick = () => {
      const { scale: nextScale, units } = parts();
      if (nextScale !== scale) {
        // a boundary moved the row between H:M:S, D:H:M:S and MONTHS:DAYS —
        // hand it to React, the next effect run re-seats every cell
        setScale(nextScale);
        return;
      }
      const next = toDigits(units);
      if (next !== digits) {
        for (let s = 0; s < cellCount; s++) {
          if (next.charAt(s) !== digits.charAt(s)) {
            digitEls[s].textContent = next.charAt(s);
            if (!reduced) transition(s, Number(next.charAt(s)));
          }
        }
        digits = next;
        applyDateTime(units);
        if (!reduced) wake();
      }
      if (Date.now() < targetMs) schedule();
    };

    for (let s = 0; s < cellCount; s++) {
      digitEls[s].textContent = digits.charAt(s);
    }
    applyDateTime(live.units);
    if (Date.now() < targetMs) schedule();

    if (reduced || !ctx) {
      // reduced motion: canvas stays hidden (CSS), the real <time> is visible
      return () => {
        disposed = true;
        if (timer) clearTimeout(timer);
      };
    }

    let ro: ResizeObserver | undefined;
    // raster only after Geist has loaded — a fallback-font raster is wrong
    document.fonts.ready.then(() => {
      if (disposed) return;
      init();
      ro = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) return;
        const w = Math.round(entry.contentRect.width);
        const h = Math.round(entry.contentRect.height);
        if (w !== lastW || h !== lastH) init();
      });
      ro.observe(root);
    });

    // re-derive grain color on theme toggle — class/data-theme flips on
    // documentElement, and OS-level scheme changes fire through matchMedia.
    const onThemeChange = () => {
      updateGrainColor();
      wake();
    };
    const mo = new MutationObserver(onThemeChange);
    mo.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });
    const colorScheme = window.matchMedia("(prefers-color-scheme: dark)");
    colorScheme.addEventListener("change", onThemeChange);

    return () => {
      disposed = true;
      if (timer) clearTimeout(timer);
      cancelAnimationFrame(raf);
      raf = 0;
      ro?.disconnect();
      mo.disconnect();
      colorScheme.removeEventListener("change", onThemeChange);
    };
  }, [targetMs, scale]);

  const row = SCALE_LABELS[scale];

  return (
    <div
      ref={rootRef}
      className={`relative inline-grid select-none ${className}`}
      style={{
        gridTemplateColumns: `repeat(${row.length}, auto)`,
        columnGap: "0.45em",
        rowGap: "0.75rem",
        fontSize: "clamp(2.5rem, 8vw, 5rem)",
      }}
    >
      {/* real element: screen-reader truth; visible static under reduced motion */}
      <time ref={timeRef} aria-live="off" style={{ display: "contents" }}>
        {row.map((unit) => (
          <span
            key={unit}
            className="flex justify-center font-semibold leading-none tracking-tight text-foreground opacity-0 tabular-nums motion-reduce:opacity-100"
          >
            <span data-vc-digit>0</span>
            <span data-vc-digit>0</span>
          </span>
        ))}
      </time>
      {row.map((label) => (
        <span
          key={label}
          className="text-center font-mono text-xs text-muted-foreground tracking-widest"
        >
          {label}
        </span>
      ))}
      <canvas
        ref={canvasRef}
        aria-hidden
        className="pointer-events-none absolute motion-reduce:hidden"
        style={{
          left: -PAD_X,
          top: -PAD_TOP,
          width: `calc(100% + ${PAD_X * 2}px)`,
          height: `calc(100% + ${PAD_TOP + PAD_BOTTOM}px)`,
        }}
      />
    </div>
  );
}

export default VaporCountdown;
