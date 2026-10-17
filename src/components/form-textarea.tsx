import type { AnyFieldApi } from "@tanstack/react-form";

import { fieldIssueMessages, isFieldInvalid } from "@/components/form-utils";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

type FormTextareaProps = Omit<
  React.ComponentProps<typeof Textarea>,
  "name" | "value" | "onBlur" | "onChange" | "aria-invalid"
> & {
  /** TanStack Form field API, received from `<form.Field>{(field) => ...}` */
  field: AnyFieldApi;
  label: React.ReactNode;
  description?: React.ReactNode;
  optional?: boolean;
};

/**
 * Multi-line text field wired to TanStack Form, following the shadcn Field
 * anatomy (Field > FieldLabel + Textarea + FieldDescription + FieldError).
 *
 * Usage:
 * ```tsx
 * <form.Field name="motivation">
 *   {(field) => (
 *     <FormTextarea
 *       field={field}
 *       label="Motivation"
 *       placeholder="Tell us why you want to join…"
 *       rows={4}
 *     />
 *   )}
 * </form.Field>
 * ```
 */
export function FormTextarea({
  field,
  label,
  description,
  optional,
  id,
  ...props
}: FormTextareaProps) {
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
      <Textarea
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
