import type { AnyFieldApi } from "@tanstack/react-form";

import { fieldIssueMessages, isFieldInvalid } from "@/components/form-utils";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type FormSelectOption = {
  value: string;
  label: React.ReactNode;
};

type FormSelectProps = {
  /** TanStack Form field API, received from `<form.Field>{(field) => ...}` */
  field: AnyFieldApi;
  label: React.ReactNode;
  description?: React.ReactNode;
  optional?: boolean;
  id?: string;
  items: FormSelectOption[];
  /** Content rendered inside the trigger before the selected value (icon, …) */
  triggerPrefix?: React.ReactNode;
  triggerClassName?: string;
};

/**
 * Select wired to TanStack Form, following the shadcn Field anatomy
 * (Field > FieldLabel + Select + FieldDescription + FieldError).
 *
 * Usage:
 * ```tsx
 * <form.Field name="teeShirtSize">
 *   {(field) => (
 *     <FormSelect
 *       field={field}
 *       label="T-Shirt Size"
 *       triggerPrefix={<IconShirt className="size-3.5 text-muted-foreground" />}
 *       items={[
 *         { value: "S", label: "S" },
 *         { value: "M", label: "M" },
 *         { value: "L", label: "L" },
 *       ]}
 *     />
 *   )}
 * </form.Field>
 * ```
 */
export function FormSelect({
  field,
  label,
  description,
  optional,
  id,
  items,
  triggerPrefix,
  triggerClassName = "h-8 w-full text-sm",
}: FormSelectProps) {
  const isInvalid = isFieldInvalid(field);
  const triggerId = id ?? field.name;

  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={triggerId}>
        {label}
        {optional && (
          <span className="ml-1 text-xs font-normal text-muted-foreground">
            Optional
          </span>
        )}
      </FieldLabel>
      <Select
        selectedKey={(field.state.value ?? null) as string | null}
        onSelectionChange={(key) => field.handleChange(String(key))}
        onBlur={field.handleBlur}
        className="w-full"
        aria-label={typeof label === "string" ? label : undefined}
      >
        <SelectTrigger
          id={triggerId}
          className={triggerClassName}
          aria-invalid={isInvalid}
        >
          {triggerPrefix}
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {items.map((item) => (
            <SelectItem key={item.value} id={item.value}>
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {description && <FieldDescription>{description}</FieldDescription>}
      {isInvalid && <FieldError errors={fieldIssueMessages(field)} />}
    </Field>
  );
}
