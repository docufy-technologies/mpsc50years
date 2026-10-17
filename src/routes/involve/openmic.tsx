import { IconArrowLeft } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";

import { OpenMicForm } from "@/features/involve/components/openmic-form";

export const Route = createFileRoute("/involve/openmic")({
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
        <h1 className="text-3xl font-bold tracking-tight">Open Mic</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Take the stage — sing, recite, perform, and entertain the crowd.
        </p>
      </div>

      <OpenMicForm />
    </div>
  );
}
