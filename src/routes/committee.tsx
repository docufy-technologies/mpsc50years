import { createFileRoute } from "@tanstack/react-router";
import { TeamShowcase, type TeamMember } from "@/components/ui/team-showcase";
import {
  advisingCommittee,
  steeringCommittee,
  teamSections,
  type Member,
  type Person,
  type Role,
} from "@/data/committee";

export const Route = createFileRoute("/committee")({
  component: RouteComponent,
});

function personToMember(person: Person): TeamMember {
  return {
    name: person.name,
    designation: person.role
      ? `${person.role} · ${person.title}`
      : person.title,
    image: person.photo,
  };
}

function isGroupEntry(member: Member): member is { name: string; group: true } {
  return typeof member !== "string";
}

function roleToMembers(role: Role): TeamMember[] {
  return role.people
    .filter((p): p is string => !isGroupEntry(p))
    .map((name) => ({ name, designation: role.title }));
}

function roleGroupNotes(role: Role): string[] {
  return role.people.filter(isGroupEntry).map((g) => g.name);
}

function RouteComponent() {
  return (
    <div className="px-4 py-30">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-2 pb-16">
        <h1>Committee</h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Advising, steering, and core teams behind the 50 years celebration.
        </p>
      </div>

      <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 pb-20">
        <div className="flex flex-col gap-2">
          <h2>Advising Committee</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Board of Trustees guiding the celebration.
          </p>
        </div>
        <TeamShowcase members={advisingCommittee.map(personToMember)} />
      </section>

      <section className="mx-auto flex w-full max-w-3xl flex-col gap-8 pb-20">
        <div className="flex flex-col gap-2">
          <h2>Steering Committee</h2>
          <p className="text-sm leading-6 text-muted-foreground">
            Chief patron and convener leading the program.
          </p>
        </div>
        <TeamShowcase members={steeringCommittee.map(personToMember)} />
      </section>

      {teamSections.map((section) => (
        <section
          key={section.heading}
          className="mx-auto flex w-full max-w-3xl flex-col gap-10 pb-10"
        >
          <div className="flex w-full flex-col gap-2">
            <h2>{section.heading}</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Day-wise coordinators, stage, cultural, and support teams.
            </p>
          </div>

          {section.teams.map((team) => (
            <article key={team.id} className="flex flex-col gap-8">
              <div className="flex flex-col gap-4">
                <h5>{team.name}</h5>
                <TeamShowcase
                  members={team.supervisors.map((name) => ({
                    name,
                    designation: `${team.supervisorTitle} · Supervisor`,
                  }))}
                />
              </div>

              {team.groups.map((group, gi) => (
                <div
                  key={`${team.id}-${group.heading ?? gi}`}
                  className="flex flex-col gap-6"
                >
                  {group.heading && (
                    <p className="text-sm font-mono uppercase tracking-wide text-muted-foreground">
                      {group.heading}
                    </p>
                  )}
                  {group.roles.map((role) => {
                    const members = roleToMembers(role);
                    const notes = roleGroupNotes(role);
                    return (
                      <div key={role.title} className="flex flex-col gap-3">
                        <h4 className="text-base font-semibold">
                          {role.title}
                        </h4>
                        {members.length > 0 && (
                          <TeamShowcase members={members} />
                        )}
                        {notes.map((note) => (
                          <p
                            key={note}
                            className="rounded-lg bg-muted px-4 py-2 text-sm text-muted-foreground"
                          >
                            {note}
                          </p>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}
