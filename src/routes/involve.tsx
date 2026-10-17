import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/involve")({
  component: InvolveLayout,
});

function InvolveLayout() {
  return (
    <section className="min-h-screen pb-20 pt-32 max-w-3xl px-8 mx-auto">
      <Outlet />
    </section>
  );
}
