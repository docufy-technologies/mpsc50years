import { type CSSProperties, useRef } from "react";
import { Portrait } from "@/components/blocks/portrait";
import type { Person } from "@/data/committee";

/** Big, animated spotlight for the Chairman of the Board of Trustees. */
export function ChairmanHero({ person }: { person: Person }) {
  const tiltRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse" || !tiltRef.current) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    tiltRef.current.style.setProperty("--rx", `${(-y * 10).toFixed(2)}deg`);
    tiltRef.current.style.setProperty("--ry", `${(x * 14).toFixed(2)}deg`);
  };
  const onLeave = () => {
    tiltRef.current?.style.setProperty("--rx", "0deg");
    tiltRef.current?.style.setProperty("--ry", "0deg");
  };

  const words = person.name.split(" ");

  return (
    <div
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className="relative isolate flex flex-col items-center overflow-hidden mx-auto max-w-2xl rounded-[1.5rem] border bg-card/60 px-6 py-10 text-center sm:py-12"
    >
      {/* ambient glows */}
      <div
        aria-hidden="true"
        className="hero-drift pointer-events-none absolute -left-20 -top-24 -z-10 size-72 rounded-full bg-accent/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="hero-drift pointer-events-none absolute -bottom-24 -right-20 -z-10 size-72 rounded-full bg-primary/15 blur-3xl [animation-delay:-7s]"
      />

      <p
        className="reveal text-sm font-semibold uppercase tracking-[0.4em] text-accent"
        data-in="true"
      >
        Chief Patron
      </p>

      {/* portrait: ripples, spinning ring, 3D tilt */}
      <div className="relative mt-6 mb-8">
        {[0].map((i) => (
          <span
            key={i}
            aria-hidden="true"
            style={{ "--i": i } as CSSProperties}
            className="hero-ripple pointer-events-none absolute inset-0 -z-10 rounded-t-full rounded-b-3xl border border-accent"
          />
        ))}
        <div
          ref={tiltRef}
          className="hero-float"
          style={{
            transform:
              "perspective(900px) rotateX(var(--rx,0deg)) rotateY(var(--ry,0deg))",
          }}
        >
          <div className="hero-ring rounded-t-full rounded-b-[2rem] p-1.5 shadow-[0_30px_80px_-30px] shadow-primary/60">
            <Portrait
              name={person.name}
              src={person.photo}
              shape="arch"
              className="w-44 ring-4 ring-background sm:w-52"
            />
          </div>
        </div>
      </div>

      <h3 className="m-0 text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold leading-[1.05] tracking-tight text-balance">
        {words.map((w, i) => (
          <span
            key={i}
            className="inline-block overflow-hidden pb-2 align-bottom"
          >
            <span
              className="hero-word mr-[0.28em]"
              style={{ "--i": i } as CSSProperties}
            >
              {w}
            </span>
          </span>
        ))}
      </h3>

      <span className="line-grow mt-4 block h-0.5 w-28 rounded-full bg-linear-to-r from-transparent via-accent to-transparent" />

      <p className="shimmer-text mt-4 font-heading text-lg font-semibold sm:text-xl">
        {person.title}
      </p>
    </div>
  );
}
