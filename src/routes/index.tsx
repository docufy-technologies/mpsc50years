import { createFileRoute } from "@tanstack/react-router";
import { CelebrateTogether } from "@/components/blocks/celebrate-together";
import { Stepper } from "@/components/blocks/participation-stepper";
import { TiltedGridHero } from "@/components/blocks/tilted-grid-hero";
import AnimatedButton from "@/components/ui/animated-button";
import VaporCountdown from "@/components/ui/countdown-vapor-digits";

const images = [
  { src: "https://picsum.photos/seed/hero1/1200/675", alt: "Hero image 1" },
  { src: "https://picsum.photos/seed/hero2/1200/675", alt: "Hero image 2" },
  { src: "https://picsum.photos/seed/hero3/1200/675", alt: "Hero image 3" },
  { src: "https://picsum.photos/seed/hero4/1200/675", alt: "Hero image 4" },
  { src: "https://picsum.photos/seed/hero5/1200/675", alt: "Hero image 5" },
  { src: "https://picsum.photos/seed/hero6/1200/675", alt: "Hero image 6" },
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
  return (
    <>
      <section id="hero" className="h-screen flex items-center justify-center">
        <TiltedGridHero
          images={images}
          className="h-[75dvh] w-full bg-background"
        >
          <div className="relative px-4 z-10 flex h-full flex-col items-center justify-between text-center max-w-3xl mx-auto py-4">
            <div className="w-full flex flex-col items-center gap-2 md:pt-12">
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
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-col items-center justify-center gap-2">
                <img src="/mpsc.png" alt="MPSC Logo" className="h-14" />
                <small>Organizer</small>
              </div>
              <small className="text-muted-foreground max-sm:max-w-[80%] text-center">
                Reserve your spot for the get-together by clicking the button
              </small>
              <AnimatedButton className="uppercase">
                register for the event
              </AnimatedButton>
            </div>
          </div>
        </TiltedGridHero>
      </section>
      <section
        id="participation-steps"
        className="flex flex-col w-full items-center mx-auto max-w-6xl justify-center gap-12 px-4 py-20 md:gap-16 md:py-28 lg:px-8"
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
        <CelebrateTogether />
      </section>
    </>
  );
}
