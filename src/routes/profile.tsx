import {
  IconBriefcase,
  IconCalendar,
  IconCalendarCheck,
  IconChecks,
  IconCircleCheck,
  IconCreditCard,
  IconGenderBigender,
  IconHome,
  IconId,
  IconMail,
  IconPhone,
  IconShirt,
  IconUsers,
} from "@tabler/icons-react";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { toast } from "sonner";
import AnimatedButton from "@/components/ui/animated-button";
import { ProtectedRoute } from "@/features/auth/component/protected-route";
import { useAuth } from "@/features/auth/hooks/use-auth";

export const Route = createFileRoute("/profile")({
  component: ProfileRouteComponent,
});

function ProfileRouteComponent() {
  const { user, logout } = useAuth();

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
              <div className="flex items-center gap-2">
                <h1 className="text-3xl font-bold">{user.full_name}</h1>
                {user.status === "confirmed" && (
                  <IconCircleCheck className="size-6 fill-blue-500 text-white" />
                )}
              </div>
              <div className="flex max-sm:flex-col justify-between w-full items-center">
                <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground md:justify-start">
                  <span className="font-semibold text-foreground">
                    {profile?.batch_year ?? "N/A"} Batch
                  </span>
                  <span>·</span>
                  <span className="capitalize">
                    {profile?.academic_group ?? "Alumni"}
                  </span>
                  <span>·</span>
                  <span className="capitalize">{user.status}</span>
                </div>
                <AnimatedButton
                  size="sm"
                  variant="ghost"
                  className="max-sm:w-[90%] max-sm:mt-4"
                  onClick={handleLogout}
                >
                  Log out
                </AnimatedButton>
              </div>
            </div>
          </div>
          <div className="mt-1 mb-2 border-t" />
          <div id="basic-info" className="space-y-3 pb-6 text-sm">
            <InfoRow icon={<IconMail />} label="Email" value={user.email} />
            <InfoRow
              icon={<IconPhone />}
              label="Phone"
              value={user.phone_number}
            />
            <InfoRow
              icon={<IconCalendar />}
              label="Joined on"
              value={new Date(user.created_at).toLocaleDateString()}
            />
            {profile?.registered_at && (
              <InfoRow
                icon={<IconCalendarCheck />}
                label="Registered on"
                value={new Date(profile.registered_at).toLocaleDateString()}
              />
            )}
            <InfoRow
              icon={<IconChecks />}
              label="Registration code"
              value={profile?.reg_code ?? "N/A"}
            />
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
        </div>
      </main>
    </ProtectedRoute>
  );
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
