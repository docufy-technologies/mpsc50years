/**
 * Options for the "Get Involved" forms. Kept in sync with the backend
 * literals in `mpsc50yapi/app/constants.py` and `app/schemas/involve.py`.
 */

/** Mirrors `SUBCOMMITTEE_NAMES` on the backend. */
export const SUBCOMMITTEE_NAMES = [
  "Registration",
  "Food and Hospitality",
  "Cultural Program",
  "Publicity",
  "Logistics",
  "Finance",
] as const;

/** Mirrors `StallApplicationInput.category`. */
export const STALL_CATEGORIES = [
  "food",
  "fashion",
  "books",
  "crafts",
  "services",
  "other",
] as const;

/** Mirrors `SponsorOfferInput.sponsor_type`. */
export const SPONSOR_TYPES = ["individual", "company", "in_kind"] as const;

/** Mirrors `OpenMicEntryInput.performance_type`. */
export const PERFORMANCE_TYPES = [
  "singer",
  "musician",
  "poet",
  "storyteller",
  "stand-up",
  "dancer",
  "other",
] as const;

/** Mirrors `settings.openmic_max_duration_minutes` on the backend. */
export const OPENMIC_MAX_DURATION_MINUTES = 10;

/** Turns a snake_case enum value into a human label ("in_kind" → "In Kind"). */
export function formatOptionLabel(value: string): string {
  return value
    .split(/[_\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
