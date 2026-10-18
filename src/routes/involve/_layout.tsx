import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ProtectedRoute } from "@/features/auth/component/protected-route";

export const Route = createFileRoute("/involve")({
  component: InvolveLayout,
});

function InvolveLayout() {
  return (
    <ProtectedRoute>
      <section className="mx-auto mt-16 flex min-h-screen max-w-3xl flex-col items-center justify-center px-8 py-20">
        <Outlet />
      </section>
    </ProtectedRoute>
  );
}
