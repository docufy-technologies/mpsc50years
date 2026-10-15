export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export const GENDER_OPTIONS = ["male", "female"] as const;

export type GenderOption = (typeof GENDER_OPTIONS)[number];
