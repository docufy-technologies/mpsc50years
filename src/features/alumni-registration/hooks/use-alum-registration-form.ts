import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { getCurrentUser } from "@/features/auth/actions";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { registerAlum } from "../action/register-alum";
import {
  type RegisterFormValues,
  validatedRegisterSchema,
} from "../schema/form-schema";

export function useAlumRegistrationForm() {
  const navigate = useNavigate();
  const auth = useAuth();
  const defaultValues: RegisterFormValues = {
    fullName: "",
    email: "",
    phone: "",
    password: "",
    // biome-ignore lint/style/noNonNullAssertion: <I promise this won't affect>
    gender: null!,
    batchYear: "",
    teeShirtSize: "L",
    academicGroup: "science",
    studentId: "",
    referrerRegCode: "",
    organization: "",
    department: "",
    designation: "",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: "Bangladesh",
  };

  const form = useForm({
    defaultValues,
    validators: {
      onChange: validatedRegisterSchema,
    },
    onSubmit: async ({ value, formApi }) => {
      try {
        await registerAlum(value);
        auth.setUser(await getCurrentUser());
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
