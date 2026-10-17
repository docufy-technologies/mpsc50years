import { IconTarget, IconTargetArrow } from "@tabler/icons-react";

import { FormSection } from "@/components/form-section";
import { FormSelect } from "@/components/form-select";
import { FormTextarea } from "@/components/form-textarea";
import AnimatedButton from "@/components/ui/animated-button";
import { FieldGroup } from "@/components/ui/field";
import { SUBCOMMITTEE_NAMES } from "../constants";
import { useSubcommitteeForm } from "../hooks/use-involve-forms";

const subcommitteeItems = SUBCOMMITTEE_NAMES.map((name) => ({
  value: name,
  label: name,
}));

export function SubcommitteeForm() {
  const form = useSubcommitteeForm();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-6"
    >
      <FormSection
        title="Preferences"
        description="Pick the sub-committees you would like to contribute to."
      >
        <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <form.Field name="firstChoice">
            {(field) => (
              <FormSelect
                field={field}
                id="subcommittee-first"
                label="First Choice"
                triggerPrefix={
                  <IconTarget className="size-3.5 text-muted-foreground" />
                }
                items={subcommitteeItems}
              />
            )}
          </form.Field>

          <form.Field name="secondChoice">
            {(field) => (
              <FormSelect
                field={field}
                id="subcommittee-second"
                label="Second Choice"
                optional
                triggerPrefix={
                  <IconTargetArrow className="size-3.5 text-muted-foreground" />
                }
                items={subcommitteeItems}
              />
            )}
          </form.Field>
        </FieldGroup>
      </FormSection>

      <FormSection
        title="Motivation"
        description="Tell us why you want to join and when you are available."
      >
        <FieldGroup className="grid grid-cols-1 gap-3">
          <form.Field name="motivation">
            {(field) => (
              <FormTextarea
                field={field}
                id="subcommittee-motivation"
                label="Motivation"
                description="At least 20 characters."
                placeholder="Share what drives you to be part of the team…"
                rows={5}
              />
            )}
          </form.Field>

          <form.Field name="availabilityNotes">
            {(field) => (
              <FormTextarea
                field={field}
                id="subcommittee-availability"
                label="Availability Notes"
                optional
                placeholder="e.g. weekday evenings, on-site from 3 PM"
                rows={2}
              />
            )}
          </form.Field>
        </FieldGroup>
      </FormSection>

      <div className="flex justify-center pt-4">
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
              className="w-full sm:w-auto px-8"
            >
              {isSubmitting ? "Submitting..." : "Apply for Sub-committee"}
            </AnimatedButton>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
