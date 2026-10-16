import type { AnyFieldApi } from "@tanstack/react-form";

import { fieldIssueMessages, isFieldInvalid } from "@/components/form-utils";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type FormInputProps = Omit<
  React.ComponentProps<"input">,
  "name" | "value" | "onBlur" | "onChange" | "aria-invalid"
> & {
  /** TanStack Form field API, received from `<form.Field>{(field) => ...}` */
  field: AnyFieldApi;
  label: React.ReactNode;
  description?: React.ReactNode;
  optional?: boolean;
};

/**
 * Text input wired to TanStack Form, following the shadcn Field anatomy
 * (Field > FieldLabel + Input + FieldDescription + FieldError).
 *
 * Error display is gated on `isTouched` so typing in one field doesn't
 * light up every other untouched required field in a long form.
 *
 * Usage:
 * ```tsx
 * <FieldGroup>
 *   <form.Field name="fullName">
 *     {(field) => (
 *       <FormInput
 *         field={field}
 *         label="Full Name"
 *         placeholder="Your full name"
 *         autoComplete="off"
 *       />
 *     )}
 *   </form.Field>
 * </FieldGroup>
 * ```
 */
export function FormInput({
  field,
  label,
  description,
  optional,
  id,
  ...props
}: FormInputProps) {
  const isInvalid = isFieldInvalid(field);
  const inputId = id ?? field.name;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={inputId}>
        {label}
        {optional && (
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            Optional
          </span>
        )}
      </FieldLabel>
      <Input
        id={inputId}
        name={field.name}
        value={(field.state.value ?? "") as string}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        {...props}
      />
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={fieldIssueMessages(field)} />}
    </Field>
  );
}
