import { IconUsersGroup } from "@tabler/icons-react";
import { hueFor, photoFor } from "@/lib/portrait";
import { cn } from "@/lib/utils";

type PortraitProps = {
  name: string;
  /** Explicit image path, otherwise looked up in src/assets/committee */
  src?: string;
  /** Clubs / batch groups get an icon instead of a face */
  group?: boolean;
  shape?: "circle" | "portrait" | "arch";
  className?: string;
};

const SHAPES = {
  circle: "aspect-square rounded-full",
  portrait: "aspect-4/5 rounded-xl",
  arch: "aspect-4/5 rounded-t-full rounded-b-3xl",
};

export function Portrait({
  name,
  src,
  group = false,
  shape = "circle",
  className,
}: PortraitProps) {
  const url = group ? undefined : photoFor(name, src);
  const hue = hueFor(name);

  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden",
        url
          ? "bg-secondary"
          : "bg-[oklch(0.94_0.035_var(--h))] dark:bg-[oklch(0.3_0.045_var(--h))]",
        SHAPES[shape],
        className,
      )}
      style={url ? undefined : ({ "--h": hue } as React.CSSProperties)}
    >
      {url ? (
        <img
          src={url}
          alt={name}
          loading="lazy"
          className="size-full object-cover"
        />
      ) : group ? (
        <div
          role="img"
          aria-label={name}
          className="flex size-full items-center justify-center text-[oklch(0.6_0.08_var(--h))] dark:text-[oklch(0.72_0.09_var(--h))]"
        >
          <IconUsersGroup className="size-1/2 stroke-[1.25]" />
        </div>
      ) : (
        <svg
          role="img"
          aria-label={`${name} (photo coming soon)`}
          viewBox="0 0 400 500"
          preserveAspectRatio="xMidYMid slice"
          className="size-full fill-[oklch(0.72_0.07_var(--h)/0.55)] dark:fill-[oklch(0.62_0.08_var(--h)/0.6)]"
        >
          <title>{`${name} (photo coming soon)`}</title>
          <circle cx="200" cy="190" r="72" />
          <ellipse cx="200" cy="470" rx="150" ry="125" />
        </svg>
      )}
    </div>
  );
}
