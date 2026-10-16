import { IconEye, IconEyeOff } from "@tabler/icons-react";
import type { AnyFieldApi } from "@tanstack/react-form";
import { cn } from "cn";
import { useState } from "react";

import { fieldIssueMessages, isFieldInvalid } from "@/components/form-utils";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

type FormPasswordInputProps = Omit<
  React.ComponentProps<"input">,
  "name" | "value" | "onBlur" | "onChange" | "aria-invalid" | "type"
> & {
  /** TanStack Form field API, received from `<form.Field>{(field) => ...}` */
  field: AnyFieldApi;
  label: React.ReactNode;
  description?: React.ReactNode;
  optional?: boolean;
};

/**
 * Password input with a show/hide visibility toggle, wired to TanStack Form
 * and following the shadcn Field anatomy
 * (Field > FieldLabel + Input + FieldDescription + FieldError).
 *
 * Usage:
 * ```tsx
 * <form.Field name="password">
 *   {(field) => (
 *     <FormPasswordInput
 *       field={field}
 *       label="Password"
 *       placeholder="Create a password"
 *     />
 *   )}
 * </form.Field>
 * ```
 */
export function FormPasswordInput({
  field,
  label,
  description,
  optional,
  id,
  className,
  ...props
}: FormPasswordInputProps) {
  const [isVisible, setIsVisible] = useState(false);
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
      <div className="relative">
        <Input
          id={inputId}
          type={isVisible ? "text" : "password"}
          name={field.name}
          value={(field.state.value ?? "") as string}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          className={cn("pe-9", className)}
          {...props}
        />
        <button
          type="button"
          onClick={() => setIsVisible((prev) => !prev)}
          aria-label={isVisible ? "Hide password" : "Show password"}
          aria-pressed={isVisible}
          aria-controls={inputId}
          className="text-muted-foreground/80 hover:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 absolute inset-y-0 end-0 flex h-full w-9 items-center justify-center rounded-e-md transition-[color,box-shadow] outline-none focus:z-10 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isVisible ? (
            <IconEyeOff className="size-4" aria-hidden="true" />
          ) : (
            <IconEye className="size-4" aria-hidden="true" />
          )}
        </button>
      </div>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={fieldIssueMessages(field)} />}
    </Field>
  );
}
