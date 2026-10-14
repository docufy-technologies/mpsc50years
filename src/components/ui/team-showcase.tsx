import { cn } from "@/lib/utils";

export type TeamMember = {
  image?: string;
  name: string;
  designation: string;
};

const HONORIFICS = new Set(["prof", "professor", "dr", "mr", "mrs", "ms"]);

function initials(name: string): string {
  const parts = name
    .replace(/\./g, "")
    .split(/\s+/)
    .filter((w) => w && !HONORIFICS.has(w.toLowerCase()));
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase();
}

type TeamShowcaseProps = {
  members: TeamMember[];
  className?: string;
};

export function TeamShowcase({ members, className }: TeamShowcaseProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-4 sm:grid-cols-3", className)}>
      {members.map((member, index) => (
        <div key={`${member.name}-${index}`}>
          <figure className="group relative aspect-square overflow-hidden rounded-xs bg-muted">
            {member.image ? (
              <img
                src={member.image}
                alt={member.name}
                loading="lazy"
                className="h-full w-full object-cover grayscale transition duration-500 ease-out group-hover:scale-105 group-hover:grayscale-0 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              />
            ) : (
              <div
                role="img"
                aria-label={member.name}
                className="flex h-full w-full items-center justify-center transition duration-500 ease-out group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              >
                <span className="font-serif text-5xl font-semibold text-muted-foreground/70">
                  {initials(member.name)}
                </span>
              </div>
            )}
            <figcaption className="absolute inset-x-0 bottom-0 bg-background/60 px-4 py-3 backdrop-blur-md">
              <p className="truncate text-sm font-semibold text-foreground">
                {member.name}
              </p>
              <p className="text-sm leading-snug break-words text-muted-foreground">
                {member.designation}
              </p>
            </figcaption>
          </figure>
        </div>
      ))}
    </div>
  );
}
