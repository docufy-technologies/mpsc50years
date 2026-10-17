import {
  IconClock,
  IconLink,
  IconMicrophone,
  IconMusic,
  IconSpeakerphone,
} from "@tabler/icons-react";

import { FormInputGroup } from "@/components/form-input-group";
import { FormSection } from "@/components/form-section";
import { FormSelect } from "@/components/form-select";
import { FormTextarea } from "@/components/form-textarea";
import AnimatedButton from "@/components/ui/animated-button";
import { FieldGroup } from "@/components/ui/field";
import { InputGroupText } from "@/components/ui/input-group";
import {
  formatOptionLabel,
  OPENMIC_MAX_DURATION_MINUTES,
  PERFORMANCE_TYPES,
} from "../constants";
import { useOpenMicForm } from "../hooks/use-involve-forms";

const equipmentItems = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

export function OpenMicForm() {
  const form = useOpenMicForm();

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
        title="Performance"
        description="Sign up for the open mic segment of the celebration."
      >
        <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <form.Field name="performanceType">
            {(field) => (
              <FormSelect
                field={field}
                id="openmic-type"
                label="Performance Type"
                triggerPrefix={
                  <IconMicrophone className="size-3.5 text-muted-foreground" />
                }
                items={PERFORMANCE_TYPES.map((type) => ({
                  value: type,
                  label: formatOptionLabel(type),
                }))}
              />
            )}
          </form.Field>

          <form.Field name="durationMinutes">
            {(field) => (
              <FormInputGroup
                field={field}
                id="openmic-duration"
                label="Duration"
                inputMode="numeric"
                placeholder="5"
                startAddon={<IconClock className="size-3.5" />}
                endAddon={
                  <InputGroupText>
                    min (max {OPENMIC_MAX_DURATION_MINUTES})
                  </InputGroupText>
                }
              />
            )}
          </form.Field>

          <div className="sm:col-span-2">
            <form.Field name="titleOrDescription">
              {(field) => (
                <FormInputGroup
                  field={field}
                  id="openmic-title"
                  label="Title / Description"
                  placeholder="e.g. Acoustic cover of a classic"
                  startAddon={<IconMusic className="size-3.5" />}
                />
              )}
            </form.Field>
          </div>
        </FieldGroup>
      </FormSection>

      <FormSection
        title="Requirements"
        description="Let us know what you need to perform."
      >
        <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <form.Field name="needsEquipment">
            {(field) => (
              <FormSelect
                field={field}
                id="openmic-equipment"
                label="Need Equipment / Accompaniment?"
                triggerPrefix={
                  <IconSpeakerphone className="size-3.5 text-muted-foreground" />
                }
                items={equipmentItems}
              />
            )}
          </form.Field>

          <form.Field name="performanceLink">
            {(field) => (
              <FormInputGroup
                field={field}
                id="openmic-link"
                label="Performance Link"
                optional
                placeholder="https://…"
                startAddon={<IconLink className="size-3.5" />}
              />
            )}
          </form.Field>

          <div className="sm:col-span-2">
            <form.Field name="equipmentNotes">
              {(field) => (
                <FormTextarea
                  field={field}
                  id="openmic-equipment-notes"
                  label="Equipment Notes"
                  optional
                  placeholder="e.g. one microphone, a keyboard, backing track on USB"
                  rows={3}
                />
              )}
            </form.Field>
          </div>
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
              {isSubmitting ? "Submitting..." : "Submit Open Mic Entry"}
            </AnimatedButton>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
