import { IconArrowsVertical } from "@tabler/icons-react";
import { forwardRef } from "react";
import { Portrait } from "@/components/blocks/portrait";
import type { Team } from "@/data/committee";
import { cn } from "@/lib/utils";

function supervisorLine(team: Team) {
  const many = team.supervisors.length > 1;
  const label = many ? "Supervisors" : "Supervisor";
  const names = team.supervisors.join(" and ");
  const title = many ? `${team.supervisorTitle}s` : team.supervisorTitle;

  return `${label}: ${names}, ${title}`;
}

type TeamCardProps = {
  team: Team;
  open: boolean;
  onToggle: (button: HTMLButtonElement) => void;
};

export const TeamCard = forwardRef<HTMLButtonElement, TeamCardProps>(
  function TeamCard({ team, open, onToggle }, ref) {
    return (
      <button
        ref={ref}
        type="button"
        aria-expanded={open}
        aria-controls={`team-${team.id}`}
        onClick={(e) => onToggle(e.currentTarget)}
        className={cn(
          "group relative flex h-full w-full cursor-pointer flex-col items-center overflow-hidden rounded-2xl border bg-card p-7 text-center text-card-foreground",
          "hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[0_12px_30px_-18px] hover:shadow-primary/25",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
          open &&
            "border-primary/70 shadow-[0_20px_50px_-20px] shadow-primary/40",
        )}
      >
        <span
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-1 origin-center scale-x-0 bg-linear-to-r from-accent via-primary to-accent group-hover:scale-x-100",
            open && "scale-x-100",
          )}
        />

        {/* supervisor portraits live on the committee name */}
        <span className="flex -space-x-4">
          {team.supervisors.map((name) => (
            <Portrait
              key={name}
              name={name}
              className="size-24 ring-4 ring-card"
            />
          ))}
        </span>

        <span className="mt-5 block font-heading text-xl font-semibold leading-snug">
          {team.name}
        </span>
        <span className="mt-1.5 block font-sans text-sm text-muted-foreground">
          {supervisorLine(team)}
        </span>

        <span
          className={cn(
            "mt-5 inline-flex items-center gap-2 rounded-full bg-secondary px-4 py-1.5 text-sm font-medium group-hover:bg-primary group-hover:text-primary-foreground",
            open && "bg-primary text-primary-foreground",
          )}
        >
          <IconArrowsVertical
            aria-hidden="true"
            className={cn("size-4", open && "rotate-180")}
          />
          {open ? "Close team" : "Open team"}
        </span>
      </button>
    );
  },
);
