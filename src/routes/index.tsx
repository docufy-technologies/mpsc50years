import { createFileRoute } from "@tanstack/react-router";
import VaporCountdown from "@/components/countdown-vapor-digits";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-8 bg-background px-6 text-center">
      <p className="font-mono text-[11px] tracking-[0.3em] text-ns-muted">
        LAUNCH WINDOW CLOSES IN
      </p>
      <VaporCountdown targetDate={new Date("2026-12-27T00:00:00")} />
    </div>
  );
}
