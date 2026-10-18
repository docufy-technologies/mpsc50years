import { IconCircleX } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import AnimatedButton from "@/components/ui/animated-button";

export const Route = createFileRoute("/payment/cancelled")({
  component: PaymentCancelledRouteComponent,
});

function PaymentCancelledRouteComponent() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-8 py-36">
      <section className="w-full rounded-2xl border bg-card p-8 text-center shadow-sm">
        <IconCircleX className="mx-auto mb-4 size-12 text-destructive" />
        <h1 className="text-2xl font-bold">Payment not completed</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The payment could not be completed or verified. You can try again
          from your profile.
        </p>
        <Link to="/profile" className="mt-8 block">
          <AnimatedButton className="w-full">Return to profile</AnimatedButton>
        </Link>
      </section>
    </main>
  );
}
