import * as v from "valibot";

const workProfileSchema = v.object({
  uuid: v.string(),
  organization_name: v.string(),
  designation: v.string(),
  department_or_division: v.string(),
});

const addressSchema = v.object({
  street_address: v.string(),
  city: v.string(),
  state_or_province: v.string(),
  postal_code: v.string(),
  country: v.string(),
});

const profileSchema = v.object({
  uuid: v.string(),
  reg_code: v.nullable(v.string()),
  student_id: v.nullable(v.string()),
  batch_year: v.number(),
  tee_shirt_size: v.string(),
  gender: v.string(),
  academic_group: v.nullable(v.string()),
  registered_at: v.string(),
  profile_picture: v.nullable(v.string()),
  work_profile: v.nullable(workProfileSchema),
  address: addressSchema,
});

export const currentUserSchema = v.object({
  uuid: v.string(),
  full_name: v.string(),
  email: v.string(),
  phone_number: v.string(),
  status: v.picklist(["pending", "confirmed", "cancelled"]),
  created_at: v.string(),
  profile: v.nullable(profileSchema),
  payment: v.object({
    has_paid: v.boolean(),
    latest_status: v.string(),
    amount: v.nullable(v.number()),
    transaction_reference: v.nullable(v.string()),
    paid_at: v.nullable(v.string()),
  }),
  acquaintances: v.array(
    v.object({
      uuid: v.string(),
      full_name: v.string(),
      relation: v.string(),
      age_group: v.string(),
    }),
  ),
});

export const loginSchema = v.object({
  email: v.pipe(
    v.string("Email is required"),
    v.trim(),
    v.email("Invalid email address"),
  ),
  password: v.pipe(
    v.string("Password is required"),
    v.minLength(8, "Password must be at least 8 characters"),
    v.maxLength(128, "Password must not exceed 128 characters"),
  ),
});

export type CurrentUser = v.InferOutput<typeof currentUserSchema>;
export type LoginInput = v.InferOutput<typeof loginSchema>;
