import { Portrait } from "@/components/blocks/portrait";
import type { Person } from "@/data/committee";
import { cn } from "@/lib/utils";

type PersonCardProps = {
  person: Person;
  /** Larger layout, used for the steering committee */
  featured?: boolean;
};

export function PersonCard({ person, featured = false }: PersonCardProps) {
  return (
    <div
      className={cn(
        "group relative flex h-full flex-col items-center text-center",
        featured &&
          "rounded-2xl border bg-card p-6 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_12px_30px_-18px] hover:shadow-primary/20",
      )}
    >
      <div className="relative w-full">
        <Portrait
          name={person.name}
          src={person.photo}
          shape={featured ? "arch" : "portrait"}
          className={cn(
            "mx-auto w-full ring-1 ring-border group-hover:ring-2 group-hover:ring-accent",
            featured && "max-w-48",
          )}
        />
      </div>
      <div className="mt-4 min-w-0">
        <p
          className={cn(
            "font-heading text-base font-semibold leading-snug sm:text-lg",
            // trustee names: keep on one line when 4 cards fit per row (lg+);
            // the font scales with the viewport so the longest name still fits
            !featured &&
              "lg:whitespace-nowrap lg:text-[clamp(0.75rem,1.2vw,0.9rem)]",
          )}
        >
          {person.name}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{person.title}</p>
        {person.role && (
          <span className="mt-3 inline-block rounded-full bg-accent px-3 py-0.5 text-sm font-medium text-neutral-900">
            {person.role}
          </span>
        )}
      </div>
    </div>
  );
}
