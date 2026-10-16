import { fetchBackend } from "@/lib/api";
import type { RegisterFormValues } from "../schema/form-schema";

export function normalizePhoneNumber(phone: string): string {
  let rawPhone = phone.trim().replace(/[\s-]/g, "");
  if (rawPhone.startsWith("+880")) {
    // already in international format
  } else if (rawPhone.startsWith("880")) {
    rawPhone = `+${rawPhone}`;
  } else if (rawPhone.startsWith("0")) {
    rawPhone = `+880${rawPhone.slice(1)}`;
  } else {
    rawPhone = `+880${rawPhone}`;
  }
  return rawPhone;
}

export function buildRegisterPayload(
  value: RegisterFormValues,
): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    full_name: value.fullName.trim(),
    email: value.email.trim().toLowerCase(),
    phone_number: normalizePhoneNumber(value.phone),
    password: value.password,
    gender: value.gender,
    batch_year: Number.parseInt(value.batchYear.trim(), 10),
    tee_shirt_size: value.teeShirtSize,
    academic_group: value.academicGroup || null,
    student_id: value.studentId?.trim() || null,
    referrer_reg_code: value.referrerRegCode?.trim() || null,
    acquaintances: [],
  };

  // Work profile — the form schema already enforces all-or-nothing,
  // so just map it (all empty => null).
  const org = value.organization?.trim() ?? "";
  const dept = value.department?.trim() ?? "";
  const desig = value.designation?.trim() ?? "";

  payload.work_profile =
    org && dept && desig
      ? {
          organization_name: org,
          department_or_division: dept,
          designation: desig,
        }
      : null;

  // Address is mandatory — required for payment validation (SSLCommerz
  // needs a complete billing address to initiate/verify payments).
  payload.address = {
    street_address: value.streetAddress.trim(),
    city: value.city.trim(),
    state_or_province: value.state.trim(),
    postal_code: value.postalCode.trim(),
    country: value.country.trim(),
  };

  return payload;
}

function extractErrorDetail(res: Response, errorData: unknown): string {
  if (errorData && typeof errorData === "object" && "detail" in errorData) {
    const detail = (errorData as { detail: unknown }).detail;
    if (Array.isArray(detail)) {
      return detail
        .map((d: { msg?: string }) => d.msg || "Invalid input")
        .join(", ");
    }
    return String(detail);
  }
  return `Registration failed (${res.status})`;
}

export async function registerAlum(
  value: RegisterFormValues,
): Promise<Response> {
  const payload = buildRegisterPayload(value);
  const res = await fetchBackend("/auth/register", "POST", payload);

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(extractErrorDetail(res, errorData));
  }

  return res;
}
