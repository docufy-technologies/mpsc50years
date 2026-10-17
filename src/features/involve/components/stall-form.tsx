import {
  IconBuildingStore,
  IconLink,
  IconPhone,
  IconTag,
  IconUsers,
} from "@tabler/icons-react";

import { FormInputGroup } from "@/components/form-input-group";
import { FormSection } from "@/components/form-section";
import { FormSelect } from "@/components/form-select";
import { FormTextarea } from "@/components/form-textarea";
import AnimatedButton from "@/components/ui/animated-button";
import { FieldGroup } from "@/components/ui/field";
import { InputGroupText } from "@/components/ui/input-group";
import { formatOptionLabel, STALL_CATEGORIES } from "../constants";
import { useStallForm } from "../hooks/use-involve-forms";

export function StallForm() {
  const form = useStallForm();

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
        title="Stall Details"
        description="Tell us about the stall you would like to run at the get-together."
      >
        <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <form.Field name="stallName">
            {(field) => (
              <FormInputGroup
                field={field}
                id="stall-name"
                label="Stall Name"
                placeholder="e.g. Mom's Kitchen"
                startAddon={<IconBuildingStore className="size-3.5" />}
              />
            )}
          </form.Field>

          <form.Field name="category">
            {(field) => (
              <FormSelect
                field={field}
                id="stall-category"
                label="Category"
                triggerPrefix={
                  <IconTag className="size-3.5 text-muted-foreground" />
                }
                items={STALL_CATEGORIES.map((category) => ({
                  value: category,
                  label: formatOptionLabel(category),
                }))}
              />
            )}
          </form.Field>

          <div className="sm:col-span-2">
            <form.Field name="description">
              {(field) => (
                <FormTextarea
                  field={field}
                  id="stall-description"
                  label="Description"
                  placeholder="What will you sell or showcase?"
                  rows={4}
                />
              )}
            </form.Field>
          </div>

          <div className="sm:col-span-2">
            <form.Field name="products">
              {(field) => (
                <FormTextarea
                  field={field}
                  id="stall-products"
                  label="Products"
                  description="List one product per line."
                  placeholder={"Handmade candles\nScented soaps"}
                  rows={3}
                />
              )}
            </form.Field>
          </div>
        </FieldGroup>
      </FormSection>

      <FormSection
        title="Logistics"
        description="Help us plan the space and utilities you need."
      >
        <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <form.Field name="spaceNeeds">
            {(field) => (
              <FormTextarea
                field={field}
                id="stall-space"
                label="Space Needs"
                placeholder="e.g. 2 tables, 10 x 10 ft area"
                rows={2}
              />
            )}
          </form.Field>

          <form.Field name="powerNeeds">
            {(field) => (
              <FormTextarea
                field={field}
                id="stall-power"
                label="Power Needs"
                placeholder="e.g. one 220V outlet"
                rows={2}
              />
            )}
          </form.Field>

          <form.Field name="numberOfHelpers">
            {(field) => (
              <FormInputGroup
                field={field}
                id="stall-helpers"
                label="Number of Helpers"
                inputMode="numeric"
                placeholder="0"
                startAddon={<IconUsers className="size-3.5" />}
              />
            )}
          </form.Field>
        </FieldGroup>
      </FormSection>

      <FormSection title="Contact">
        <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <form.Field name="contactPhone">
            {(field) => (
              <FormInputGroup
                field={field}
                id="stall-phone"
                label="Contact Phone"
                type="tel"
                placeholder="1XXX-XXXXXX"
                startAddon={
                  <InputGroupText>
                    <IconPhone className="size-3.5" />
                    +880
                  </InputGroupText>
                }
              />
            )}
          </form.Field>

          <form.Field name="websiteOrSocialLink">
            {(field) => (
              <FormInputGroup
                field={field}
                id="stall-link"
                label="Website / Social Link"
                optional
                placeholder="https://…"
                startAddon={<IconLink className="size-3.5" />}
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
              {isSubmitting ? "Submitting..." : "Apply for a Stall"}
            </AnimatedButton>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
