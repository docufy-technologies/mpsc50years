import type { AnyFieldApi } from "@tanstack/react-form";

import { fieldIssueMessages, isFieldInvalid } from "@/components/form-utils";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

type FormInputGroupProps = Omit<
  React.ComponentProps<"input">,
  "name" | "value" | "onBlur" | "onChange" | "aria-invalid"
> & {
  /** TanStack Form field API, received from `<form.Field>{(field) => ...}` */
  field: AnyFieldApi;
  label: React.ReactNode;
  description?: React.ReactNode;
  optional?: boolean;
  /** Content rendered in the leading addon (icon, country code, …) */
  startAddon?: React.ReactNode;
  /** Content rendered in a trailing `inline-end` addon (unit, suffix, …) */
  endAddon?: React.ReactNode;
};

/**
 * Input-group field wired to TanStack Form, following the shadcn Field
 * anatomy (Field > FieldLabel + InputGroup + FieldDescription + FieldError).
 *
 * Usage:
 * ```tsx
 * <form.Field name="phone">
 *   {(field) => (
 *     <FormInputGroup
 *       field={field}
 *       label="Phone Number"
 *       type="tel"
 *       placeholder="1XXX-XXXXXX"
 *       startAddon={
 *         <InputGroupText>
 *           <IconPhone className="size-3.5" />
 *           +880
 *         </InputGroupText>
 *       }
 *     />
 *   )}
 * </form.Field>
 * ```
 */
export function FormInputGroup({
  field,
  label,
  description,
  optional,
  id,
  startAddon,
  endAddon,
  ...props
}: FormInputGroupProps) {
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
      <InputGroup>
        {startAddon && <InputGroupAddon>{startAddon}</InputGroupAddon>}
        <InputGroupInput
          id={inputId}
          name={field.name}
          value={(field.state.value ?? "") as string}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          {...props}
        />
        {endAddon && (
          <InputGroupAddon align="inline-end">{endAddon}</InputGroupAddon>
        )}
      </InputGroup>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={fieldIssueMessages(field)} />}
    </Field>
  );
}
