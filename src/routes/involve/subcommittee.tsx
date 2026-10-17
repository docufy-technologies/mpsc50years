import { IconArrowLeft } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { SubcommitteeForm } from "@/features/involve/components/subcommittee-form";

export const Route = createFileRoute("/involve/subcommittee")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="w-full">
      <Link
        to="/involve"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <IconArrowLeft className="size-4" aria-hidden />
        All options
      </Link>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Join a Sub-committee
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Volunteer your time and skills across event committees.
        </p>
      </div>

      <SubcommitteeForm />
    </div>
  );
}
