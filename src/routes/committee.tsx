import { createFileRoute } from "@tanstack/react-router";
import { PersonCard } from "@/components/blocks/person-card";
import { Reveal } from "@/components/blocks/reveal";
import { TeamSection } from "@/components/blocks/team-section";
import {
  advisingCommittee,
  steeringCommittee,
  teamSections,
} from "@/data/committee";

export const Route = createFileRoute("/committee")({
  component: RouteComponent,
});

function SectionHeading({
  id,
  children,
  hint,
}: {
  id: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <Reveal className="mb-12 text-center">
      <h2 id={id} className="m-0 pb-0 text-primary">
        {children}
      </h2>
      <span className="mx-auto mt-3 block h-0.5 w-24 rounded-full bg-linear-to-r from-transparent via-accent to-transparent" />
      {hint && <p className="mt-5 text-muted-foreground">{hint}</p>}
    </Reveal>
  );
}

function RouteComponent() {
  return (
    <div className="overflow-x-clip">
      <section className="mx-auto mt-10 max-w-6xl space-y-32 px-6 py-32">
        <header className="mx-auto max-w-3xl text-center">
          <h1 className="reveal" data-in="true">
            Committees Behind The Event
          </h1>
          <span className="line-grow mx-auto mt-4 block h-0.5 w-32 rounded-full bg-linear-to-r from-transparent via-accent to-transparent" />
          <p
            className="reveal mt-5 text-lg text-muted-foreground"
            data-in="true"
            style={{ "--d": "300ms" } as React.CSSProperties}
          >
            Meet the people behind the MPSC Golden Jubilee.
          </p>
        </header>

        <section aria-labelledby="advising-committee">
          <SectionHeading id="advising-committee">
            Advising Committee
          </SectionHeading>

          <ul className="m-0 flex list-none flex-wrap justify-center gap-x-5 gap-y-10 p-0">
            {advisingCommittee.map((person, i) => (
              <li
                key={person.name}
                className="mt-0 w-[calc(50%-0.625rem)] md:w-[calc(25%-0.9375rem)]"
              >
                <Reveal delay={(i % 4) * 90} className="h-full">
                  <PersonCard person={person} />
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="steering-committee">
          <SectionHeading id="steering-committee">
            Central Steering Committee
          </SectionHeading>
          <ul className="m-0 flex list-none flex-wrap justify-center gap-x-6 gap-y-8 p-0">
            {steeringCommittee.map((person, i) => (
              <li key={person.role} className="mt-0 w-full max-w-xs">
                <Reveal delay={i * 150} className="h-full">
                  <PersonCard person={person} featured />
                </Reveal>
              </li>
            ))}
          </ul>
        </section>

        {teamSections.map((section) => (
          <TeamSection key={section.heading} section={section}>
            <SectionHeading
              id={section.heading}
              hint="Select a committee to split the page open and meet the team."
            >
              {section.heading}
            </SectionHeading>
          </TeamSection>
        ))}
      </section>
    </div>
  );
}