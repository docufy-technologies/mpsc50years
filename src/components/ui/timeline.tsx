import { cn } from "@/lib/utils";

export type TimelineItem = {
  id: string;
  year: string;
  name: string;
  content: string;
};

type TimelineProps = {
  items: TimelineItem[];
  className?: string;
};

export function Timeline({ items, className }: TimelineProps) {
  return (
    <ol className={cn("relative ml-2 border-l border-border pl-6", className)}>
      {items.map((item) => (
        <li key={item.id} className="relative pb-8 last:pb-0">
          <span
            aria-hidden
            className="absolute top-1.5 -left-6 size-2.5 -translate-x-[4.5px] rounded-full bg-primary ring-4 ring-background"
          />
          <p className="font-mono text-sm font-semibold text-primary">
            {item.year}
          </p>
          <h3 className="mt-1 text-base">{item.name}</h3>
          <p className="mt-1 max-w-xl text-sm leading-6 text-muted-foreground">
            {item.content}
          </p>
        </li>
      ))}
    </ol>
  );
}

export default Timeline;
