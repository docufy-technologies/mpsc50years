import { IconArrowRight } from "@tabler/icons-react";
import { createFileRoute, Link, type LinkProps } from "@tanstack/react-router";

export const Route = createFileRoute("/involve/")({
  component: RouteComponent,
});

const OPTIONS = [
  {
    to: "/involve/stall",
    label: "Book a Stall",
    description:
      "Run a stall at the get-together — food, fashion, books, crafts, and more.",
  },
  {
    to: "/involve/sponsor",
    label: "Sponsor",
    description:
      "Support the Golden Jubilee as an individual, a company, or with an in-kind contribution.",
  },
  {
    to: "/involve/subcommittee",
    label: "Join a Sub-committee",
    description: "Volunteer your time and skills across event committees.",
  },
  {
    to: "/involve/openmic",
    label: "Open Mic",
    description:
      "Take the stage — sing, recite, perform, and entertain the crowd.",
  },
] as const satisfies readonly {
  to: LinkProps["to"];
  label: string;
  description: string;
}[];

function RouteComponent() {
  return (
    <>
      <div className="mt-16 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Get Involved in More
        </h1>
        <p className="mt-2 text-muted-foreground">
          Beyond registering as Alumni, there are many ways you can shine your
          position.
        </p>
      </div>
      <div className="mt-8 grid grid-cols-1 gap-4">
        {OPTIONS.map((option) => (
          <Link
            key={option.to}
            to={option.to}
            className="group relative flex flex-col gap-1 rounded-xl border border-border p-4 transition-colors hover:border-primary/50 hover:bg-secondary/50"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold p-0">{option.label}</h3>
              <IconArrowRight
                className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
                aria-hidden
              />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {option.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
