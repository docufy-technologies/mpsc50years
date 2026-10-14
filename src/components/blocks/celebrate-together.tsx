import { IconArrowUpRight } from "@tabler/icons-react";
import { cn } from "cn";

export function CelebrateTogether({
  onClick,
  className,
}: {
  onClick?: () => void;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "flex relative gap-12 flex-col items-center justify-center overflow-hidden  px-5 py-16 text-center",
        className,
      )}
    >
      <div className="group relative" style={{ pointerEvents: "auto" }}>
        <div className="flex flex-col items-center gap-6">
          <h2
            className="relative text-center text-[clamp(3rem,8vw,4.5rem)] font-normal leading-[0.98] tracking-[-0.055em] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              opacity: 1,
              transform: "translateY(0) scale(1)",
            }}
          >
            <span className="block overflow-hidden">
              <span className="block text-foreground transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-[-8%]">
                Let's <span className="text-accent">celebrate</span>
              </span>
            </span>
            <span className="block overflow-hidden">
              <span className="block text-muted-foreground/60 transition-transform delay-75 duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-[-8%]">
                together
              </span>
            </span>
          </h2>
          <button
            type="button"
            onClick={onClick}
            aria-label="Let's celebrate together"
            className="relative mt-4 flex size-16 cursor-pointer items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50 sm:size-20"
          >
            <div className="pointer-events-none absolute inset-0 rounded-full border border-border transition-all duration-500 ease-out group-hover:scale-110 group-hover:border-foreground group-hover:bg-foreground" />
            <IconArrowUpRight
              className="size-6 text-foreground transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-background sm:size-7"
              stroke={1.8}
            />
          </button>
        </div>
      </div>
    </section>
  );
}
