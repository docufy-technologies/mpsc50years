import {
  IconArrowRight,
  IconBuildingStore,
  IconHeartHandshake,
  IconMicrophone,
  IconUsersGroup,
} from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/involve/")({
  component: RouteComponent,
});

const OPTIONS = [
  {
    to: "/involve/stall",
    label: "Book a Stall",
    description:
      "Run a stall at the get-together — food, fashion, books, crafts, and more.",
    icon: IconBuildingStore,
  },
  {
    to: "/involve/sponsor",
    label: "Sponsor",
    description:
      "Support the Golden Jubilee as an individual, a company, or with an in-kind contribution.",
    icon: IconHeartHandshake,
  },
  {
    to: "/involve/subcommittee",
    label: "Join a Sub-committee",
    description: "Volunteer your time and skills across event committees.",
    icon: IconUsersGroup,
  },
  {
    to: "/involve/openmic",
    label: "Open Mic",
    description:
      "Take the stage — sing, recite, perform, and entertain the crowd.",
    icon: IconMicrophone,
  },
] as const;

function RouteComponent() {
  return (
    <div>
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Get Involved</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Beyond registering, there are many ways to be part of the MPSC 50
          Years Golden Jubilee. Pick one below, or come back for more.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {OPTIONS.map((option) => (
          <Link
            key={option.to}
            to={option.to}
            className="group relative flex flex-col gap-3 rounded-xl border border-border p-6 transition-colors hover:border-primary/50 hover:bg-secondary/50"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <option.icon className="size-5" aria-hidden />
              </span>
              <IconArrowRight
                className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground"
                aria-hidden
              />
            </div>
            <div>
              <h2 className="font-semibold">{option.label}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {option.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
