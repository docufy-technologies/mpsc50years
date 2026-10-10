import { createFileRoute } from "@tanstack/react-router";
import { TiltedGridHero } from "@/components/blocks/tilted-grid-hero";
import AnimatedButton from "#/components/ui/animated-button";

const IMAGES = [
  { src: "https://picsum.photos/seed/hero1/1200/675", alt: "Hero image 1" },
  { src: "https://picsum.photos/seed/hero2/1200/675", alt: "Hero image 2" },
  { src: "https://picsum.photos/seed/hero3/1200/675", alt: "Hero image 3" },
  { src: "https://picsum.photos/seed/hero4/1200/675", alt: "Hero image 4" },
  { src: "https://picsum.photos/seed/hero5/1200/675", alt: "Hero image 5" },
  { src: "https://picsum.photos/seed/hero6/1200/675", alt: "Hero image 6" },
];

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <div className="h-screen flex items-center justify-center">
      <TiltedGridHero
        images={IMAGES}
        className="h-[75dvh] w-full bg-background"
      >
        <div className="relative z-10 flex h-full flex-col items-center text-center max-w-3xl mx-auto gap-2 py-20">
          <h1>
            Celebrating <span className="text-primary">Golden Jubilee</span>
          </h1>
          <p className="text-muted-foreground text-lg">
            50 years of Mohammadpur Preparatory School & College (MPSC)
          </p>
          <AnimatedButton className="uppercase">
            register for the event
          </AnimatedButton>
        </div>
      </TiltedGridHero>
    </div>
  );
}
