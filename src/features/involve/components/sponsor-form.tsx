import {
  IconBuilding,
  IconCurrencyTaka,
  IconHeartHandshake,
  IconMail,
  IconPhone,
  IconUser,
} from "@tabler/icons-react";

import { FormInputGroup } from "@/components/form-input-group";
import { FormSection } from "@/components/form-section";
import { FormSelect } from "@/components/form-select";
import { FormTextarea } from "@/components/form-textarea";
import AnimatedButton from "@/components/ui/animated-button";
import { FieldGroup } from "@/components/ui/field";
import { InputGroupText } from "@/components/ui/input-group";
import { formatOptionLabel, SPONSOR_TYPES } from "../constants";
import { useSponsorForm } from "../hooks/use-involve-forms";

export function SponsorForm() {
  const form = useSponsorForm();

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
        title="Sponsor Details"
        description="Support the Golden Jubilee as an individual, a company, or with an in-kind contribution."
      >
        <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <form.Field name="sponsorType">
            {(field) => (
              <FormSelect
                field={field}
                id="sponsor-type"
                label="Sponsorship Type"
                triggerPrefix={
                  <IconHeartHandshake className="size-3.5 text-muted-foreground" />
                }
                items={SPONSOR_TYPES.map((type) => ({
                  value: type,
                  label: formatOptionLabel(type),
                }))}
              />
            )}
          </form.Field>

          <form.Field name="sponsorName">
            {(field) => (
              <FormInputGroup
                field={field}
                id="sponsor-name"
                label="Sponsor / Company Name"
                placeholder="Name to be credited"
                startAddon={<IconBuilding className="size-3.5" />}
              />
            )}
          </form.Field>

          <form.Field name="contactPerson">
            {(field) => (
              <FormInputGroup
                field={field}
                id="sponsor-contact"
                label="Contact Person"
                placeholder="Who should we reach out to?"
                startAddon={<IconUser className="size-3.5" />}
              />
            )}
          </form.Field>
        </FieldGroup>
      </FormSection>

      <FormSection title="Contact">
        <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <form.Field name="phone">
            {(field) => (
              <FormInputGroup
                field={field}
                id="sponsor-phone"
                label="Phone"
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

          <form.Field name="email">
            {(field) => (
              <FormInputGroup
                field={field}
                id="sponsor-email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                startAddon={<IconMail className="size-3.5" />}
              />
            )}
          </form.Field>
        </FieldGroup>
      </FormSection>

      <FormSection
        title="Your Offer"
        description="Cash sponsors propose an amount; in-kind sponsors describe what they will contribute."
      >
        <FieldGroup className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <form.Subscribe selector={(state) => state.values.sponsorType}>
            {(sponsorType) =>
              sponsorType === "in_kind" ? (
                <div className="sm:col-span-2">
                  <form.Field name="inKindDescription">
                    {(field) => (
                      <FormTextarea
                        field={field}
                        id="sponsor-in-kind"
                        label="In-kind Contribution"
                        placeholder="e.g. 200 event t-shirts, catering for the cultural night…"
                        rows={3}
                      />
                    )}
                  </form.Field>
                </div>
              ) : (
                <form.Field name="proposedAmountBdt">
                  {(field) => (
                    <FormInputGroup
                      field={field}
                      id="sponsor-amount"
                      label="Proposed Amount"
                      inputMode="numeric"
                      placeholder="50000"
                      startAddon={<IconCurrencyTaka className="size-3.5" />}
                      endAddon={<InputGroupText>BDT</InputGroupText>}
                    />
                  )}
                </form.Field>
              )
            }
          </form.Subscribe>

          <div className="sm:col-span-2">
            <form.Field name="message">
              {(field) => (
                <FormTextarea
                  field={field}
                  id="sponsor-message"
                  label="Message"
                  placeholder="Anything you would like the committee to know."
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
              {isSubmitting ? "Submitting..." : "Submit Sponsorship Offer"}
            </AnimatedButton>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}
