import { createFileRoute } from "@tanstack/react-router";
import Gallery from "@/components/ui/gallery";
import { TeamShowcase, type TeamMember } from "@/components/ui/team-showcase";
import { Timeline } from "@/components/ui/timeline";

export const Route = createFileRoute("/about")({
  component: RouteComponent,
});

const evolution = [
  {
    id: "1976",
    year: "1976",
    name: "Mohammadpur Preparatory School",
    content:
      "Established in 1976 with preschool, kindergarten and primary classes, it gradually grew into a full-fledged secondary high school.",
  },
  {
    id: "1993",
    year: "1993",
    name: "Mohammadpur Preparatory Higher Secondary Girls' School / Girls College",
    content:
      "Class XI (higher secondary) was introduced, widening the institution's scope for female students.",
  },
  {
    id: "2004",
    year: "2004",
    name: "Mohammadpur Preparatory Higher Secondary School / College branches",
    content:
      "A separate boys' college branch opened at Asad Avenue to offer higher secondary education for male students.",
  },
  {
    id: "2018",
    year: "2018",
    name: "Mohammadpur Preparatory School & College",
    content:
      "The unified structure of preschool, school and college across the Boys' and Girls' wings took its current formal name.",
  },
];

const chairmen: TeamMember[] = [
  { name: "Quazi Azher Ali", designation: "Former Chairman" },
  { name: "M A Malek", designation: "Former Chairman" },
  { name: "Ata Uddin Khan", designation: "Former Chairman" },
  { name: "Prof. Dr. M Tamim", designation: "Chairman, Board of Trustees" },
];

const principal: TeamMember = {
  name: "Dr. Md. Anwarul Islam",
  designation: "Principal",
};

// total 9 vice principals, names are coming, creating blocks first
const vicePrincipals: TeamMember[] = [
  { name: "Name 1", designation: "Vice Principal" },
  { name: "Name 2", designation: "Vice Principal" },
  { name: "Name 3", designation: "Vice Principal" },
  { name: "Name 4", designation: "Vice Principal" },
  { name: "Name 5", designation: "Vice Principal" },
  { name: "Name 6", designation: "Vice Principal" },
  { name: "Name 7", designation: "Vice Principal" },
  { name: "Name 8", designation: "Vice Principal" },
  { name: "Name 9", designation: "Vice Principal" },
];

const aboutImages = [
  { src: "/about/optimized/722A3191.jpg", alt: "MPSC campus" },
  { src: "/about/optimized/IMG-20260927-WA0795.jpg", alt: "MPSC event" },
  { src: "/about/optimized/IMG-20261005-WA0017.jpg", alt: "MPSC gathering" },
  { src: "/about/optimized/IMG-20261006-WA0077.jpg", alt: "MPSC celebration" },
  { src: "/about/optimized/IMG-20261011-WA0171.jpg", alt: "MPSC alumni" },
  { src: "/about/optimized/IMG-20261011-WA0191.jpg", alt: "MPSC memories" },
  { src: "/about/optimized/_MG_6135.jpg", alt: "MPSC photo 1" },
  { src: "/about/optimized/_MG_6276.jpg", alt: "MPSC photo 2" },
  { src: "/about/optimized/_MG_6298.jpg", alt: "MPSC photo 3" },
  { src: "/about/optimized/_MG_6344.jpg", alt: "MPSC photo 4" },
  { src: "/about/optimized/_MG_6588.jpg", alt: "MPSC photo 5" },
];

function RouteComponent() {
  return (
    <>
      <section className="relative h-screen w-full overflow-hidden">
        <Gallery
          images={aboutImages}
          speed={1.25}
          zSpacing={3}
          visibleCount={12}
          falloff={{ near: 3, far: 10 }}
          className="h-screen w-full overflow-hidden"
        />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-3 text-center text-white mix-blend-exclusion">
          <h1 className="font-serif text-4xl tracking-tight md:text-8xl">
            <span className="italic">50 Years of MPSC</span>
          </h1>
        </div>
      </section>
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-20">
        <div className="flex flex-col gap-2">
          <h1>Evolution</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            50 years of Mohammadpur Preparatory School & College.
          </p>
        </div>
        <Timeline items={evolution} />
      </section>
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-20">
        <div className="flex flex-col gap-2">
          <h1>Chairmen</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Past and present chairmen of the Board of Trustees.
          </p>
        </div>
        <TeamShowcase members={chairmen} />
      </section>
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-20">
        <div className="flex flex-col gap-2">
          <h1>Principal</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Leading MPSC into its next 50 years.
          </p>
        </div>
        <TeamShowcase members={[principal]} />
      </section>
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-20">
        <div className="flex flex-col gap-2">
          <h1>Vice Principals</h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Supporting the Principal in leading MPSC.
          </p>
        </div>
        <TeamShowcase members={vicePrincipals} />
      </section>
    </>
  );
}
