import { IconLock, IconMail } from "@tabler/icons-react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { FormEvent } from "react";
import AnimatedButton from "@/components/ui/animated-button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";

const groupClass = "h-9 rounded-md";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle authentication logic here
  };

  return (
    <section className="min-h-screen pb-20 pt-36 sm:pt-40 max-w-md px-4 mx-auto flex flex-col justify-center">
      <div className="space-y-6">
        <div className="space-y-2 text-center">
          <h1>
            Welcome <span className="text-accent">Back</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Sign in to manage your registration and event details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium leading-none">
              Email Address
            </label>
            <InputGroup className={groupClass}>
              <InputGroupAddon>
                <IconMail className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
              />
            </InputGroup>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none"
              >
                Password
              </label>
              <Link
                to="/faq"
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <InputGroup className={groupClass}>
              <InputGroupAddon>
                <IconLock className="size-4 text-muted-foreground" />
              </InputGroupAddon>
              <InputGroupInput
                id="password"
                name="password"
                type="password"
                required
                placeholder="••••••••"
              />
            </InputGroup>
          </div>

          <div className="pt-2 flex flex-col items-center gap-4">
            <AnimatedButton type="submit" className="w-full justify-center">
              Sign In
            </AnimatedButton>

            <p className="text-sm text-muted-foreground text-center">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-accent underline-offset-4 hover:underline"
              >
                Register as an Alumna
              </Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}