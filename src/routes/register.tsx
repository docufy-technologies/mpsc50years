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
import { useState } from "react";
import { toast } from "sonner";
import * as v from "valibot";

import AnimatedButton from "@/components/ui/animated-button";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  teeShirtSize: v.pipe(
    v.string("T-Shirt size is required"),
    v.picklist(
      ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
      "Please select a valid size",
    ),
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

  // Address (optional fields)
  streetAddress: v.optional(v.string()),
  city: v.optional(v.string()),
  state: v.optional(v.string()),
  postalCode: v.optional(v.string()),
  country: v.optional(v.string()),
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

type RegisterFormValues = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  batchYear: string;
  teeShirtSize: string;
  academicGroup?: "science" | "humanities" | "business_studies";
  studentId: string;
  referrerRegCode: string;
  organization: string;
  department: string;
  designation: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const inputClass = "h-8 w-full text-sm";
const groupClass = "h-8";

function Field({
  label,
  htmlFor,
  optional = false,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="grid min-w-0 gap-1.5 pb-2">
      <label htmlFor={htmlFor} className="text-sm font-medium leading-none">
        {label}
        {optional && (
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            Optional
          </span>
        )}
      </label>
      {children}
      {error && <span className="text-xs text-destructive">{error}</span>}
    </div>
  );
}

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    defaultValues: {
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
    } as RegisterFormValues,
    onSubmit: async ({ value }) => {
      // Validate with valibot
      const validation = v.safeParse(validatedRegisterSchema, value);
      if (!validation.success) {
        const firstError = validation.issues[0]?.message || "Validation failed";
        toast.error(firstError);
        return;
      }

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
        student_id: value.studentId.trim() || null,
        referrer_reg_code: value.referrerRegCode.trim() || null,
        acquaintances: [],
      };

      // Work profile (all 3 must be filled if any is provided)
      const org = value.organization.trim();
      const dept = value.department.trim();
      const desig = value.designation.trim();

      if (org || dept || desig) {
        if (!org || !dept || !desig) {
          toast.error(
            "Please fill in Organization Name, Department, and Designation, or leave all three empty.",
          );
          return;
        }
        payload.work_profile = {
          organization_name: org,
          department_or_division: dept,
          designation: desig,
        };
      } else {
        payload.work_profile = null;
      }

      // Address (all 5 required by backend schema if address object is provided)
      if (
        value.streetAddress.trim() ||
        value.city.trim() ||
        value.state.trim() ||
        value.postalCode.trim() ||
        value.country.trim()
      ) {
        payload.address = {
          street_address: value.streetAddress.trim() || "N/A",
          city: value.city.trim() || "N/A",
          state_or_province: value.state.trim() || "N/A",
          postal_code: value.postalCode.trim() || "N/A",
          country: value.country.trim() || "Bangladesh",
        };
      } else {
        payload.address = null;
      }

      setIsSubmitting(true);
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
      } finally {
        setIsSubmitting(false);
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <form.Field
              name="fullName"
              validators={{
                onChange: ({ value }) => {
                  const res = v.safeParse(
                    v.pipe(
                      v.string(),
                      v.trim(),
                      v.minLength(2, "Name must be at least 2 characters"),
                      v.maxLength(150, "Name too long"),
                    ),
                    value,
                  );
                  return res.success ? undefined : res.issues[0]?.message;
                },
              }}
            >
              {(field) => (
                <Field
                  label="Full Name"
                  htmlFor="full-name"
                  error={field.state.meta.errors[0]?.toString()}
                >
                  <Input
                    id="full-name"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Your full name"
                    className={inputClass}
                    aria-invalid={
                      field.state.meta.errors.length > 0 ? "true" : undefined
                    }
                  />
                </Field>
              )}
            </form.Field>

            <form.Field
              name="phone"
              validators={{
                onChange: ({ value }) => {
                  const res = v.safeParse(
                    v.pipe(
                      v.string(),
                      v.trim(),
                      v.regex(
                        /^(?:\+?880|0)?1[3-9]\d{8}$/,
                        "Invalid BD phone (e.g. 017XXXXXXXX)",
                      ),
                    ),
                    value,
                  );
                  return res.success ? undefined : res.issues[0]?.message;
                },
              }}
            >
              {(field) => (
                <Field
                  label="Phone Number"
                  htmlFor="phone"
                  error={field.state.meta.errors[0]?.toString()}
                >
                  <InputGroup className={groupClass}>
                    <InputGroupAddon>
                      <InputGroupText>
                        <IconPhone className="size-3.5" />
                        +880
                      </InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput
                      id="phone"
                      name={field.name}
                      type="tel"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="1XXX-XXXXXX"
                      aria-invalid={
                        field.state.meta.errors.length > 0 ? "true" : undefined
                      }
                    />
                  </InputGroup>
                </Field>
              )}
            </form.Field>

            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) => {
                  const res = v.safeParse(
                    v.pipe(
                      v.string(),
                      v.trim(),
                      v.email("Invalid email format"),
                    ),
                    value,
                  );
                  return res.success ? undefined : res.issues[0]?.message;
                },
              }}
            >
              {(field) => (
                <Field
                  label="Email Address"
                  htmlFor="email"
                  error={field.state.meta.errors[0]?.toString()}
                >
                  <InputGroup className={groupClass}>
                    <InputGroupAddon>
                      <IconMail className="size-3.5" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="email"
                      name={field.name}
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="you@example.com"
                      aria-invalid={
                        field.state.meta.errors.length > 0 ? "true" : undefined
                      }
                    />
                  </InputGroup>
                </Field>
              )}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) => {
                  const res = v.safeParse(
                    v.pipe(
                      v.string(),
                      v.minLength(8, "Must be at least 8 characters"),
                    ),
                    value,
                  );
                  return res.success ? undefined : res.issues[0]?.message;
                },
              }}
            >
              {(field) => (
                <Field
                  label="Password"
                  htmlFor="password"
                  error={field.state.meta.errors[0]?.toString()}
                >
                  <Input
                    id="password"
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Create a password"
                    className={inputClass}
                    aria-invalid={
                      field.state.meta.errors.length > 0 ? "true" : undefined
                    }
                  />
                </Field>
              )}
            </form.Field>
          </div>
        </FormSection>

        <FormSection
          title="Alumni Verification"
          description="Provide your academic details to help verify your records."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <form.Field
              name="batchYear"
              validators={{
                onChange: ({ value }) => {
                  const res = v.safeParse(
                    v.pipe(
                      v.string(),
                      v.trim(),
                      v.regex(/^\d{4}$/, "4-digit year"),
                      v.check((val) => {
                        const yr = Number.parseInt(val, 10);
                        return yr >= 1976 && yr <= new Date().getFullYear();
                      }, `1976 - ${new Date().getFullYear()}`),
                    ),
                    value,
                  );
                  return res.success ? undefined : res.issues[0]?.message;
                },
              }}
            >
              {(field) => (
                <Field
                  label="Passing Year"
                  htmlFor="batch-year"
                  error={field.state.meta.errors[0]?.toString()}
                >
                  <InputGroup className={groupClass}>
                    <InputGroupInput
                      id="batch-year"
                      name={field.name}
                      placeholder="e.g. 2018"
                      inputMode="numeric"
                      maxLength={4}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={
                        field.state.meta.errors.length > 0 ? "true" : undefined
                      }
                    />
                    <InputGroupAddon align="inline-end">
                      <InputGroupText>Year</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                </Field>
              )}
            </form.Field>

            <form.Field name="academicGroup">
              {(field) => (
                <Field label="Academic Group" htmlFor="academic-group" optional>
                  <Select
                    selectedKey={field.state.value}
                    onSelectionChange={(key) =>
                      field.handleChange(
                        key as "science" | "humanities" | "business_studies",
                      )
                    }
                    className="w-full"
                  >
                    <SelectTrigger
                      id="academic-group"
                      className={`${inputClass} w-full`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem id="science">Science</SelectItem>
                      <SelectItem id="humanities">Humanities</SelectItem>
                      <SelectItem id="business_studies">
                        Business Studies
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>

            <form.Field name="teeShirtSize">
              {(field) => (
                <Field label="T-Shirt Size" htmlFor="tee-shirt-size">
                  <Select
                    selectedKey={field.state.value}
                    onSelectionChange={(key) =>
                      field.handleChange(key as string)
                    }
                    className="w-full"
                  >
                    <SelectTrigger
                      id="tee-shirt-size"
                      className={`${inputClass} w-full`}
                    >
                      <div className="flex items-center gap-1.5">
                        <IconShirt className="size-3.5 text-muted-foreground" />
                        <SelectValue />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem id="XS">XS</SelectItem>
                      <SelectItem id="S">S</SelectItem>
                      <SelectItem id="M">M</SelectItem>
                      <SelectItem id="L">L</SelectItem>
                      <SelectItem id="XL">XL</SelectItem>
                      <SelectItem id="XXL">XXL</SelectItem>
                      <SelectItem id="XXXL">XXXL</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>

            <form.Field name="studentId">
              {(field) => (
                <Field label="Student ID" htmlFor="student-id" optional>
                  <InputGroup className={groupClass}>
                    <InputGroupAddon>
                      <IconId className="size-3.5" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="student-id"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Student ID"
                    />
                  </InputGroup>
                </Field>
              )}
            </form.Field>

            <form.Field name="referrerRegCode">
              {(field) => (
                <Field
                  label="Referral Code"
                  htmlFor="referrer-reg-code"
                  optional
                >
                  <InputGroup className={groupClass}>
                    <InputGroupAddon>
                      <IconUserPlus className="size-3.5" />
                    </InputGroupAddon>
                    <InputGroupInput
                      id="referrer-reg-code"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Referrer's Code"
                    />
                  </InputGroup>
                </Field>
              )}
            </form.Field>
          </div>
        </FormSection>

        <FormSection
          title="Work Profile"
          description="Your professional background. If any field is entered, all three fields must be completed."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
                  <Field
                    label="Organization Name"
                    htmlFor="organization"
                    optional={!hasAny}
                    error={field.state.meta.errors[0]?.toString()}
                  >
                    <InputGroup className={groupClass}>
                      <InputGroupAddon>
                        <IconBuilding className="size-3.5" />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="organization"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="Company or Organization"
                        aria-invalid={
                          field.state.meta.errors.length > 0
                            ? "true"
                            : undefined
                        }
                      />
                    </InputGroup>
                  </Field>
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
                  <Field
                    label="Division / Department"
                    htmlFor="department"
                    optional={!hasAny}
                    error={field.state.meta.errors[0]?.toString()}
                  >
                    <InputGroup className={groupClass}>
                      <InputGroupAddon>
                        <IconBriefcase className="size-3.5" />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="department"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g. Engineering"
                        aria-invalid={
                          field.state.meta.errors.length > 0
                            ? "true"
                            : undefined
                        }
                      />
                    </InputGroup>
                  </Field>
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
                  <Field
                    label="Designation"
                    htmlFor="designation"
                    optional={!hasAny}
                    error={field.state.meta.errors[0]?.toString()}
                  >
                    <InputGroup className={groupClass}>
                      <InputGroupAddon>
                        <IconUser className="size-3.5" />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="designation"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="e.g. Software Engineer"
                        aria-invalid={
                          field.state.meta.errors.length > 0
                            ? "true"
                            : undefined
                        }
                      />
                    </InputGroup>
                  </Field>
                );
              }}
            </form.Field>
          </div>
        </FormSection>

        <FormSection
          title="Address"
          description="Where you are currently residing (optional)."
        >
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <form.Field name="streetAddress">
                {(field) => (
                  <Field
                    label="Street Address"
                    htmlFor="street-address"
                    optional
                  >
                    <InputGroup className={`${groupClass} w-full`}>
                      <InputGroupAddon>
                        <IconMapPin className="size-3.5" />
                      </InputGroupAddon>
                      <InputGroupInput
                        id="street-address"
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        placeholder="House, road, and street"
                      />
                    </InputGroup>
                  </Field>
                )}
              </form.Field>
            </div>

            <form.Field name="city">
              {(field) => (
                <Field label="City" htmlFor="city" optional>
                  <Input
                    id="city"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="City"
                    className={inputClass}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="state">
              {(field) => (
                <Field label="State / Division" htmlFor="state" optional>
                  <Input
                    id="state"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="State or Division"
                    className={inputClass}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="postalCode">
              {(field) => (
                <Field label="Postal Code" htmlFor="postal-code" optional>
                  <Input
                    id="postal-code"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Postal code"
                    className={inputClass}
                  />
                </Field>
              )}
            </form.Field>

            <form.Field name="country">
              {(field) => (
                <Field label="Country" htmlFor="country" optional>
                  <Input
                    id="country"
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Country"
                    className={inputClass}
                  />
                </Field>
              )}
            </form.Field>
          </div>
        </FormSection>

        <div className="flex justify-center pt-4">
          <AnimatedButton
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto px-8"
          >
            {isSubmitting ? "Submitting..." : "Register as an Alumna"}
          </AnimatedButton>
        </div>
      </form>
    </section>
  );
}
