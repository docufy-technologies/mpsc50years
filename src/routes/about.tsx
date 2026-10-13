import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type CSSProperties, useEffect, useRef } from "react";
import { Portrait } from "@/components/blocks/portrait";
import AnimatedButton from "@/components/ui/animated-button";

export const Route = createFileRoute("/about")({
  component: RouteComponent,
});

const aboutSchool = [
  "Students of Mohammadpur Preparatory School & College have given the nation's education system a warm sense of trust, reliability and success. For its originality, skill, integrity and fluency, the institution has become a guiding star of Bangladesh's education sector.",
  "Thanks to its experienced and capable teachers, the school has earned places on the merit list in the PEC, JSC and SSC examinations year after year. For several decades, its well-planned teaching methods have set a proud example of enviable results and sound guidance.",
  "Located in the heart of the capital, the institution does more than teach: it nurtures students' intellectual growth and helps them establish themselves in life. The authority is committed to full student safety, a suitable curriculum and the highest standard of service.",
];

const START = 1976;
const END = 2026;

const evolution = [
  {
    year: 1976,
    until: 1993,
    name: "Mohammadpur Preparatory School",
    text: "Established in 1976 with preschool, kindergarten and primary classes, it gradually grew into a full-fledged secondary high school.",
  },
  {
    year: 1993,
    until: 2004,
    name: "Mohammadpur Preparatory Higher Secondary Girls' School / Girls College",
    text: "Class XI (higher secondary) was introduced, widening the institution's scope for female students.",
  },
  {
    year: 2004,
    until: 2018,
    name: "Mohammadpur Preparatory Higher Secondary School / College branches",
    text: "A separate boys' college branch opened at Asad Avenue to offer higher secondary education for male students.",
  },
  {
    year: 2018,
    until: END,
    name: "Mohammadpur Preparatory School & College",
    text: "The unified structure of preschool, school and college across the Boys' and Girls' wings took its current formal name.",
  },
];

const decadeLabels = [1980, 1990, 2000, 2010, 2020];

const occasions = [
  "Reconnect with classmates and teachers",
  "Revisit the memories that stayed",
  "Recognise achievements across five decades",
  "Honour the people who shaped MPSC",
  "Strengthen bonds that outlast school years",
];

const chairmen = [
  { name: "Quazi Azher Ali", title: "Former Chairman" },
  { name: "M A Malek", title: "Former Chairman" },
  { name: "Ata Uddin Khan", title: "Former Chairman" },
  { name: "Prof. Dr. M Tamim", title: "Chairman, Board of Trustees" },
];

const principal = { name: "Dr. Md. Anwarul Islam", title: "Principal" };

const onScroll =
  "animate-in fade-in fill-mode-both [animation-timeline:view()]! [animation-range:entry_5%_entry_55%]!";

function Heading({
  id,
  children,
  sticky = true,
}: {
  id: string;
  children: React.ReactNode;
  sticky?: boolean;
}) {
  return (
    <h2
      id={id}
      className={`m-0 pb-0 font-heading text-3xl font-extrabold leading-tight tracking-tight text-foreground sm:text-4xl ${
        sticky ? "lg:sticky lg:top-28" : ""
      }`}
    >
      {children}
    </h2>
  );
}

function Hero() {
  const words = ["Fifty", "years", "in", "session."];
  return (
    <header className="max-w-4xl">
      <h1 className="m-0 font-heading text-[clamp(2.75rem,9vw,7rem)] font-extrabold leading-[1.02] tracking-tight">
        {words.map((w, i) => (
          <span key={w}>
            <span className="inline-block overflow-hidden pb-2 align-bottom">
              <span
                className="inline-block animate-in slide-in-from-bottom-full duration-1000 fill-mode-both"
                style={{ animationDelay: `${200 + i * 140}ms` }}
              >
                {w}
              </span>
            </span>
            {i < words.length - 1 ? " " : null}
          </span>
        ))}
      </h1>
      <p
        className="mt-8 max-w-xl animate-in fade-in text-lg text-muted-foreground duration-1000 fill-mode-both"
        style={{ animationDelay: "1000ms" }}
      >
        Learning, character and community, from the first classroom in 1976 to
        the Golden Jubilee.
      </p>
    </header>
  );
}

function School() {
  return (
    <section
      aria-labelledby="about-school"
      className="grid gap-10 lg:grid-cols-[14rem_1fr] lg:gap-16"
    >
      <div>
        <Heading id="about-school">About the School</Heading>
      </div>
      <div className="max-w-2xl space-y-6">
        {aboutSchool.map((p, i) => (
          <p
            key={p}
            className={`${onScroll} ${
              i === 0
                ? "font-heading text-xl leading-relaxed text-foreground sm:text-2xl sm:leading-relaxed"
                : "text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8"
            }`}
          >
            {p}
          </p>
        ))}
      </div>
    </section>
  );
}

function NameTimeline() {
  const trackRef = useRef<HTMLDivElement>(null);
  const markerRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const track = trackRef.current;
      const marker = markerRef.current;
      const label = yearRef.current;
      if (!track || !marker || !label) return;
      const r = track.getBoundingClientRect();
      const f = (window.innerHeight * 0.45 - r.top) / r.height;
      const clamped = Math.min(1, Math.max(0, f));
      const yearNow = START + clamped * (END - START);
      for (const m of track.querySelectorAll<HTMLElement>("[data-year]")) {
        m.style.opacity =
          Math.abs(Number(m.dataset.year) - yearNow) < 1.8 ? "0" : "1";
      }
      marker.style.top = `${clamped * 100}%`;
      marker.style.opacity = f < -0.02 || f > 1.02 ? "0" : "1";
      label.textContent = String(Math.round(START + clamped * (END - START)));
    };
    const onFrame = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onFrame, { passive: true });
    window.addEventListener("resize", onFrame);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onFrame);
      window.removeEventListener("resize", onFrame);
    };
  }, []);

  const at = (year: number) =>
    ({ top: `calc(var(--yr) * ${year - START})` }) as CSSProperties;

  return (
    <section
      aria-labelledby="evolution"
      className="grid gap-10 lg:grid-cols-[14rem_1fr] lg:gap-16"
    >
      <div>
        <div className="lg:sticky lg:top-28">
          <Heading id="evolution" sticky={false}>
            Evolution of Our Name
          </Heading>
          <p className="mt-4 max-w-xs text-sm text-muted-foreground">
            Drawn to scale. Every tick is one year, so a longer bar means a
            longer time under that name.
          </p>
        </div>
      </div>

      <div
        ref={trackRef}
        className="relative ml-0 [--yr:2.2rem] sm:[--yr:2.4rem]"
        style={{ height: "calc(var(--yr) * 50 + 3rem)" }}
      >
        <div
          aria-hidden
          className="absolute inset-y-0 left-10 w-2 bg-[repeating-linear-gradient(to_bottom,var(--muted-foreground)_0_1px,transparent_1px_var(--yr))] opacity-50 sm:left-12"
          style={{ height: "calc(var(--yr) * 50 + 1px)" }}
        />
        {decadeLabels.map((y) => (
          <span
            key={y}
            aria-hidden
            data-year={y}
            className="absolute left-0 -translate-y-1/2 text-xs text-muted-foreground"
            style={at(y)}
          >
            {y}
          </span>
        ))}

        {evolution.map((item, i) => {
          const current = i === evolution.length - 1;
          const span = item.until - item.year;
          return (
            <div key={item.year}>
              <div
                aria-hidden
                className="absolute left-[3.25rem] w-1.5 overflow-hidden rounded-full sm:left-[3.75rem]"
                style={{
                  ...at(item.year),
                  height: `calc(var(--yr) * ${span} - 0.35rem)`,
                }}
              >
                <div
                  className={`size-full animate-in slide-in-from-top-full fill-mode-both [animation-timeline:view()]! [animation-range:entry_0%_entry_90%]! ${
                    current ? "bg-accent" : "bg-primary"
                  }`}
                />
              </div>
              <article
                className={`absolute right-0 left-[5.25rem] sm:left-[6.25rem] ${onScroll}`}
                style={at(item.year)}
              >
                <p className="m-0 font-heading text-3xl font-extrabold leading-none text-accent sm:text-4xl">
                  {item.year}
                </p>
                <h3 className="mt-2 font-heading text-base font-semibold leading-snug sm:text-lg">
                  {item.name}
                </h3>
                <p className="mt-1 max-w-lg text-sm leading-6 text-muted-foreground">
                  {item.text}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  {current
                    ? `${span} years and counting`
                    : `Used for ${span} years`}
                </p>
              </article>
            </div>
          );
        })}

        <p
          data-year={END}
          className="absolute left-0 m-0 text-sm font-semibold text-accent"
          style={{ ...at(END), marginTop: "0.25rem" }}
        >
          2026
        </p>
        <p
          className="absolute left-[5.25rem] m-0 text-sm text-muted-foreground sm:left-[6.25rem]"
          style={{ ...at(END), marginTop: "0.25rem" }}
        >
          Golden Jubilee
        </p>

        <div
          ref={markerRef}
          aria-hidden
          className="pointer-events-none absolute left-0 z-10 flex w-[4.75rem] items-center transition-none! sm:w-[5.5rem]"
          style={{ top: 0 }}
        >
          <span
            ref={yearRef}
            className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-neutral-900"
          >
            1976
          </span>
          <span className="h-px flex-1 bg-accent" />
        </div>
      </div>
    </section>
  );
}

function Event() {
  const navigate = useNavigate();
  return (
    <section
      aria-labelledby="about-event"
      className="grid gap-10 lg:grid-cols-[14rem_1fr] lg:gap-16"
    >
      <div>
        <Heading id="about-event">About the Event</Heading>
      </div>
      <div className="max-w-2xl">
        <p
          className={`${onScroll} font-heading text-xl leading-relaxed sm:text-2xl sm:leading-relaxed`}
        >
          The Golden Jubilee get-together brings students, teachers, guardians,
          alumni and well-wishers back to MPSC to mark fifty years together.
        </p>
        <ul className="m-0 mt-8 list-none border-t p-0">
          {occasions.map((o) => (
            <li
              key={o}
              className={`mt-0 border-b py-4 text-base text-muted-foreground sm:text-lg ${onScroll}`}
            >
              {o}
            </li>
          ))}
        </ul>
        <div className="mt-10 flex flex-wrap items-center gap-6">
          <AnimatedButton
            onClick={() => navigate({ to: "/register" })}
            className="uppercase"
          >
            register for the event
          </AnimatedButton>
          <Link
            to="/faq"
            className="text-sm text-muted-foreground underline underline-offset-4 hover:text-accent"
          >
            Read the FAQs
          </Link>
        </div>
      </div>
    </section>
  );
}

function PersonCard({ name, title }: { name: string; title: string }) {
  return (
    <li
      className={`mt-0 flex items-center gap-5 rounded-2xl border bg-card p-5 sm:gap-6 sm:p-6 ${onScroll}`}
    >
      <Portrait
        name={name}
        shape="portrait"
        className="w-24 ring-1 ring-border sm:w-32"
      />
      <div className="min-w-0">
        <p className="m-0 font-heading text-xl font-semibold leading-snug sm:text-2xl">
          {name}
        </p>
        <p className="m-0 mt-2 text-sm text-muted-foreground sm:text-base">
          {title}
        </p>
      </div>
    </li>
  );
}

function People() {
  return (
    <section
      aria-labelledby="chairmen"
      className="grid gap-10 lg:grid-cols-[14rem_1fr] lg:gap-16"
    >
      <div>
        <Heading id="chairmen">School Leadership</Heading>
      </div>
      <div className="max-w-4xl">
        <h3 className="m-0 text-sm font-semibold text-muted-foreground">
          Chairmen
        </h3>
        <ul className="m-0 mt-4 grid list-none gap-4 p-0 sm:grid-cols-2">
          {chairmen.map((p) => (
            <PersonCard key={p.name} {...p} />
          ))}
        </ul>
        <h3 className="m-0 mt-12 text-sm font-semibold text-muted-foreground">
          Principal
        </h3>
        <ul className="m-0 mt-4 grid list-none gap-4 p-0 sm:grid-cols-2">
          <PersonCard {...principal} />
        </ul>
      </div>
    </section>
  );
}

function RouteComponent() {
  return (
    <div className="overflow-x-clip">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 z-50 h-20 bg-linear-to-b from-background from-55% to-transparent"
      />
      <div className="mx-auto mt-10 max-w-6xl space-y-32 px-6 py-32">
        <Hero />
        <School />
        <NameTimeline />
        <Event />
        <People />
      </div>
    </div>
  );
}