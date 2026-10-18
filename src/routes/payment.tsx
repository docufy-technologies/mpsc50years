import { IconCreditCard } from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import * as v from "valibot";
import AnimatedButton from "@/components/ui/animated-button";
import { ProtectedRoute } from "@/features/auth/component/protected-route";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { fetchBackend } from "@/lib/api";

const paymentSessionSchema = v.object({
  transaction_reference: v.string(),
  gateway_url: v.pipe(v.string(), v.url()),
  session_key: v.string(),
});

export const Route = createFileRoute("/payment")({
  component: PaymentRouteComponent,
});

function PaymentRouteComponent() {
  const { user } = useAuth();
  const [isStarting, setIsStarting] = useState(false);

  async function startPayment() {
    setIsStarting(true);
    try {
      const response = await fetchBackend("/payments/initiate", "POST");
      const body: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(getPaymentError(response.status, body));
      }

      const result = v.safeParse(paymentSessionSchema, body);
      if (!result.success) {
        throw new Error("The backend returned an invalid payment session.");
      }

      window.location.assign(result.output.gateway_url);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to start the payment session.",
      );
      setIsStarting(false);
    }
  }

  useEffect(() => {
    if (user?.status === "pending" && !user.payment.has_paid) {
      void startPayment();
    }
  }, [user]);

  return (
    <ProtectedRoute>
      <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-8 py-36">
        <section className="w-full p-8 text-center">
          <IconCreditCard className="mx-auto mb-4 size-10 text-primary" />
          <h1 className="text-2xl font-bold">Complete your payment</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            You will be redirected to SSLCommerz to securely complete the
            verification payment.
          </p>
          <AnimatedButton
            className="mt-8 w-full"
            onClick={() => void startPayment()}
            disabled={isStarting || user?.payment.has_paid}
          >
            {user?.payment.has_paid
              ? "Payment already completed"
              : isStarting
                ? "Opening secure checkout..."
                : "Continue to payment"}
          </AnimatedButton>
        </section>
      </main>
    </ProtectedRoute>
  );
}

function getPaymentError(status: number, body: unknown): string {
  if (body && typeof body === "object" && "detail" in body) {
    const detail = body.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((item) =>
          item && typeof item === "object" && "msg" in item
            ? String(item.msg)
            : "Invalid payment request",
        )
        .join(", ");
    }
  }

  return `Unable to start payment (request failed with status ${status}).`;
}
