import { queryOptions } from "@tanstack/react-query";
import * as v from "valibot";
import { fetchBackend } from "@/lib/api";

const status = v.string();
const date = v.string();

const stallSchema = v.object({
  uuid: v.string(),
  stall_name: v.string(),
  category: v.string(),
  description: v.string(),
  products: v.array(v.string()),
  space_needs: v.string(),
  power_needs: v.string(),
  number_of_helpers: v.number(),
  contact_phone: v.string(),
  website_or_social_link: v.nullable(v.string()),
  status,
  stall_fee_status: v.string(),
  admin_note: v.nullable(v.string()),
  created_at: date,
  updated_at: date,
});

const sponsorSchema = v.object({
  uuid: v.string(),
  sponsor_type: v.string(),
  sponsor_name: v.string(),
  contact_person: v.string(),
  phone: v.string(),
  email: v.string(),
  proposed_amount_bdt: v.nullable(v.number()),
  in_kind_description: v.nullable(v.string()),
  message: v.string(),
  status,
  admin_note: v.nullable(v.string()),
  created_at: date,
});

const subcommitteeSchema = v.object({
  uuid: v.string(),
  first_choice: v.string(),
  second_choice: v.nullable(v.string()),
  motivation: v.string(),
  availability_notes: v.nullable(v.string()),
  status,
  admin_note: v.nullable(v.string()),
  created_at: date,
  updated_at: date,
});

const openMicSchema = v.object({
  uuid: v.string(),
  performance_type: v.string(),
  title_or_description: v.string(),
  duration_minutes: v.number(),
  needs_equipment_or_accompaniment: v.boolean(),
  equipment_notes: v.nullable(v.string()),
  performance_link: v.nullable(v.string()),
  status,
  admin_note: v.nullable(v.string()),
  scheduled_slot: v.nullable(v.string()),
  created_at: date,
});

const referralsSchema = v.object({
  referral_code: v.string(),
  referral_count: v.number(),
  referrals: v.array(
    v.object({
      uuid: v.string(),
      full_name: v.string(),
      status,
    }),
  ),
});

export type StallApplication = v.InferOutput<typeof stallSchema>;
export type SponsorOffer = v.InferOutput<typeof sponsorSchema>;
export type SubcommitteeApplication = v.InferOutput<
  typeof subcommitteeSchema
>;
export type OpenMicEntry = v.InferOutput<typeof openMicSchema>;
export type Referrals = v.InferOutput<typeof referralsSchema>;

async function read<T>(
  route: string,
  schema: v.BaseSchema<unknown, T, v.BaseIssue<unknown>>,
  emptyValue: T,
): Promise<T> {
  const response = await fetchBackend(route);
  if (response.status === 404) return emptyValue;

  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(`Unable to load involvement information (${response.status}).`);
  }

  const result = v.safeParse(schema, body);
  if (!result.success) {
    throw new Error("The backend returned invalid involvement information.");
  }
  return result.output;
}

export const stallApplicationQueryOptions = (userUuid: string) =>
  queryOptions({
    queryKey: ["involvement", userUuid, "stall"],
    queryFn: () => read("/involve/stall/me", stallSchema, null),
  });

export const sponsorOffersQueryOptions = (userUuid: string) =>
  queryOptions({
    queryKey: ["involvement", userUuid, "sponsors"],
    queryFn: () => read("/involve/sponsor/me", v.array(sponsorSchema), []),
    initialData: [],
  });

export const subcommitteeApplicationQueryOptions = (userUuid: string) =>
  queryOptions({
    queryKey: ["involvement", userUuid, "subcommittee"],
    queryFn: () => read("/involve/subcommittee/me", subcommitteeSchema, null),
  });

export const openMicEntriesQueryOptions = (userUuid: string) =>
  queryOptions({
    queryKey: ["involvement", userUuid, "openmic"],
    queryFn: () => read("/involve/openmic/me", v.array(openMicSchema), []),
    initialData: [],
  });

export const referralsQueryOptions = (userUuid: string) =>
  queryOptions({
    queryKey: ["involvement", userUuid, "referrals"],
    queryFn: () => read("/involve/referrals/me", referralsSchema, null),
  });
