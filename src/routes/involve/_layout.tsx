import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/involve")({
  component: InvolveLayout,
});

function InvolveLayout() {
  return (
    <section className="min-h-screen py-20 mt-16 flex flex-col items-center justify-center max-w-3xl px-8 mx-auto">
      <Outlet />
    </section>
  );
}
