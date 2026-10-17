import { fetchBackend } from "@/lib/api";
import type {
  OpenMicFormValues,
  SponsorFormValues,
  StallFormValues,
  SubcommitteeFormValues,
} from "../schema/involve-schema";

/**
 * Normalizes a FastAPI error body into a single human-readable string.
 * Mirrors the handling on the alumni registration action.
 */
function extractErrorDetail(res: Response, errorData: unknown): string {
  if (errorData && typeof errorData === "object" && "detail" in errorData) {
    const detail = (errorData as { detail: unknown }).detail;
    if (Array.isArray(detail)) {
      return detail
        .map((d: { msg?: string }) => d.msg || "Invalid input")
        .join(", ");
    }
    return String(detail);
  }
  return `Submission failed (${res.status})`;
}

/** POSTs a payload to an `/involve/*` endpoint and throws on failure. */
async function postInvolve(
  route: string,
  payload: Record<string, unknown>,
): Promise<Response> {
  const res = await fetchBackend(route, "POST", payload);

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    throw new Error(extractErrorDetail(res, errorData));
  }

  return res;
}

/* -------------------------------------------------------------------------- */
/*                              Stall application                             */
/* -------------------------------------------------------------------------- */

export function buildStallPayload(
  value: StallFormValues,
): Record<string, unknown> {
  return {
    stall_name: value.stallName.trim(),
    category: value.category,
    description: value.description.trim(),
    products: value.products
      .split("\n")
      .map((product) => product.trim())
      .filter(Boolean),
    space_needs: value.spaceNeeds.trim(),
    power_needs: value.powerNeeds.trim(),
    number_of_helpers: Number.parseInt(value.numberOfHelpers.trim(), 10),
    contact_phone: value.contactPhone.trim(),
    website_or_social_link: value.websiteOrSocialLink.trim() || null,
  };
}

export function submitStallApplication(value: StallFormValues) {
  return postInvolve("/involve/stall", buildStallPayload(value));
}

/* -------------------------------------------------------------------------- */
/*                                Sponsor offer                               */
/* -------------------------------------------------------------------------- */

export function buildSponsorPayload(
  value: SponsorFormValues,
): Record<string, unknown> {
  const isInKind = value.sponsorType === "in_kind";

  return {
    sponsor_type: value.sponsorType,
    sponsor_name: value.sponsorName.trim(),
    contact_person: value.contactPerson.trim(),
    phone: value.phone.trim(),
    email: value.email.trim().toLowerCase(),
    proposed_amount_bdt: isInKind
      ? null
      : Number.parseInt(value.proposedAmountBdt.trim(), 10),
    in_kind_description: isInKind ? value.inKindDescription.trim() : null,
    message: value.message.trim(),
  };
}

export function submitSponsorOffer(value: SponsorFormValues) {
  return postInvolve("/involve/sponsor", buildSponsorPayload(value));
}

/* -------------------------------------------------------------------------- */
/*                          Sub-committee application                         */
/* -------------------------------------------------------------------------- */

export function buildSubcommitteePayload(
  value: SubcommitteeFormValues,
): Record<string, unknown> {
  return {
    first_choice: value.firstChoice,
    second_choice: value.secondChoice.trim() || null,
    motivation: value.motivation.trim(),
    availability_notes: value.availabilityNotes.trim() || null,
  };
}

export function submitSubcommitteeApplication(value: SubcommitteeFormValues) {
  return postInvolve("/involve/subcommittee", buildSubcommitteePayload(value));
}

/* -------------------------------------------------------------------------- */
/*                                Open mic entry                              */
/* -------------------------------------------------------------------------- */

export function buildOpenMicPayload(
  value: OpenMicFormValues,
): Record<string, unknown> {
  return {
    performance_type: value.performanceType,
    title_or_description: value.titleOrDescription.trim(),
    duration_minutes: Number.parseInt(value.durationMinutes.trim(), 10),
    needs_equipment_or_accompaniment: value.needsEquipment === "yes",
    equipment_notes: value.equipmentNotes.trim() || null,
    performance_link: value.performanceLink.trim() || null,
  };
}

export function submitOpenMicEntry(value: OpenMicFormValues) {
  return postInvolve("/involve/openmic", buildOpenMicPayload(value));
}
