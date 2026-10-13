import { IconX } from "@tabler/icons-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Portrait } from "@/components/blocks/portrait";
import type { Member, Team } from "@/data/committee";
import { cn } from "@/lib/utils";

const memberName = (m: Member) => (typeof m === "string" ? m : m.name);
const isGroup = (m: Member) => typeof m !== "string";

type Props = {
  team: Team;
  eyebrow: string;
  /** Called once the closing animation has finished */
  onClosed: () => void;
};

export function TeamShutter({ team, eyebrow, onClosed }: Props) {
  const [closing, setClosing] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const close = useCallback(() => {
    if (reduced) onClosed();
    else setClosing(true);
  }, [onClosed, reduced]);

  // lock page scroll, focus the close button once the shutters part
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(
      () => closeRef.current?.focus(),
      reduced ? 0 : 900,
    );
    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(t);
    };
  }, [reduced]);

  // Escape + simple focus trap
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return close();
      if (e.key !== "Tab" || !rootRef.current) return;
      const focusable = rootRef.current.querySelectorAll<HTMLElement>(
        "button, [href], [tabindex]:not([tabindex='-1'])",
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);

  // running index so every portrait staggers in sequence
  let n = 0;
  const next = () => n++;

  const title = (
    <div className="shutter-title px-6 text-center text-primary-foreground">
      <p className="mb-3 font-sans text-sm font-semibold uppercase tracking-[0.4em] text-accent">
        {eyebrow}
      </p>
      <p className="font-heading text-[clamp(2rem,7vw,5rem)] font-extrabold leading-[1.05] tracking-tight text-balance">
        {team.name}
      </p>
    </div>
  );

  return createPortal(
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label={team.name}
      className={cn("fixed inset-0 z-100", closing && "shutter-root-out")}
      onAnimationEnd={(e) => {
        if (closing && e.target === e.currentTarget) onClosed();
      }}
    >
      {/* revealed content */}
      <div
        className="shutter-content absolute inset-0 overflow-y-auto bg-background"
        style={{
          backgroundImage:
            "radial-gradient(60rem 30rem at 50% -10%, oklch(0.85 0.15 85 / 0.18), transparent), radial-gradient(40rem 30rem at 100% 100%, oklch(0.514 0.222 16.935 / 0.08), transparent)",
        }}
      >
        <button
          ref={closeRef}
          type="button"
          onClick={close}
          aria-label="Close team"
          className="fixed right-4 top-4 z-10 flex cursor-pointer items-center gap-2 rounded-full border bg-card/90 py-2 pl-4 pr-3 text-sm font-medium shadow-lg backdrop-blur hover:border-primary hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:right-8 sm:top-8"
        >
          Close <IconX className="size-5" aria-hidden="true" />
        </button>

        <div className="mx-auto max-w-5xl px-6 pb-24 pt-24 text-center sm:pt-28">
          <p
            className="shutter-pop text-sm font-semibold uppercase tracking-[0.35em] text-accent"
            style={{ "--i": next() } as React.CSSProperties}
          >
            {eyebrow}
          </p>
          <h2
            className="shutter-pop mt-3 pb-0 text-balance text-4xl font-extrabold sm:text-5xl"
            style={{ "--i": next() } as React.CSSProperties}
          >
            {team.name}
          </h2>

          {/* supervisors */}
          <div className="mt-10 flex flex-wrap items-start justify-center gap-8">
            {team.supervisors.map((name) => (
              <div
                key={name}
                className="shutter-pop group w-64 max-w-full"
                style={{ "--i": next() } as React.CSSProperties}
              >
                <div className="relative mx-auto w-fit">
                  <div className="absolute -inset-1.5 rounded-full bg-linear-to-br from-accent to-primary opacity-80 group-hover:opacity-100" />
                  <Portrait
                    name={name}
                    className="relative size-32 ring-4 ring-background group-hover:scale-105 sm:size-36"
                  />
                </div>
                <p className="mt-4 font-heading text-lg font-semibold leading-snug">
                  {name}
                </p>
                <p className="mt-1 inline-block rounded-full bg-accent px-3 py-0.5 text-sm font-medium text-neutral-900">
                  Supervisor · {team.supervisorTitle}
                </p>
              </div>
            ))}
          </div>

          {/* groups */}
          <div className="mt-16 space-y-16">
            {team.groups.map((group) => (
              <section key={group.heading ?? "roles"} className="space-y-12">
                {group.heading && (
                  <div
                    className="shutter-pop flex items-center gap-4"
                    style={{ "--i": next() } as React.CSSProperties}
                  >
                    <span className="h-px flex-1 bg-linear-to-r from-transparent to-primary/40" />
                    <h3 className="m-0 text-accent">{group.heading}</h3>
                    <span className="h-px flex-1 bg-linear-to-l from-transparent to-primary/40" />
                  </div>
                )}
                {group.roles.map((role) => (
                  <div key={role.title}>
                    <h4
                      className="shutter-pop m-0 mb-6 text-lg text-muted-foreground"
                      style={{ "--i": next() } as React.CSSProperties}
                    >
                      <span className="border-b-2 border-accent pb-1">
                        {role.title}
                      </span>
                    </h4>
                    <ul className="m-0 flex list-none flex-wrap justify-center gap-x-4 gap-y-8 p-0">
                      {role.people.map((m) => (
                        <li
                          key={memberName(m)}
                          className="shutter-pop group m-0 w-28 sm:w-32"
                          style={{ "--i": next() } as React.CSSProperties}
                        >
                          <Portrait
                            name={memberName(m)}
                            group={isGroup(m)}
                            className="mx-auto size-20 ring-2 ring-border group-hover:-translate-y-1.5 group-hover:scale-110 group-hover:ring-accent sm:size-24"
                          />
                          <p className="mt-3 text-sm font-medium leading-snug text-balance">
                            {memberName(m)}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </section>
            ))}
          </div>
        </div>
      </div>

      {/* the two shutter halves; title is split across the seam */}
      <div
        aria-hidden="true"
        className={cn(
          "shutter-slats shutter-top pointer-events-none absolute inset-x-0 h-1/2 overflow-hidden",
          closing && "shutter-closing",
        )}
      >
        <div className="absolute inset-x-0 top-0 flex h-[200%] items-center justify-center">
          {title}
        </div>
      </div>
      <div
        aria-hidden="true"
        className={cn(
          "shutter-slats shutter-bottom pointer-events-none absolute inset-x-0 h-1/2 overflow-hidden",
          closing && "shutter-closing",
        )}
      >
        <div className="absolute inset-x-0 bottom-0 flex h-[200%] items-center justify-center">
          {title}
        </div>
      </div>
    </div>,
    document.body,
  );
}
