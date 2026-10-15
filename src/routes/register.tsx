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
import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";

import { FormInput } from "@/components/form-input";
import { FormInputGroup } from "@/components/form-input-group";
import { FormPasswordInput } from "@/components/form-password-input";
import { FormSelect } from "@/components/form-select";
import AnimatedButton from "@/components/ui/animated-button";
import { FieldGroup } from "@/components/ui/field";
import { InputGroupText } from "@/components/ui/input-group";
import { GENDER_OPTIONS } from "@/constants";
import { useAlumRegistrationForm } from "@/features/alumni-registration/hooks/use-alum-registration-form";

/** Cross-field check for the all-or-nothing work profile trio. */
function requireWorkProfileField(
  value: string | undefined,
  siblings: Array<string | undefined>,
  message: string,
): string | undefined {
  const hasAny = Boolean(value?.trim() || siblings.some((s) => s?.trim()));
  if (hasAny && !value?.trim()) {
    return message;
  }
  return undefined;
}

function hasAnyWorkProfileValue(...values: Array<string | undefined>): boolean {
  return values.some((v) => Boolean(v?.trim()));
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
  const form = useAlumRegistrationForm();

  return (
    <section className="min-h-screen pb-20 pt-32 max-w-3xl px-8 mx-auto">
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

            <form.Field name="gender">
              {(field) => (
                <FormSelect
                  field={field}
                  id="gender"
                  label="Gender"
                  triggerClassName="h-8 w-full text-sm capitalize"
                  items={GENDER_OPTIONS.map((gender) => ({
                    value: gender,
                    label: <span className="capitalize">{gender}</span>,
                  }))}
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
                  return requireWorkProfileField(
                    value,
                    [formValues.department, formValues.designation],
                    "Organization name is required if work profile is provided",
                  );
                },
              }}
            >
              {(field) => {
                const formValues = field.form.state.values;
                const hasAny = hasAnyWorkProfileValue(
                  field.state.value,
                  formValues.department,
                  formValues.designation,
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
                  return requireWorkProfileField(
                    value,
                    [formValues.organization, formValues.designation],
                    "Department is required if work profile is provided",
                  );
                },
              }}
            >
              {(field) => {
                const formValues = field.form.state.values;
                const hasAny = hasAnyWorkProfileValue(
                  field.state.value,
                  formValues.organization,
                  formValues.designation,
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
                  return requireWorkProfileField(
                    value,
                    [formValues.organization, formValues.department],
                    "Designation is required if work profile is provided",
                  );
                },
              }}
            >
              {(field) => {
                const formValues = field.form.state.values;
                const hasAny = hasAnyWorkProfileValue(
                  field.state.value,
                  formValues.organization,
                  formValues.department,
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
                {isSubmitting ? "Submitting..." : "Register as an Alum"}
              </AnimatedButton>
            )}
          </form.Subscribe>
        </div>
      </form>
    </section>
  );
}
