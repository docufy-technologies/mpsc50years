import * as v from "valibot";
import { TEE_SHIRT_SIZE_OPTIONS } from "@/constants";

export const registerSchema = v.object({
  fullName: v.pipe(
    v.string("Full name is required"),
    v.trim(),
    v.minLength(2, "Full name must be at least 2 characters"),
    v.maxLength(150, "Full name must not exceed 150 characters"),
  ),
  email: v.pipe(
    v.string("Email is required"),
    v.trim(),
    v.email("Invalid email address"),
  ),
  phone: v.pipe(
    v.string("Phone number is required"),
    v.trim(),
    v.regex(
      /^(?:\+?880|0)?1[3-9]\d{8}$/,
      "Please enter a valid Bangladeshi phone number (e.g. 01712345678 or 1712345678)",
    ),
  ),
  password: v.pipe(
    v.string("Password is required"),
    v.minLength(8, "Password must be at least 8 characters"),
    v.maxLength(128, "Password must not exceed 128 characters"),
  ),
  gender: v.picklist(["male", "female"], "Please select a gender"),
  batchYear: v.pipe(
    v.string("Passing year is required"),
    v.trim(),
    v.regex(/^\d{4}$/, "Must be a 4-digit year"),
    v.check((val) => {
      const year = Number.parseInt(val, 10);
      return year >= 1976 && year <= new Date().getFullYear();
    }, `Passing year must be between 1976 and ${new Date().getFullYear()}`),
  ),
  teeShirtSize: v.picklist(
    TEE_SHIRT_SIZE_OPTIONS,
    "Please select a valid size",
  ),
  academicGroup: v.optional(
    v.picklist(
      ["science", "humanities", "business_studies"],
      "Invalid academic group",
    ),
  ),
  studentId: v.optional(v.string()),
  referrerRegCode: v.optional(v.string()),

  // Work profile (optional fields, but if one is filled, all three are required)
  organization: v.optional(v.string()),
  department: v.optional(v.string()),
  designation: v.optional(v.string()),

  // Address (mandatory — required for payment validation via SSLCommerz)
  streetAddress: v.pipe(
    v.string("Street address is required"),
    v.trim(),
    v.minLength(3, "Street address must be at least 3 characters"),
    v.maxLength(255, "Street address must not exceed 255 characters"),
  ),
  city: v.pipe(
    v.string("City is required"),
    v.trim(),
    v.minLength(2, "City must be at least 2 characters"),
    v.maxLength(100, "City must not exceed 100 characters"),
  ),
  state: v.pipe(
    v.string("State / Division is required"),
    v.trim(),
    v.minLength(2, "State / Division must be at least 2 characters"),
    v.maxLength(100, "State / Division must not exceed 100 characters"),
  ),
  postalCode: v.pipe(
    v.string("Postal code is required"),
    v.trim(),
    v.minLength(2, "Postal code must be at least 2 characters"),
    v.maxLength(20, "Postal code must not exceed 20 characters"),
  ),
  country: v.pipe(
    v.string("Country is required"),
    v.trim(),
    v.minLength(2, "Country must be at least 2 characters"),
    v.maxLength(100, "Country must not exceed 100 characters"),
  ),
});

export const validatedRegisterSchema = v.pipe(
  registerSchema,
  v.check((input) => {
    const hasOrg = Boolean(input.organization?.trim());
    const hasDept = Boolean(input.department?.trim());
    const hasDesignation = Boolean(input.designation?.trim());

    const count = Number(hasOrg) + Number(hasDept) + Number(hasDesignation);
    // Either none are filled, or all 3 are filled
    return count === 0 || count === 3;
  }, "If you provide work profile details, please complete all 3 fields: Organization Name, Department, and Designation."),
);

export type RegisterFormValues = v.InferOutput<typeof validatedRegisterSchema>;
