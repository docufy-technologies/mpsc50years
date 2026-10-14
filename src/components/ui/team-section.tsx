import { cn } from "@/lib/utils";

export type TeamMember = {
  image: string;
  name: string;
  designation: string;
};

type TeamShowcaseProps = {
  members: TeamMember[];
  className?: string;
};

export function TeamShowcase({ members, className }: TeamShowcaseProps) {
  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5",
        className,
      )}
    >
      {members.map((member, index) => (
        <li key={`${member.name}-${index}`}>
          <figure className="group relative aspect-square overflow-hidden rounded-xl bg-muted">
            <img
              src={member.image}
              alt={member.name}
              loading="lazy"
              className="h-full w-full object-cover grayscale transition duration-500 ease-out group-hover:scale-105 group-hover:grayscale-0 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-background/60 px-4 py-3 backdrop-blur-md">
              <p className="truncate text-sm font-semibold text-foreground">
                {member.name}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {member.designation}
              </p>
            </figcaption>
          </figure>
        </li>
      ))}
    </ul>
  );
}
