import { IconMail, IconMapPin, IconPhone } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
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

const inputClass = "h-8 w-full text-sm";
const groupClass = "h-8 rounded-md";

function Field({
  label,
  htmlFor,
  optional = false,
  children,
}: {
  label: string;
  htmlFor: string;
  optional?: boolean;
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
    <fieldset className="grid gap-3.5">
      <div className="space-y-1">
        <h2 className="pb-4">{title}</h2>
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
  return (
    <section className="min-h-screen pb-20 pt-40 max-w-4xl px-4 mx-auto">
      <form className="space-y-5">
        <FormSection title="Personal Information">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="Full Name" htmlFor="full-name">
              <Input
                id="full-name"
                name="fullName"
                placeholder="Your full name"
                className={inputClass}
              />
            </Field>

            <Field label="Phone Number" htmlFor="phone">
              <InputGroup className={groupClass}>
                <InputGroupAddon>
                  <InputGroupText>
                    <IconPhone className="size-3.5" />
                    +880
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="1XXX-XXXXXX"
                />
              </InputGroup>
            </Field>

            <Field label="Email Address" htmlFor="email">
              <InputGroup className={groupClass}>
                <InputGroupAddon>
                  <IconMail className="size-3.5" />
                </InputGroupAddon>
                <InputGroupInput
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                />
              </InputGroup>
            </Field>

            <Field label="Password" htmlFor="password">
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Create a password"
                className={inputClass}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection
          title="Alumni Verification"
          description="Provide your academic details to help identify your records."
        >
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <Field label="Student ID" htmlFor="student-id" optional>
              <Input
                id="student-id"
                name="studentId"
                placeholder="Student ID"
                className={inputClass}
              />
            </Field>

            <Field label="Passing Year" htmlFor="passing-year">
              <InputGroup className={groupClass}>
                <InputGroupInput
                  id="passing-year"
                  name="passingYear"
                  placeholder="e.g. 2018"
                  inputMode="numeric"
                  maxLength={4}
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>Year</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
            </Field>

            <Field label="Academic Group" htmlFor="academic-group">
              <Select name="academicGroup" className="w-full">
                <SelectTrigger
                  id="academic-group"
                  className={`${inputClass} w-full`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="science">Science</SelectItem>
                  <SelectItem value="humanities">Humanities</SelectItem>
                  <SelectItem value="business-studies">
                    Business Studies
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </FormSection>

        <FormSection
          title="Work Profile"
          description="Your professional details, if applicable."
        >
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <Field label="Organization Name" htmlFor="organization" optional>
              <Input
                id="organization"
                name="organization"
                placeholder="Company or organization"
                className={inputClass}
              />
            </Field>

            <Field label="Division / Department" htmlFor="department" optional>
              <Input
                id="department"
                name="department"
                placeholder="e.g. Engineering"
                className={inputClass}
              />
            </Field>

            <Field label="Designation" htmlFor="designation" optional>
              <Input
                id="designation"
                name="designation"
                placeholder="e.g. Software Engineer"
                className={inputClass}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Address">
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field label="Street Address" htmlFor="street-address">
                <InputGroup className={`${groupClass} w-full`}>
                  <InputGroupAddon>
                    <IconMapPin className="size-3.5" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="street-address"
                    name="streetAddress"
                    placeholder="House, road, and street"
                  />
                </InputGroup>
              </Field>
            </div>

            <Field label="City" htmlFor="city">
              <Input
                id="city"
                name="city"
                placeholder="City"
                className={inputClass}
              />
            </Field>

            <Field label="State / Province" htmlFor="state">
              <Input
                id="state"
                name="state"
                placeholder="State or province"
                className={inputClass}
              />
            </Field>

            <Field label="Postal Code" htmlFor="postal-code">
              <Input
                id="postal-code"
                name="postalCode"
                placeholder="Postal code"
                className={inputClass}
              />
            </Field>

            <Field label="Country" htmlFor="country">
              <Input
                id="country"
                name="country"
                placeholder="Country"
                className={inputClass}
              />
            </Field>
          </div>
        </FormSection>

        <div className="flex justify-center pt-4">
          <AnimatedButton onClick={() => window.navigation.reload()}>
            Register as an Alumna
          </AnimatedButton>
        </div>
      </form>
    </section>
  );
}
