import {
  IconBriefcase,
  IconCalendarCheck,
  IconChecks,
  IconCircleCheck,
  IconCreditCard,
  IconGenderBigender,
  IconHome,
  IconId,
  IconLink,
  IconMail,
  IconMicrophone,
  IconPhone,
  IconShirt,
  IconSpeakerphone,
  IconUsers,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { toast } from "sonner";
import AnimatedButton from "@/components/ui/animated-button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProtectedRoute } from "@/features/auth/component/protected-route";
import { useAuth } from "@/features/auth/hooks/use-auth";
import {
  openMicEntriesQueryOptions,
  referralsQueryOptions,
  sponsorOffersQueryOptions,
  stallApplicationQueryOptions,
  subcommitteeApplicationQueryOptions,
} from "@/features/involve/action/read-involve";
import { formatOptionLabel } from "@/features/involve/constants";

export const Route = createFileRoute("/profile")({
  component: ProfileRouteComponent,
});

function ProfileRouteComponent() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;
  const profile = user.profile;
  const initials = user.full_name
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2);

  async function handleLogout() {
    try {
      await logout();
      toast.success("You have been logged out.");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to log out.",
      );
    }
  }

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-4xl px-8 pb-20 pt-36">
        <div className="relative">
          <div className="flex flex-col items-center gap-4 pb-4 md:items-start">
            <div className="relative flex size-40 items-center justify-center overflow-hidden rounded-full border-4 border-background bg-muted text-3xl font-semibold shadow-lg">
              {profile?.profile_picture ? (
                <img
                  src={profile.profile_picture}
                  alt={user.full_name}
                  className="size-full object-cover"
                />
              ) : (
                initials
              )}
            </div>
            <div className="flex flex-col items-center gap-2 md:items-start w-full">
              <div>
                <h1 className="mr-2">{user.full_name}</h1>
                {user.status === "confirmed" && (
                  <IconCircleCheck className="size-6 fill-blue-500 text-white" />
                )}
              </div>
              <div className="flex max-sm:flex-col justify-between w-full items-center">
                <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground md:flex-nowrap md:justify-start">
                  <span className="font-semibold">
                    {profile?.batch_year ?? "N/A"}
                  </span>
                  Batch
                  <span>·</span>
                  <span className="capitalize">
                    {profile?.academic_group ?? "Alumni"}
                  </span>
                  <span>·</span>
                  <span className="font-semibold capitalize">
                    {user.status}
                  </span>
                </div>
                <div className="flex w-full items-center justify-center gap-2 max-sm:flex-col sm:w-auto sm:justify-end">
                  <AnimatedButton
                    size="sm"
                    variant="ghost"
                    className="max-sm:w-[90%] max-sm:mt-4"
                    onClick={handleLogout}
                  >
                    Log out
                  </AnimatedButton>
                  {/* TODO: Implement payment functionality */}
                  {user.status === "pending" && (
                    <AnimatedButton
                      size="sm"
                      className="max-sm:w-[90%]"
                      onClick={() => navigate({ to: "/payment" })}
                    >
                      Verify Account
                    </AnimatedButton>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-1 mb-2 border-t" />
          <Tabs defaultSelectedKey="profile" className="w-full mt-6">
            <TabsList
              aria-label="Profile sections"
              className="w-full"
              variant="line"
            >
              <TabsTrigger id="profile">Profile Info</TabsTrigger>
              <TabsTrigger id="involvement">Involvement Info</TabsTrigger>
            </TabsList>
            <TabsContent id="profile" className="pt-4">
              <div id="basic-info" className="space-y-3 pb-6 text-sm">
                <InfoRow
                  icon={<IconChecks />}
                  label="Registration / Referral Code"
                  value={profile?.reg_code ?? "N/A"}
                />
                <InfoRow icon={<IconMail />} label="Email" value={user.email} />
                <InfoRow
                  icon={<IconPhone />}
                  label="Phone"
                  value={user.phone_number}
                />
                {profile?.registered_at && (
                  <InfoRow
                    icon={<IconCalendarCheck />}
                    label="Registered on"
                    value={new Date(profile.registered_at).toLocaleDateString()}
                  />
                )}
                <InfoRow
                  icon={<IconId />}
                  label="Student ID"
                  value={profile?.student_id ?? "N/A"}
                />
                <InfoRow
                  icon={<IconShirt />}
                  label="T-shirt size"
                  value={profile?.tee_shirt_size ?? "N/A"}
                />
                <InfoRow
                  icon={<IconGenderBigender />}
                  label="Gender"
                  valueClassName="capitalize"
                  value={profile?.gender ?? "N/A"}
                />
                <InfoRow
                  icon={<IconHome />}
                  label="Address"
                  valueClassName="basis-full pl-8 sm:basis-auto sm:pl-0"
                  value={
                    [
                      profile?.address.street_address,
                      profile?.address.city,
                      profile?.address.state_or_province,
                      profile?.address.postal_code,
                      profile?.address.country,
                    ]
                      .filter(Boolean)
                      .join(", ") || "N/A"
                  }
                />
                {profile?.work_profile && (
                  <>
                    <InfoRow
                      icon={<IconBriefcase />}
                      label="Organization"
                      value={profile.work_profile.organization_name}
                    />
                    <InfoRow
                      icon={<IconBriefcase />}
                      label="Department"
                      value={profile.work_profile.department_or_division}
                    />
                    <InfoRow
                      icon={<IconBriefcase />}
                      label="Designation"
                      value={profile.work_profile.designation}
                    />
                  </>
                )}
                <InfoRow
                  icon={<IconCreditCard />}
                  label="Payment"
                  value={user.payment.has_paid ? "Paid" : "Not paid"}
                  valueClassName="capitalize"
                />
                <InfoRow
                  icon={<IconCircleCheck />}
                  label="Account status"
                  value={user.status}
                  valueClassName="capitalize"
                />
                <InfoRow
                  icon={<IconCreditCard />}
                  label="Payment status"
                  value={user.payment.latest_status}
                  valueClassName="capitalize"
                />
                {user.payment.amount !== null && (
                  <InfoRow
                    icon={<IconCreditCard />}
                    label="Payment amount"
                    value={user.payment.amount.toLocaleString()}
                  />
                )}
                {user.payment.transaction_reference && (
                  <InfoRow
                    icon={<IconCreditCard />}
                    label="Transaction reference"
                    value={user.payment.transaction_reference}
                  />
                )}
                {user.payment.paid_at && (
                  <InfoRow
                    icon={<IconCalendarCheck />}
                    label="Paid on"
                    value={new Date(user.payment.paid_at).toLocaleDateString()}
                  />
                )}
                {user.acquaintances.map((acquaintance) => (
                  <InfoRow
                    key={acquaintance.uuid}
                    icon={<IconUsers />}
                    label={acquaintance.relation}
                    value={`${acquaintance.full_name} (${acquaintance.age_group})`}
                    valueClassName="capitalize"
                  />
                ))}
              </div>
            </TabsContent>
            <TabsContent id="involvement" className="pt-4">
              <InvolvementInfo userUuid={user.uuid} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </ProtectedRoute>
  );
}

function InvolvementInfo({ userUuid }: { userUuid: string }) {
  const stall = useQuery(stallApplicationQueryOptions(userUuid));
  const sponsors = useQuery({
    ...sponsorOffersQueryOptions(userUuid),
    enabled: stall.isFetched,
  });
  const subcommittee = useQuery({
    ...subcommitteeApplicationQueryOptions(userUuid),
    enabled: sponsors.isFetched,
  });
  const openMic = useQuery({
    ...openMicEntriesQueryOptions(userUuid),
    enabled: subcommittee.isFetched,
  });
  const referrals = useQuery({
    ...referralsQueryOptions(userUuid),
    enabled: openMic.isFetched,
  });

  return (
    <div className="space-y-6 pb-6 text-sm">
      <div className="w-full flex justify-end">
        <Link
          to="/involve"
          className="w-full sm:w-auto text-accent hover:underline border py-1 px-2 rounded-4xl"
        >
          + Get involved in more
        </Link>
      </div>
      <InvolvementSection title="Stall Application">
        {stall.isLoading ? (
          <InvolvementLoading />
        ) : stall.error ? (
          <InvolvementError message={getQueryError(stall.error)} />
        ) : stall.data ? (
          <>
            <InfoRow
              icon={<IconSpeakerphone />}
              label="Name"
              value={stall.data.stall_name}
            />
            <InfoRow
              icon={<IconSpeakerphone />}
              label="Category"
              value={formatOptionLabel(stall.data.category)}
            />
            <InfoRow
              icon={<IconSpeakerphone />}
              label="Description"
              value={stall.data.description}
            />
            <InfoRow
              icon={<IconUsers />}
              label="Helpers"
              value={String(stall.data.number_of_helpers)}
            />
            <InfoRow
              icon={<IconPhone />}
              label="Contact phone"
              value={stall.data.contact_phone}
            />
            <InfoRow
              icon={<IconCreditCard />}
              label="Application status"
              value={formatOptionLabel(stall.data.status)}
            />
            <InfoRow
              icon={<IconCreditCard />}
              label="Stall fee status"
              value={formatOptionLabel(stall.data.stall_fee_status)}
            />
          </>
        ) : (
          <EmptyInvolvement label="No stall application submitted." />
        )}
      </InvolvementSection>

      <InvolvementSection title="Sponsor Offers">
        {sponsors.isLoading ? (
          <InvolvementLoading />
        ) : sponsors.error ? (
          <InvolvementError message={getQueryError(sponsors.error)} />
        ) : sponsors.data.length > 0 ? (
          sponsors.data.map((sponsor) => (
            <div key={sponsor.uuid} className="space-y-3">
              <InfoRow
                icon={<IconSpeakerphone />}
                label="Sponsor"
                value={sponsor.sponsor_name}
              />
              <InfoRow
                icon={<IconSpeakerphone />}
                label="Type"
                value={formatOptionLabel(sponsor.sponsor_type)}
              />
              <InfoRow
                icon={<IconMail />}
                label="Email"
                value={sponsor.email}
              />
              <InfoRow
                icon={<IconCreditCard />}
                label="Status"
                value={formatOptionLabel(sponsor.status)}
              />
            </div>
          ))
        ) : (
          <EmptyInvolvement label="No sponsor offers submitted." />
        )}
      </InvolvementSection>

      <InvolvementSection title="Subcommittee Application">
        {subcommittee.isLoading ? (
          <InvolvementLoading />
        ) : subcommittee.error ? (
          <InvolvementError message={getQueryError(subcommittee.error)} />
        ) : subcommittee.data ? (
          <>
            <InfoRow
              icon={<IconUsers />}
              label="First choice"
              value={subcommittee.data.first_choice}
            />
            <InfoRow
              icon={<IconUsers />}
              label="Second choice"
              value={subcommittee.data.second_choice ?? "N/A"}
            />
            <InfoRow
              icon={<IconSpeakerphone />}
              label="Motivation"
              value={subcommittee.data.motivation}
            />
            <InfoRow
              icon={<IconCreditCard />}
              label="Status"
              value={formatOptionLabel(subcommittee.data.status)}
            />
          </>
        ) : (
          <EmptyInvolvement label="No subcommittee application submitted." />
        )}
      </InvolvementSection>

      <InvolvementSection title="Open Mic Entries">
        {openMic.isLoading ? (
          <InvolvementLoading />
        ) : openMic.error ? (
          <InvolvementError message={getQueryError(openMic.error)} />
        ) : openMic.data.length > 0 ? (
          openMic.data.map((entry) => (
            <div key={entry.uuid} className="space-y-3">
              <InfoRow
                icon={<IconMicrophone />}
                label="Performance"
                value={formatOptionLabel(entry.performance_type)}
              />
              <InfoRow
                icon={<IconMicrophone />}
                label="Description"
                value={entry.title_or_description}
              />
              <InfoRow
                icon={<IconMicrophone />}
                label="Duration"
                value={`${entry.duration_minutes} minutes`}
              />
              <InfoRow
                icon={<IconCreditCard />}
                label="Status"
                value={formatOptionLabel(entry.status)}
              />
              {entry.performance_link && (
                <InfoRow
                  icon={<IconLink />}
                  label="Performance link"
                  value={entry.performance_link}
                />
              )}
            </div>
          ))
        ) : (
          <EmptyInvolvement label="No open mic entries submitted." />
        )}
      </InvolvementSection>
      <InvolvementSection title="Referrals">
        {referrals.isLoading ? (
          <InvolvementLoading />
        ) : referrals.error ? (
          <InvolvementError message={getQueryError(referrals.error)} />
        ) : referrals.data ? (
          <>
            <InfoRow
              icon={<IconChecks />}
              label="Referral code"
              value={referrals.data.referral_code}
            />
            <InfoRow
              icon={<IconUsers />}
              label="Qualifying referrals"
              value={String(referrals.data.referral_count)}
            />
            {referrals.data.referrals.map((referral) => (
              <InfoRow
                key={referral.uuid}
                icon={<IconUsers />}
                label={referral.full_name}
                value={formatOptionLabel(referral.status)}
              />
            ))}
          </>
        ) : (
          <EmptyInvolvement label="No referrals available yet." />
        )}
      </InvolvementSection>
    </div>
  );
}

function InvolvementSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold">{title}</h2>
      <div className="mt-1 mb-2 border-t" />
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function EmptyInvolvement({ label }: { label: string }) {
  return <p className="text-muted-foreground">{label}</p>;
}

function InvolvementLoading() {
  return <p className="text-muted-foreground">Loading...</p>;
}

function InvolvementError({ message }: { message: string }) {
  return <p className="text-destructive">{message}</p>;
}

function getQueryError(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Unable to load involvement information.";
}

function InfoRow({
  icon,
  label,
  value,
  valueClassName,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-muted-foreground">
      <span className="shrink-0 [&>svg]:size-5">{icon}</span>
      <span>{label}:</span>
      <span className={`font-medium text-foreground ${valueClassName ?? ""}`}>
        {value}
      </span>
    </div>
  );
}
