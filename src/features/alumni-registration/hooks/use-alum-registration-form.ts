import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { registerAlum } from "../action/register-alum";
import {
  registerFormDefaultValues,
  validatedRegisterSchema,
} from "../schema/form-schema";

export function useAlumRegistrationForm() {
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: registerFormDefaultValues,
    validators: {
      onChange: validatedRegisterSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await registerAlum(value);
        toast.success(
          "Registration successful! Welcome to the Golden Jubilee.",
        );
        formApi.reset();
        navigate({ to: "/profile" });
      } catch (err) {
        toast.error(
          err instanceof Error
            ? err.message
            : "An unexpected network error occurred",
        );
      }
    },
  });

  return form;
}
