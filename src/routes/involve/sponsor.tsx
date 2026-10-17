import { IconArrowLeft } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { SponsorForm } from "@/features/involve/components/sponsor-form";

export const Route = createFileRoute("/involve/sponsor")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <Link
        to="/involve"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <IconArrowLeft className="size-4" aria-hidden />
        All options
      </Link>

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Sponsor</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Support the Golden Jubilee as an individual, a company, or with an
          in-kind contribution.
        </p>
      </div>

      <SponsorForm />
    </div>
  );
}
