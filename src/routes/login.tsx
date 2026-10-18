import { IconArrowRight, IconMail } from "@tabler/icons-react";
import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import * as v from "valibot";
import { FormInputGroup } from "@/components/form-input-group";
import { FormPasswordInput } from "@/components/form-password-input";
import AnimatedButton from "@/components/ui/animated-button";
import { FieldGroup } from "@/components/ui/field";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { loginSchema } from "@/features/auth/schema/auth-schema";

const loginSearchSchema = v.object({
  redirect: v.optional(
    v.pipe(
      v.string(),
      v.startsWith("/", "Redirect must be an internal path"),
      v.check(
        (value) => !value.startsWith("//"),
        "Redirect must be an internal path",
      ),
    ),
  ),
});

export const Route = createFileRoute("/login")({
  component: LoginRouteComponent,
  validateSearch: loginSearchSchema,
});

function LoginRouteComponent() {
  const router = useRouter();
  const { redirect } = Route.useSearch();
  const auth = useAuth();
  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: { onChange: loginSchema },
    onSubmit: async ({ value }) => {
      try {
        await auth.login(value);
        toast.success("Welcome back.");
        router.history.push(redirect ?? "/profile");
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Unable to sign in.",
        );
      }
    },
  });

  return (
    <section className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-8">
      <div className="w-full">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Sign In</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Access your account for MPSC 50 Years Golden Jubilee
          </p>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            form.handleSubmit();
          }}
          className="flex w-full flex-col items-center justify-center space-y-6"
        >
          <FieldGroup className="flex w-full flex-col gap-3">
            <form.Field name="email">
              {(field) => (
                <FormInputGroup
                  field={field}
                  id="email"
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  startAddon={<IconMail className="size-3.5" />}
                />
              )}
            </form.Field>
            <form.Field name="password">
              {(field) => (
                <FormPasswordInput
                  field={field}
                  id="password"
                  label="Password"
                  placeholder="Your password"
                />
              )}
            </form.Field>
          </FieldGroup>
          <div className="flex w-full flex-col items-center gap-4 pt-4">
            <form.Subscribe
              selector={(state) => ({
                canSubmit: state.canSubmit,
                isSubmitting: state.isSubmitting,
              })}
            >
              {({ canSubmit, isSubmitting }) => (
                <AnimatedButton
                  type="submit"
                  disabled={!canSubmit}
                  className="w-full px-8"
                >
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </AnimatedButton>
              )}
            </form.Subscribe>
            <p className="text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Link
                to="/register"
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                Create new account <IconArrowRight className="size-3.5" />
              </Link>
            </p>
          </div>
        </form>
      </div>
    </section>
  );
}
