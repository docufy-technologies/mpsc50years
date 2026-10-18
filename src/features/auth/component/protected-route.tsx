import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { type ReactNode, useEffect } from "react";
import AnimatedButton from "@/components/ui/animated-button";
import { useAuth } from "../hooks/use-auth";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { error, isLoading, retry, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !error && !user && location.pathname !== "/login") {
      void navigate({
        to: "/login",
        search: { redirect: location.href },
        replace: true,
      });
    }
  }, [error, isLoading, location.href, location.pathname, navigate, user]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        Checking your session...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col gap-4 px-8 text-center max-w-sm mx-auto justify-center items-center">
        <h5>Couldn&apos;t verify your identity. Try again.</h5>
        <div className="grid grid-cols-1 gap-2 w-full">
          <AnimatedButton size="sm" className="w-full" onClick={retry}>
            Try again
          </AnimatedButton>
          <Link to="/login">
            <AnimatedButton size="sm" className="w-full" variant="outline">
              Go to login
            </AnimatedButton>
          </Link>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return children;
}
