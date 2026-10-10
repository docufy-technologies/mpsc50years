import { createFileRoute } from "@tanstack/react-router";
import AnimatedButton from "#/components/ui/animated-button";
import { TiltedGridHero } from "@/components/blocks/tilted-grid-hero";
import { ParticipationStepper } from "@/components/blocks/participation-stepper";

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
          className="h-[60dvh] md:h-[75dvh] w-full bg-background"
        >
          <div className="relative px-4 z-10 flex h-full flex-col items-center justify-between text-center max-w-3xl mx-auto md:py-10">
            <div className="w-full flex flex-col items-center gap-2 pt-8 md:pt-24">
              <h1>
                Celebrating <span className="text-accent">Golden Jubilee</span>
              </h1>
              <p className="text-muted-foreground">
                50 years of Mohammadpur Preparatory School & College (MPSC)
              </p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <small className="text-muted-foreground max-sm:max-w-[80%] text-center">
                reserve your spot for the get-together by clicking the button
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
        className="flex w-full items-center justify-center bg-background"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col justify-center gap-12 px-4 py-20 md:gap-16 md:py-28 lg:px-8">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 text-center">
            <h1>
              Three Steps to <span className="text-accent">Get-together</span>
            </h1>
          </div>

          <ParticipationStepper
            steps={participationSteps}
            className="mx-auto max-w-5xl"
          />
        </div>
      </section>
    </>
  );
}
