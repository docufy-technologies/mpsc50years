import { useCallback, useRef, useState } from "react";
import { Reveal } from "@/components/blocks/reveal";
import { TeamCard } from "@/components/blocks/team-card";
import { type CloseMode, TeamReveal } from "@/components/blocks/team-reveal";
import type { TeamSection as TeamSectionData } from "@/data/committee";

type Active = { id: string; anchor: number };

/**
 * A row of committee cards. Clicking one splits the page open right under
 * that card's row (see TeamReveal). Only one committee is open at a time.
 */
export function TeamSection({
  section,
  children,
}: {
  section: TeamSectionData;
  /** Heading rendered above the cards */
  children?: React.ReactNode;
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const triggers = useRef<Record<string, HTMLButtonElement | null>>({});
  const queued = useRef<Active | null>(null);
  const [active, setActive] = useState<Active | null>(null);
  const [closing, setClosing] = useState<CloseMode | null>(null);

  /** index of the last card sharing a visual row with `button`'s card */
  const rowEnd = (button: HTMLButtonElement) => {
    const cards = Array.from(
      listRef.current?.querySelectorAll<HTMLElement>("[data-card]") ?? [],
    );
    const own = button.closest<HTMLElement>("[data-card]");
    if (!own) return 0;
    let end = cards.indexOf(own);
    cards.forEach((c, i) => {
      if (c.offsetTop === own.offsetTop) end = Math.max(end, i);
    });
    return end;
  };

  const onToggle = (id: string, button: HTMLButtonElement) => {
    const next = { id, anchor: rowEnd(button) };
    if (!active) return setActive(next);
    if (active.id === id) return setClosing((m) => m ?? "restore");
    queued.current = next; // switch: close this one first, then open the new
    setClosing((m) => m ?? "restore");
  };

  const onAskClose = useCallback(
    (mode: CloseMode) => setClosing((m) => m ?? mode),
    [],
  );

  const onClosed = useCallback(() => {
    const prev = active;
    const next = queued.current;
    queued.current = null;
    setClosing(null);
    setActive(next);
    if (!next && prev) {
      triggers.current[prev.id]?.focus({ preventScroll: true });
    }
  }, [active]);

  const activeTeam = section.teams.find((t) => t.id === active?.id);

  return (
    <section aria-labelledby={section.heading}>
      {children}
      {/* spacing between committee cards: gap-x / gap-y. 1 column on small
          screens, 3 per row from lg up (all six sit on the same level) */}
      <ul
        ref={listRef}
        className="m-0 grid list-none grid-cols-1 gap-x-6 gap-y-6 p-0 lg:grid-cols-3"
      >
        {section.teams.flatMap((team, i) => {
          const items = [
            <li
              key={team.id}
              data-card
              className="mt-0"
            >
              <Reveal delay={(i % 3) * 120} className="h-full">
                <TeamCard
                  ref={(el) => {
                    triggers.current[team.id] = el;
                  }}
                  team={team}
                  open={active?.id === team.id}
                  onToggle={(b) => onToggle(team.id, b)}
                />
              </Reveal>
            </li>,
          ];
          if (active && activeTeam && active.anchor === i) {
            items.push(
              // full-bleed row: spans every column and is wider than the grid
              <li
                key={`reveal-${active.id}`}
                className="col-span-full m-0 ml-[calc(50%-50vw)] w-screen"
              >
                <TeamReveal
                  team={activeTeam}
                  eyebrow={section.heading}
                  closing={closing}
                  onAskClose={onAskClose}
                  onClosed={onClosed}
                />
              </li>,
            );
          }
          return items;
        })}
      </ul>
    </section>
  );
}
