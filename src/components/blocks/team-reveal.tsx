import { IconX } from "@tabler/icons-react";
import {
  type CSSProperties,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Portrait } from "@/components/blocks/portrait";
import type { Member, Team } from "@/data/committee";

const memberName = (m: Member) => (typeof m === "string" ? m : m.name);
const isGroup = (m: Member) => typeof m !== "string";

const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const jump = (top: number) =>
  window.scrollTo({ top: Math.max(0, top), behavior: "instant" });

const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));

export type CloseMode = "restore" | "instant";

type Props = {
  team: Team;
  eyebrow: string;
  /** Set by the parent to start the closing animation */
  closing: CloseMode | null;
  /** The user asked to close (button / Esc) or scrolled away */
  onAskClose: (mode: CloseMode) => void;
  onClosed: () => void;
};

const OPEN_MS = 1100;
const CLOSE_MS = 800;
const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

/**
 * Every in-flow element that sits before / after `el` in the document, found
 * by walking up the tree and collecting the siblings at each level. These are
 * the things that visually move apart.
 */
function collectSides(el: HTMLElement) {
  const above: HTMLElement[] = [];
  const below: HTMLElement[] = [];
  let node: HTMLElement = el;
  while (node.parentElement && node !== document.body) {
    const parent: HTMLElement = node.parentElement;
    let past = false;
    for (const sib of Array.from(parent.children)) {
      if (sib === node) {
        past = true;
        continue;
      }
      if (!(sib instanceof HTMLElement)) continue;
      const { position, display } = getComputedStyle(sib);
      if (display === "none" || position === "fixed" || position === "absolute")
        continue;
      (past ? below : above).push(sib);
    }
    node = parent;
  }
  return { above, below };
}

/** How much room the panel's row adds to the page: its height plus one grid gap. */
function layoutExtra(wrap: HTMLElement) {
  const host = wrap.parentElement;
  const grid = host?.parentElement;
  const gap = grid ? Number.parseFloat(getComputedStyle(grid).rowGap) : 0;
  return wrap.offsetHeight + (Number.isFinite(gap) ? gap : 0);
}

/**
 * The push-apart, done with transforms only.
 *
 * The panel is already in the layout (it added `L` px to the page) and the
 * scroll has already been moved by `d`. The things above are visually put
 * back where they were (+d), the things below too (-(L - d)), and the panel
 * is clipped to exactly the gap between them. Playing that to zero grows the
 * gap, with no layout or scroll work per frame, so there is nothing to snap.
 * `reverse` plays the same thing backwards for closing.
 */
function playSplit(
  wrap: HTMLElement,
  L: number,
  d: number,
  reverse: boolean,
) {
  const { above, below } = collectSides(wrap);
  const ms = reverse ? CLOSE_MS : OPEN_MS;
  const opts: KeyframeAnimationOptions = {
    duration: ms,
    easing: EASE,
    fill: reverse ? "forwards" : "backwards",
  };
  const order = <T,>(from: T, to: T): T[] => (reverse ? [to, from] : [from, to]);
  const shift = (el: HTMLElement, px: number) =>
    el.animate(
      order(
        { transform: `translateY(${px}px)`, composite: "add" as const },
        { transform: "translateY(0px)", composite: "add" as const },
      ),
      opts,
    );

  const clipFrom = `inset(${d}px 0px ${L - d}px 0px)`;
  const clipTo = "inset(0px 0px 0px 0px)";
  const panel = wrap.animate(
    order({ clipPath: clipFrom }, { clipPath: clipTo }),
    opts,
  );
  return [
    panel,
    ...above.map((el) => shift(el, d)),
    ...below.map((el) => shift(el, -(L - d))),
  ];
}

/**
 * The page itself splits: this panel is inserted in the flow at the clicked
 * committee's row; content above it moves up, content below moves down.
 * It only opens as tall as its content, and closes again when scrolled away.
 */
export function TeamReveal({
  team,
  eyebrow,
  closing,
  onAskClose,
  onClosed,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const animsRef = useRef<Animation[]>([]);
  const shiftRef = useRef(0); // how far the scroll moved when opening (d)
  const [ready, setReady] = useState(false);
  const closedCb = useRef(onClosed);
  closedCb.current = onClosed;

  // we do our own scroll compensation, so turn native anchoring off
  useEffect(() => {
    const root = document.documentElement;
    root.style.overflowAnchor = "none";
    return () => {
      root.style.overflowAnchor = "";
    };
  }, []);

  // ── open: the panel is already laid out (before first paint); move the
  // scroll so the seam sits mid-screen and play the split from there
  useLayoutEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    if (prefersReducedMotion()) {
      setReady(true);
      return;
    }

    const s0 = window.scrollY;
    const H = wrap.offsetHeight;
    const L = layoutExtra(wrap);
    const vh = window.innerHeight;
    const topDoc = wrap.getBoundingClientRect().top + s0;
    // tall panel: pin its top under the navbar; short panel: centre it
    const f = H >= vh * 0.8 ? topDoc - 88 : topDoc - (vh - H) / 2;
    const maxScroll = document.documentElement.scrollHeight - vh;
    const d = clamp(clamp(f, 0, maxScroll) - s0, 0, L);
    shiftRef.current = d;
    jump(s0 + d);

    const anims = playSplit(wrap, L, d, false);
    animsRef.current = anims;
    anims[0].onfinish = () => {
      setReady(true);
      closeBtnRef.current?.focus({ preventScroll: true });
    };
    return () => {
      for (const a of animsRef.current) a.cancel();
    };
  }, []);

  // ── close
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!closing || !wrap) return;
    for (const a of animsRef.current) a.cancel();

    const host = wrap.parentElement ?? wrap; // the grid row that holds us
    const L = layoutExtra(wrap);
    const y0 = window.scrollY;

    // scrolled away (or reduced motion): nobody can see it, so remove it in
    // one step and keep the reader's view exactly where it was
    if (closing === "instant" || prefersReducedMotion()) {
      const keep = closing === "instant" && wrap.getBoundingClientRect().bottom <= 0;
      host.style.display = "none";
      if (keep) jump(y0 - L);
      closedCb.current();
      return;
    }

    // Close button / Esc: play the split backwards, then remove the panel and
    // move the scroll back in the same frame (so there is no visible jump)
    const d = clamp(shiftRef.current, 0, Math.min(y0, L));
    const anims = playSplit(wrap, L, d, true);
    animsRef.current = anims;
    anims[0].onfinish = () => {
      host.style.display = "none";
      jump(y0 - d);
      for (const a of anims) a.cancel();
      closedCb.current();
    };
    return () => {
      for (const a of animsRef.current) a.cancel();
    };
  }, [closing]);

  // ── scrolled completely away → close back up
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!ready || closing || !wrap) return;
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) onAskClose("instant");
    });
    io.observe(wrap);
    return () => io.disconnect();
  }, [ready, closing, onAskClose]);

  // ── Escape closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !closing) onAskClose("restore");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [closing, onAskClose]);

  const ask = useCallback(() => onAskClose("restore"), [onAskClose]);

  let n = 0;
  const idx = () => ({ "--i": n++ }) as CSSProperties;

  return (
    <section
      ref={wrapRef}
      id={`team-${team.id}`}
      aria-label={team.name}
      // the slightly different background + inner shadow make it read as
      // something that opened up inside the page
      className="relative bg-secondary shadow-[inset_0_14px_22px_-14px_rgb(0_0_0/0.22),inset_0_-14px_22px_-14px_rgb(0_0_0/0.22)]"
    >
      <div className="relative">
        {/* sticky close, follows you while you read the revealed team */}
        <div className="pointer-events-none sticky top-20 z-10 mx-auto flex h-0 max-w-6xl items-start justify-end px-6">
          <button
            ref={closeBtnRef}
            type="button"
            onClick={ask}
            aria-label={`Close ${team.name}`}
            className="pointer-events-auto mt-4 flex cursor-pointer items-center gap-2 rounded-full bg-secondary/90 py-2 pl-4 pr-3 text-sm font-medium backdrop-blur hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Close <IconX className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="mx-auto max-w-5xl px-6 pb-24 pt-12 text-center">
          <p
            className="shutter-pop text-sm font-semibold uppercase tracking-[0.35em] text-accent"
            style={idx()}
          >
            {eyebrow}
          </p>
          <h3
            className="shutter-pop mt-3 text-balance text-4xl font-extrabold sm:text-5xl"
            style={idx()}
          >
            {team.name}
          </h3>

          <div className="mt-10 flex flex-wrap items-start justify-center gap-8">
            {team.supervisors.map((name) => (
              <div
                key={name}
                className="shutter-pop group w-64 max-w-full"
                style={idx()}
              >
                <div className="relative mx-auto w-fit">
                  <div className="absolute -inset-1.5 rounded-full bg-linear-to-br from-accent to-primary opacity-80 group-hover:opacity-100" />
                  <Portrait
                    name={name}
                    className="relative size-32 ring-4 ring-secondary sm:size-36"
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

          <div className="mt-20 space-y-20">
            {team.groups.map((group) => (
              <section key={group.heading ?? "roles"} className="space-y-14">
                {group.heading && (
                  <div
                    className="shutter-pop flex items-center gap-4"
                    style={idx()}
                  >
                    <span className="h-px flex-1 bg-linear-to-r from-transparent to-primary/40" />
                    <h4 className="m-0 text-accent">{group.heading}</h4>
                    <span className="h-px flex-1 bg-linear-to-l from-transparent to-primary/40" />
                  </div>
                )}
                {group.roles.map((role) => (
                  <div key={role.title}>
                    <h5
                      className="shutter-pop m-0 mb-7 font-heading text-lg font-semibold text-muted-foreground"
                      style={idx()}
                    >
                      <span className="border-b-2 border-accent pb-1">
                        {role.title}
                      </span>
                    </h5>
                    <ul className="m-0 flex list-none flex-wrap justify-center gap-x-4 gap-y-10 p-0">
                      {role.people.map((m) => (
                        <li
                          key={memberName(m)}
                          className="shutter-pop group m-0 w-28 sm:w-32"
                          style={idx()}
                        >
                          <Portrait
                            name={memberName(m)}
                            group={isGroup(m)}
                            className="mx-auto size-20 ring-2 ring-border group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:ring-accent sm:size-24"
                          />
                          <p className="mt-3 text-balance text-sm font-medium leading-snug">
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
    </section>
  );
}
