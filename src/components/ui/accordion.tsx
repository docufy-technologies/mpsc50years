import type { HTMLAttributes, DetailsHTMLAttributes } from "react";
import { IconChevronDown } from "@tabler/icons-react";

type AccordionItemProps = DetailsHTMLAttributes<HTMLDetailsElement>;

export function Accordion({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`space-y-2 ${className ?? ""}`.trim()} {...props}>
      {children}
    </div>
  );
}

export function AccordionItem({
  className,
  children,
  ...props
}: AccordionItemProps) {
  return (
    <details
      className={`group border-b border-border ${className ?? ""}`.trim()}
      {...props}
    >
      {children}
    </details>
  );
}

export function AccordionTrigger({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLElement>) {
  return (
    <summary
      className={`flex cursor-pointer list-none items-center justify-between py-4 text-left transition-all hover:underline [&::-webkit-details-marker]:hidden ${className ?? ""}`.trim()}
      {...props}
    >
      <span>{children}</span>

      <IconChevronDown
        width={16}
        height={16}
        strokeWidth={2}
        className="ml-3 shrink-0 opacity-60 transition-transform duration-200 group-open:rotate-180"
        aria-hidden="true"
      />
    </summary>
  );
}

export function AccordionContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`overflow-hidden pb-4 pt-0 text-sm ${className ?? ""}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
}
