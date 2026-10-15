import {
  IconBriefcase,
  IconBuilding,
  IconId,
  IconMail,
  IconMapPin,
  IconPhone,
  IconShirt,
  IconUser,
  IconUserPlus,
} from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { toast } from "sonner";
import * as v from "valibot";

import { FormInput } from "@/components/form-input";
import { FormInputGroup } from "@/components/form-input-group";
import { FormPasswordInput } from "@/components/form-password-input";
import { FormSelect } from "@/components/form-select";
import AnimatedButton from "@/components/ui/animated-button";
import { FieldGroup } from "@/components/ui/field";
import { InputGroupText } from "@/components/ui/input-group";
import { fetchBackend } from "@/lib/api";

const registerSchema = v.object({
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
    ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
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

const validatedRegisterSchema = v.pipe(
  registerSchema,
  v.check((input) => {
    const hasOrg = Boolean(input.organization?.trim());
    const hasDept = Boolean(input.department?.trim());
    const hasDesig = Boolean(input.designation?.trim());

    const count = Number(hasOrg) + Number(hasDept) + Number(hasDesig);
    // Either none are filled, or all 3 are filled
    return count === 0 || count === 3;
  }, "If you provide work profile details, please complete all 3 fields: Organization Name, Department, and Designation."),
);

type RegisterFormValues = v.InferOutput<typeof validatedRegisterSchema>;

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <fieldset className="grid gap-3.5 border-b border-border/50 pb-8 last:border-b-0">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{title}</h2>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </fieldset>
  );
}

export const Route = createFileRoute("/register")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const defaultValues: RegisterFormValues = {
    fullName: "",
    email: "",
    phone: "",
    password: "",
    batchYear: "",
    teeShirtSize: "L",
    academicGroup: "science" as
      | "science"
      | "humanities"
      | "business_studies"
      | undefined,
    studentId: "",
    referrerRegCode: "",
    organization: "",
    department: "",
    designation: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Bangladesh",
  };

  const form = useForm({
    defaultValues,
    validators: {
      onChange: validatedRegisterSchema,
    },
    onSubmit: async ({ value }) => {
      // Format phone number to standard international format or clean representation
      let rawPhone = value.phone.trim().replace(/[\s-]/g, "");
      if (rawPhone.startsWith("+880")) {
        // already has +880
      } else if (rawPhone.startsWith("880")) {
        rawPhone = `+${rawPhone}`;
      } else if (rawPhone.startsWith("0")) {
        rawPhone = `+880${rawPhone.slice(1)}`;
      } else {
        rawPhone = `+880${rawPhone}`;
      }

      // Build payload matching backend AlumRegister schema
      const payload: Record<string, unknown> = {
        full_name: value.fullName.trim(),
        email: value.email.trim().toLowerCase(),
        phone_number: rawPhone,
        password: value.password,
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

      try {
        const res = await fetchBackend("/auth/register", "POST", payload);

        if (res.ok) {
          toast.success(
            "Registration successful! Welcome to the Golden Jubilee.",
          );
          form.reset();
          navigate({ to: "/profile" });
        } else {
          const errorData = await res.json().catch(() => null);
          const detail =
            errorData && typeof errorData === "object" && "detail" in errorData
              ? Array.isArray(errorData.detail)
                ? errorData.detail
                    .map((d: { msg?: string }) => d.msg || "Invalid input")
                    .join(", ")
                : String(errorData.detail)
              : `Registration failed (${res.status})`;
          toast.error(detail);
        }
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "An unexpected network error occurred",
        );
      }
    },
  });

  return (
    <section className="min-h-screen pb-20 pt-32 max-w-3xl px-4 mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Alumni Registration
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Join the 50 Years Golden Jubilee celebration of MPSC
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        <FormSection title="Personal Information">
          <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <form.Field name="fullName">
              {(field) => (
                <FormInput
                  field={field}
                  id="full-name"
                  label="Full Name"
                  placeholder="Your full name"
                />
              )}
            </form.Field>

            <form.Field name="phone">
              {(field) => (
                <FormInputGroup
                  field={field}
                  id="phone"
                  label="Phone Number"
                  type="tel"
                  placeholder="1XXX-XXXXXX"
                  startAddon={
                    <InputGroupText>
                      <IconPhone className="size-3.5" />
                      +880
                    </InputGroupText>
                  }
                />
              )}
            </form.Field>

            <form.Field name="email">
              {(field) => (
                <FormInputGroup
                  field={field}
                  id="email"
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  startAddon={<IconMail className="size-3.5" />}
                />
              )}
            </form.Field>

            <form.Field name="password">
              {(field) => (
                <FormPasswordInput
                  field={field}
                  id="password"
                  label="Password"
                  placeholder="Create a password"
                />
              )}
            </form.Field>
          </FieldGroup>
        </FormSection>

        <FormSection
          title="Alumni Verification"
          description="Provide your academic details to help verify your records."
        >
          <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <form.Field name="batchYear">
              {(field) => (
                <FormInputGroup
                  field={field}
                  id="batch-year"
                  label="Passing Year"
                  placeholder="e.g. 2018"
                  inputMode="numeric"
                  maxLength={4}
                  endAddon={<InputGroupText>Year</InputGroupText>}
                />
              )}
            </form.Field>

            <form.Field name="academicGroup">
              {(field) => (
                <FormSelect
                  field={field}
                  id="academic-group"
                  label="Academic Group"
                  optional
                  items={[
                    { value: "science", label: "Science" },
                    { value: "humanities", label: "Humanities" },
                    { value: "business_studies", label: "Business Studies" },
                  ]}
                />
              )}
            </form.Field>

            <form.Field name="teeShirtSize">
              {(field) => (
                <FormSelect
                  field={field}
                  id="tee-shirt-size"
                  label="T-Shirt Size"
                  triggerPrefix={
                    <IconShirt className="size-3.5 text-muted-foreground" />
                  }
                  items={[
                    { value: "XS", label: "XS" },
                    { value: "S", label: "S" },
                    { value: "M", label: "M" },
                    { value: "L", label: "L" },
                    { value: "XL", label: "XL" },
                    { value: "XXL", label: "XXL" },
                    { value: "XXXL", label: "XXXL" },
                  ]}
                />
              )}
            </form.Field>

            <form.Field name="studentId">
              {(field) => (
                <FormInputGroup
                  field={field}
                  id="student-id"
                  label="Student ID"
                  optional
                  placeholder="Student ID"
                  startAddon={<IconId className="size-3.5" />}
                />
              )}
            </form.Field>

            <form.Field name="referrerRegCode">
              {(field) => (
                <FormInputGroup
                  field={field}
                  id="referrer-reg-code"
                  label="Referral Code"
                  optional
                  placeholder="Referrer's Code"
                  startAddon={<IconUserPlus className="size-3.5" />}
                />
              )}
            </form.Field>
          </FieldGroup>
        </FormSection>

        <FormSection
          title="Work Profile"
          description="Your professional background. If any field is entered, all three fields must be completed."
        >
          <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <form.Field
              name="organization"
              validators={{
                onChangeListenTo: ["department", "designation"],
                onChange: ({ value, fieldApi }) => {
                  const formValues = fieldApi.form.state.values;
                  const hasAny = Boolean(
                    value?.trim() ||
                      formValues.department?.trim() ||
                      formValues.designation?.trim(),
                  );
                  if (hasAny && !value?.trim()) {
                    return "Organization name is required if work profile is provided";
                  }
                  return undefined;
                },
              }}
            >
              {(field) => {
                const formValues = field.form.state.values;
                const hasAny = Boolean(
                  field.state.value?.trim() ||
                    formValues.department?.trim() ||
                    formValues.designation?.trim(),
                );
                return (
                  <FormInputGroup
                    field={field}
                    id="organization"
                    label="Organization Name"
                    optional={!hasAny}
                    placeholder="Company or Organization"
                    startAddon={<IconBuilding className="size-3.5" />}
                  />
                );
              }}
            </form.Field>

            <form.Field
              name="department"
              validators={{
                onChangeListenTo: ["organization", "designation"],
                onChange: ({ value, fieldApi }) => {
                  const formValues = fieldApi.form.state.values;
                  const hasAny = Boolean(
                    value?.trim() ||
                      formValues.organization?.trim() ||
                      formValues.designation?.trim(),
                  );
                  if (hasAny && !value?.trim()) {
                    return "Department is required if work profile is provided";
                  }
                  return undefined;
                },
              }}
            >
              {(field) => {
                const formValues = field.form.state.values;
                const hasAny = Boolean(
                  field.state.value?.trim() ||
                    formValues.organization?.trim() ||
                    formValues.designation?.trim(),
                );
                return (
                  <FormInputGroup
                    field={field}
                    id="department"
                    label="Division / Department"
                    optional={!hasAny}
                    placeholder="e.g. Engineering"
                    startAddon={<IconBriefcase className="size-3.5" />}
                  />
                );
              }}
            </form.Field>

            <form.Field
              name="designation"
              validators={{
                onChangeListenTo: ["organization", "department"],
                onChange: ({ value, fieldApi }) => {
                  const formValues = fieldApi.form.state.values;
                  const hasAny = Boolean(
                    value?.trim() ||
                      formValues.organization?.trim() ||
                      formValues.department?.trim(),
                  );
                  if (hasAny && !value?.trim()) {
                    return "Designation is required if work profile is provided";
                  }
                  return undefined;
                },
              }}
            >
              {(field) => {
                const formValues = field.form.state.values;
                const hasAny = Boolean(
                  field.state.value?.trim() ||
                    formValues.organization?.trim() ||
                    formValues.department?.trim(),
                );
                return (
                  <FormInputGroup
                    field={field}
                    id="designation"
                    label="Designation"
                    optional={!hasAny}
                    placeholder="e.g. Software Engineer"
                    startAddon={<IconUser className="size-3.5" />}
                  />
                );
              }}
            </form.Field>
          </FieldGroup>
        </FormSection>

        <FormSection
          title="Address"
          description="Where you are currently residing. Address is mandatory — it is required for payment validation, as SSLCommerz needs a complete billing address to initiate and verify payments."
        >
          <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <form.Field name="streetAddress">
                {(field) => (
                  <FormInputGroup
                    field={field}
                    id="street-address"
                    label="Street Address"
                    placeholder="House, road, and street"
                    startAddon={<IconMapPin className="size-3.5" />}
                  />
                )}
              </form.Field>
            </div>

            <form.Field name="city">
              {(field) => (
                <FormInput
                  field={field}
                  id="city"
                  label="City"
                  placeholder="City"
                />
              )}
            </form.Field>

            <form.Field name="state">
              {(field) => (
                <FormInput
                  field={field}
                  id="state"
                  label="State / Division"
                  placeholder="State or Division"
                />
              )}
            </form.Field>

            <form.Field name="postalCode">
              {(field) => (
                <FormInput
                  field={field}
                  id="postal-code"
                  label="Postal Code"
                  placeholder="Postal code"
                />
              )}
            </form.Field>

            <form.Field name="country">
              {(field) => (
                <FormInput
                  field={field}
                  id="country"
                  label="Country"
                  placeholder="Country"
                />
              )}
            </form.Field>
          </FieldGroup>
        </FormSection>

        <div className="flex justify-center pt-4">
          <form.Subscribe
            selector={(state) => ({
              canSubmit: state.canSubmit,
              isSubmitting: state.isSubmitting,
            })}
          >
            {({ canSubmit, isSubmitting }) => (
              <AnimatedButton
                type="submit"
                disabled={!canSubmit}
                className="w-full sm:w-auto px-8"
              >
                {isSubmitting ? "Submitting..." : "Register as an Alumna"}
              </AnimatedButton>
            )}
          </form.Subscribe>
        </div>
      </form>
    </section>
  );
}
