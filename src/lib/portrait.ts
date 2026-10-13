const HONORIFICS =
  /\b(professor|prof|engineer|colonel|retd|mr|mrs|ms|miss|dr)\b\.?/gi;

/** "Mrs. Arifa Khanom Papia" -> "arifa-khanom-papia" */
export function slugify(name: string) {
  return name
    .replace(/\(.*?\)/g, " ")
    .replace(HONORIFICS, " ")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** The honorific-stripped slug for Dr. M. Tamim is kept stable by this alias. */
const photos = import.meta.glob<string>(
  "/src/assets/committee/*.{jpg,jpeg,png,webp,avif}",
  { eager: true, import: "default", query: "?url" },
);

const photoBySlug = new Map<string, string>(
  Object.entries(photos).map(([path, url]) => [
    path
      .split("/")
      .pop()
      ?.replace(/\.[^.]+$/, "") ?? path,
    url,
  ]),
);

export function photoFor(name: string, override?: string) {
  return override ?? photoBySlug.get(slugify(name));
}

/** Stable hue (0-360) per name so placeholders are gently varied. */
export function hueFor(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
}
