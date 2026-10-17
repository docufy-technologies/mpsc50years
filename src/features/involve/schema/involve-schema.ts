import * as v from "valibot";

import {
  OPENMIC_MAX_DURATION_MINUTES,
  PERFORMANCE_TYPES,
  SPONSOR_TYPES,
  STALL_CATEGORIES,
  SUBCOMMITTEE_NAMES,
} from "../constants";

/** Accepts only absolute http(s) URLs; empty string is treated as "not provided". */
function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

const optionalHttpUrl = v.pipe(
  v.string(),
  v.trim(),
  v.check((val) => val === "" || isHttpUrl(val), "Enter a valid http(s) link"),
);

const optionalText = (maxLength: number, label: string) =>
  v.pipe(
    v.string(),
    v.trim(),
    v.maxLength(maxLength, `${label} must be ${maxLength} characters or fewer`),
  );

/* -------------------------------------------------------------------------- */
/*                              Stall application                             */
/* -------------------------------------------------------------------------- */

export const stallSchema = v.object({
  stallName: v.pipe(
    v.string("Stall name is required"),
    v.trim(),
    v.minLength(1, "Stall name is required"),
    v.maxLength(200, "Stall name must be 200 characters or fewer"),
  ),
  category: v.picklist(STALL_CATEGORIES, "Please select a category"),
  description: v.pipe(
    v.string("Description is required"),
    v.trim(),
    v.minLength(1, "Description is required"),
    v.maxLength(3000, "Description must be 3000 characters or fewer"),
  ),
  products: v.pipe(
    v.string("List at least one product"),
    v.check(
      (val) => val.split("\n").some((line) => line.trim().length > 0),
      "List at least one product",
    ),
  ),
  spaceNeeds: v.pipe(
    v.string("Space needs are required"),
    v.trim(),
    v.minLength(1, "Space needs are required"),
    v.maxLength(1000, "Space needs must be 1000 characters or fewer"),
  ),
  powerNeeds: v.pipe(
    v.string("Power needs are required"),
    v.trim(),
    v.minLength(1, "Power needs are required"),
    v.maxLength(1000, "Power needs must be 1000 characters or fewer"),
  ),
  numberOfHelpers: v.pipe(
    v.string("Number of helpers is required"),
    v.trim(),
    v.regex(/^\d+$/, "Enter a whole number"),
    v.check((val) => Number(val) <= 100, "Must be 100 or fewer"),
  ),
  contactPhone: v.pipe(
    v.string("Contact phone is required"),
    v.trim(),
    v.minLength(5, "Phone must be at least 5 characters"),
    v.maxLength(16, "Phone must be 16 characters or fewer"),
  ),
  websiteOrSocialLink: optionalHttpUrl,
});

export type StallFormValues = v.InferOutput<typeof stallSchema>;

/* -------------------------------------------------------------------------- */
/*                                Sponsor offer                               */
/* -------------------------------------------------------------------------- */

export const sponsorSchema = v.pipe(
  v.object({
    sponsorType: v.picklist(SPONSOR_TYPES, "Please select a sponsorship type"),
    sponsorName: v.pipe(
      v.string("Name is required"),
      v.trim(),
      v.minLength(1, "Name is required"),
      v.maxLength(200, "Name must be 200 characters or fewer"),
    ),
    contactPerson: v.pipe(
      v.string("Contact person is required"),
      v.trim(),
      v.minLength(1, "Contact person is required"),
      v.maxLength(200, "Contact person must be 200 characters or fewer"),
    ),
    phone: v.pipe(
      v.string("Phone is required"),
      v.trim(),
      v.minLength(5, "Phone must be at least 5 characters"),
      v.maxLength(16, "Phone must be 16 characters or fewer"),
    ),
    email: v.pipe(
      v.string("Email is required"),
      v.trim(),
      v.email("Enter a valid email address"),
    ),
    proposedAmountBdt: v.pipe(
      v.string(),
      v.trim(),
      v.check((val) => val === "" || /^\d+$/.test(val), "Enter a whole number"),
      v.check(
        (val) => val === "" || Number(val) > 0,
        "Amount must be greater than 0",
      ),
    ),
    inKindDescription: optionalText(2000, "Description"),
    message: v.pipe(
      v.string("Message is required"),
      v.trim(),
      v.minLength(1, "Message is required"),
      v.maxLength(2000, "Message must be 2000 characters or fewer"),
    ),
  }),
  v.forward(
    v.check(
      (input) =>
        input.sponsorType === "in_kind" || input.proposedAmountBdt !== "",
      "Proposed amount is required for cash sponsorship",
    ),
    ["proposedAmountBdt"],
  ),
  v.forward(
    v.check(
      (input) =>
        input.sponsorType !== "in_kind" || input.inKindDescription !== "",
      "A description is required for in-kind sponsorship",
    ),
    ["inKindDescription"],
  ),
);

export type SponsorFormValues = v.InferOutput<typeof sponsorSchema>;

/* -------------------------------------------------------------------------- */
/*                          Sub-committee application                         */
/* -------------------------------------------------------------------------- */

export const subcommitteeSchema = v.pipe(
  v.object({
    firstChoice: v.picklist(SUBCOMMITTEE_NAMES, "Please select a first choice"),
    secondChoice: v.pipe(
      v.string(),
      v.check(
        (val) =>
          val === "" || (SUBCOMMITTEE_NAMES as readonly string[]).includes(val),
        "Please select a valid second choice",
      ),
    ),
    motivation: v.pipe(
      v.string("Motivation is required"),
      v.trim(),
      v.minLength(20, "Motivation must be at least 20 characters"),
      v.maxLength(1000, "Motivation must be 1000 characters or fewer"),
    ),
    availabilityNotes: optionalText(500, "Notes"),
  }),
  v.forward(
    v.check(
      (input) =>
        input.secondChoice === "" || input.secondChoice !== input.firstChoice,
      "Second choice must be different from the first",
    ),
    ["secondChoice"],
  ),
);

export type SubcommitteeFormValues = v.InferOutput<typeof subcommitteeSchema>;

/* -------------------------------------------------------------------------- */
/*                                Open mic entry                              */
/* -------------------------------------------------------------------------- */

export const openMicSchema = v.object({
  performanceType: v.picklist(
    PERFORMANCE_TYPES,
    "Please select a performance type",
  ),
  titleOrDescription: v.pipe(
    v.string("Title or description is required"),
    v.trim(),
    v.minLength(1, "Title or description is required"),
    v.maxLength(1000, "Must be 1000 characters or fewer"),
  ),
  durationMinutes: v.pipe(
    v.string("Duration is required"),
    v.trim(),
    v.regex(/^\d+$/, "Enter a whole number"),
    v.check((val) => Number(val) >= 1, "Duration must be at least 1 minute"),
    v.check(
      (val) => Number(val) <= OPENMIC_MAX_DURATION_MINUTES,
      `Duration must be ${OPENMIC_MAX_DURATION_MINUTES} minutes or fewer`,
    ),
  ),
  needsEquipment: v.picklist(["yes", "no"] as const, "Please choose an option"),
  equipmentNotes: optionalText(1000, "Notes"),
  performanceLink: optionalHttpUrl,
});

export type OpenMicFormValues = v.InferOutput<typeof openMicSchema>;
