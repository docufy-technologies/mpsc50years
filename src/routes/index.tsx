import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CelebrateTogether } from "@/components/blocks/celebrate-together";
import { Stepper } from "@/components/blocks/participation-stepper";
import { TiltedGridHero } from "@/components/blocks/tilted-grid-hero";
import AnimatedButton from "@/components/ui/animated-button";
import VaporCountdown from "@/components/ui/countdown-vapor-digits";

const images = [
  { src: "/home/IMG-20260927-WA0230.jpg", alt: "Hero image 1" },
  { src: "/home/IMG-20261005-WA0105.jpg", alt: "Hero image 2" },
  { src: "/home/IMG-20261006-WA0034.jpg", alt: "Hero image 3" },
  { src: "/home/IMG-20261006-WA0066.jpg", alt: "Hero image 4" },
  { src: "/home/IMG-20261011-WA0023.jpg", alt: "Hero image 5" },
  { src: "/home/IMG-20261011-WA0250.jpg", alt: "Hero image 6" },
];

const participationSteps = [
  {
    title: "Register",
    description: "Create a profile, it takes only 5 minutes!",
  },
  {
    title: "Make payment",
    description: "Payment instantly confirms your spot.",
  },
  {
    title: "Attend the get-together",
    description:
      "Meet your batchmates, join the programs, and celebrate 50 years of MPSC together.",
  },
];

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const navigate = useNavigate();
  return (
    <>
      <section id="hero" className="h-screen flex items-center justify-center">
        <TiltedGridHero
          images={images}
          className="h-[80dvh] w-full bg-background"
        >
          <div className="relative px-8 z-10 flex h-full flex-col items-center justify-between text-center max-w-3xl mx-auto py-4">
            <div className="w-full flex flex-col items-center gap-2">
              <div className="flex items-center justify-center gap-2">
                <img src="/logo.png" alt="MPSC Logo" className="h-20" />
              </div>
              <h1>
                Celebrating <span className="text-accent">Golden Jubilee</span>
              </h1>
              <p className="text-muted-foreground">
                50 years of Mohammadpur Preparatory School & College (MPSC)
              </p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="flex flex-col items-center justify-center gap-2 pb-2">
                <img src="/mpsc.png" alt="MPSC Logo" className="h-14" />
                <small>Organizer</small>
              </div>
              <small className="text-muted-foreground max-sm:max-w-[80%] text-center">
                Reserve your spot by clicking the button. Have questions?{" "}
                <Link to="/faq" className="border-b border-primary">
                  Check FAQ
                </Link>
              </small>
              <AnimatedButton
                onClick={() => navigate({ to: "/register" })}
                className="uppercase"
              >
                register for the event
              </AnimatedButton>
            </div>
          </div>
        </TiltedGridHero>
      </section>
      <section
        id="participation-steps"
        className="flex flex-col w-full items-center mx-auto max-w-6xl justify-center gap-12 px-8 py-20 md:gap-16 md:py-28"
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center">
          <h1>
            Three Steps to <span className="text-accent">Get-together</span>
          </h1>
        </div>
        <Stepper steps={participationSteps} className="mx-auto max-w-5xl" />
      </section>
      <section
        id="reg-call-countdown"
        className="flex flex-col h-screen w-full items-center justify-center gap-8 px-6 text-center"
      >
        <p className="text-sm font-mono text-muted-foreground uppercase tracking-wide">
          Registration closes in
        </p>
        <VaporCountdown targetDate={new Date("2026-11-10T23:59:59")} />
        <CelebrateTogether onClick={() => navigate({ to: "/register" })} />
      </section>
    </>
  );
}
