import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

export type TeamMember = {
  image: string;
  name: string;
  designation: string;
};

type TeamSectionProps = {
  members: TeamMember[];
  columnCount?: number;
  className?: string;
};

export function TeamSection({
  members,
  columnCount = 5,
  className,
}: TeamSectionProps) {
  const columns = Math.min(12, Math.max(1, Math.floor(columnCount)));

  return (
    <section
      className={cn(
        "grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4",
        className,
      )}
      style={
        {
          "--team-columns": columns,
        } as CSSProperties
      }
    >
      {members.map((member, index) => (
        <article
          key={`${member.name}-${index}`}
          className="group relative min-w-0"
        >
          <div className="relative aspect-3/4 overflow-hidden rounded-xl bg-muted">
            <img
              src={member.image}
              alt={member.name}
              loading="lazy"
              className={cn(
                "absolute inset-0 size-full object-cover",
                "grayscale transition-[filter,transform] duration-500 ease-out",
                "group-hover:grayscale-0",
                "motion-reduce:transition-none",
              )}
            />

            <div
              className={cn(
                "absolute inset-x-0 bottom-0 z-10",
                "rounded-b-xl border-t border-white/10",
                "bg-black/60 px-3 py-2.5 text-white",
                "backdrop-blur-sm",
              )}
            >
              <h3 className="truncate text-sm font-semibold leading-5 sm:text-base">
                {member.name}
              </h3>

              <p className="truncate text-xs leading-5 text-white/65 sm:text-sm">
                {member.designation}
              </p>
            </div>
          </div>
        </article>
      ))}
    </section>
  );
}
