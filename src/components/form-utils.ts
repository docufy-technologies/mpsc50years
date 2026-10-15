import type { AnyFieldApi } from "@tanstack/react-form";

/**
 * A field is shown as invalid only after touch, so typing in one field
 * doesn't light up every other untouched required field in a long form.
 */
export function isFieldInvalid(field: AnyFieldApi): boolean {
  return field.state.meta.isTouched && !field.state.meta.isValid;
}

/**
 * Normalize field errors for shadcn <FieldError />: plain strings (custom
 * field validators) and Standard Schema issue objects (form-level schema
 * validator) both arrive here.
 */
export function fieldIssueMessages(
  field: AnyFieldApi,
): Array<{ message?: string } | undefined> {
  return (
    field.state.meta.errors as Array<string | { message?: string } | undefined>
  ).map((err) => (typeof err === "string" ? { message: err } : err));
}
