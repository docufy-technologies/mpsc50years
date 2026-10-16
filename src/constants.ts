export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
export const GENDER_OPTIONS = ["male", "female"] as const;
export type GenderOption = (typeof GENDER_OPTIONS)[number];
export const TEE_SHIRT_SIZE_OPTIONS = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
  "XXXL",
] as const;
export const ACADEMIC_GROUP_OPTIONS = [
  "science",
  "humanities",
  "business_studies",
] as const;
