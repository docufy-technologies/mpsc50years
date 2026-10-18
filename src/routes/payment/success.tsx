import { IconCircleCheck } from "@tabler/icons-react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import AnimatedButton from "@/components/ui/animated-button";
import { useAuth } from "@/features/auth/hooks/use-auth";

export const Route = createFileRoute("/payment/success")({
  component: PaymentSuccessRouteComponent,
});

function PaymentSuccessRouteComponent() {
  const { retry } = useAuth();

  useEffect(() => {
    retry();
  }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-8 py-36">
      <section className="w-full rounded-2xl border bg-card p-8 text-center shadow-sm">
        <IconCircleCheck className="mx-auto mb-4 size-12 text-green-600" />
        <h1 className="text-2xl font-bold">Payment successful</h1>
        <p className="mt-3 text-sm text-muted-foreground">
        Your payment was verified successfully and your account is now
        confirmed.
        </p>
        <Link to="/profile" className="mt-8 block">
          <AnimatedButton className="w-full">View your profile</AnimatedButton>
        </Link>
      </section>
    </main>
  );
}
