import type { ReactNode } from "react";

type FormSectionProps = {
  title: string;
  description?: ReactNode;
  children: ReactNode;
};

/**
 * Visual grouping for a set of related form fields. Mirrors the section
 * styling used on the alumni registration route so every long form in the
 * app reads the same way.
 */
export function FormSection({
  title,
  description,
  children,
}: FormSectionProps) {
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
