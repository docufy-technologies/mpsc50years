import { useForm } from "@tanstack/react-form";
import { toast } from "sonner";

import {
  submitOpenMicEntry,
  submitSponsorOffer,
  submitStallApplication,
  submitSubcommitteeApplication,
} from "../action/involve-actions";
import {
  type OpenMicFormValues,
  openMicSchema,
  type SponsorFormValues,
  type StallFormValues,
  type SubcommitteeFormValues,
  sponsorSchema,
  stallSchema,
  subcommitteeSchema,
} from "../schema/involve-schema";

/**
 * Placeholder for a required select before the user picks a value. Typed as
 * `never` so it satisfies any picklist union; the select renders its
 * placeholder until a real value arrives.
 */
// biome-ignore lint/style/noNonNullAssertion: placeholder for an unselected required select
const unselected = null!;

function reportError(err: unknown) {
  toast.error(
    err instanceof Error ? err.message : "An unexpected network error occurred",
  );
}

export function useStallForm() {
  const defaultValues: StallFormValues = {
    stallName: "",
    category: unselected,
    description: "",
    products: "",
    spaceNeeds: "",
    powerNeeds: "",
    numberOfHelpers: "",
    contactPhone: "",
    websiteOrSocialLink: "",
  };

  return useForm({
    defaultValues,
    validators: { onChange: stallSchema },
    onSubmit: async ({ value, formApi }) => {
      try {
        await submitStallApplication(value);
        toast.success("Stall application submitted! We'll review it shortly.");
        formApi.reset();
      } catch (err) {
        reportError(err);
      }
    },
  });
}

export function useSponsorForm() {
  const defaultValues: SponsorFormValues = {
    sponsorType: unselected,
    sponsorName: "",
    contactPerson: "",
    phone: "",
    email: "",
    proposedAmountBdt: "",
    inKindDescription: "",
    message: "",
  };

  return useForm({
    defaultValues,
    validators: { onChange: sponsorSchema },
    onSubmit: async ({ value, formApi }) => {
      try {
        await submitSponsorOffer(value);
        toast.success(
          "Sponsorship offer submitted! Thank you for your support.",
        );
        formApi.reset();
      } catch (err) {
        reportError(err);
      }
    },
  });
}

export function useSubcommitteeForm() {
  const defaultValues: SubcommitteeFormValues = {
    firstChoice: unselected,
    secondChoice: "",
    motivation: "",
    availabilityNotes: "",
  };

  return useForm({
    defaultValues,
    validators: { onChange: subcommitteeSchema },
    onSubmit: async ({ value, formApi }) => {
      try {
        await submitSubcommitteeApplication(value);
        toast.success("Application submitted! We'll be in touch soon.");
        formApi.reset();
      } catch (err) {
        reportError(err);
      }
    },
  });
}

export function useOpenMicForm() {
  const defaultValues: OpenMicFormValues = {
    performanceType: unselected,
    titleOrDescription: "",
    durationMinutes: "",
    needsEquipment: unselected,
    equipmentNotes: "",
    performanceLink: "",
  };

  return useForm({
    defaultValues,
    validators: { onChange: openMicSchema },
    onSubmit: async ({ value, formApi }) => {
      try {
        await submitOpenMicEntry(value);
        toast.success(
          "Open mic entry submitted! We'll confirm your slot soon.",
        );
        formApi.reset();
      } catch (err) {
        reportError(err);
      }
    },
  });
}
