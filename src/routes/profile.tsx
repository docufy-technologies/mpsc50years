import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import AnimatedButton from "@/components/ui/animated-button";
import { fetchBackend } from "@/lib/api";

export const Route = createFileRoute("/profile")({
  component: ProfileRouteComponent,
});

interface AlumProfileResponse {
  uuid: string;
  full_name: string;
  email: string;
  phone_number: string;
  status: string;
  created_at: string;
  profile?: {
    reg_code: string;
    student_id?: string | null;
    batch_year: number;
    tee_shirt_size: string;
    gender?: string | null;
    academic_group?: string | null;
    registered_at: string;
    work_profile?: {
      organization_name: string;
      department_or_division: string;
      designation: string;
    } | null;
    address?: {
      street_address: string;
      city: string;
      state_or_province: string;
      postal_code: string;
      country: string;
    } | null;
  } | null;
}

function ProfileRouteComponent() {
  const [data, setData] = useState<AlumProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const res = await fetchBackend("/auth/me", "GET");
        if (!res.ok) {
          const errBody = await res.json().catch(() => null);
          const detail =
            errBody && typeof errBody === "object" && "detail" in errBody
              ? String(errBody.detail)
              : `Failed to load profile (${res.status})`;
          throw new Error(detail);
        }
        const json = (await res.json()) as AlumProfileResponse;
        if (isMounted) {
          setData(json);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load profile",
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <main className="min-h-screen pt-36 pb-20 px-8 max-w-4xl mx-auto">
      <div className="border border-border/80 rounded-2xl p-6 sm:p-10 bg-card/60 backdrop-blur-md shadow-sm space-y-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Registration Details (/auth/me)
          </h1>
          <p className="text-muted-foreground mt-2 text-base">
            Verification landing page confirming successful registration and
            session token cookie.
          </p>
        </div>

        {loading && (
          <div className="py-12 text-center text-lg text-muted-foreground animate-pulse">
            Fetching registered alumni profile from backend...
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive space-y-4">
            <p className="font-semibold text-lg">Error Loading Profile</p>
            <p className="text-base">{error}</p>
            <div className="pt-2">
              <Link to="/register">
                <AnimatedButton size="sm">Go back to Register</AnimatedButton>
              </Link>
            </div>
          </div>
        )}

        {data && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base sm:text-lg">
              <div className="border border-border/60 rounded-xl p-5 space-y-2 bg-background/50">
                <h2 className="text-xl font-bold pb-2 border-b border-border">
                  Personal Information
                </h2>
                <div>
                  <span className="text-muted-foreground">Name: </span>
                  <span className="font-semibold">{data.full_name}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email: </span>
                  <span className="font-mono">{data.email}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Phone: </span>
                  <span className="font-mono">{data.phone_number}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status: </span>
                  <span className="inline-block uppercase font-bold text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                    {data.status}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">UUID: </span>
                  <span className="font-mono text-xs break-all text-muted-foreground">
                    {data.uuid}
                  </span>
                </div>
              </div>

              <div className="border border-border/60 rounded-xl p-5 space-y-2 bg-background/50">
                <h2 className="text-xl font-bold pb-2 border-b border-border">
                  Academic Verification
                </h2>
                <div>
                  <span className="text-muted-foreground">
                    Registration Code:{" "}
                  </span>
                  <span className="font-mono font-bold text-primary">
                    {data.profile?.reg_code || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Passing Year: </span>
                  <span className="font-semibold">
                    {data.profile?.batch_year || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">T-Shirt Size: </span>
                  <span className="font-semibold">
                    {data.profile?.tee_shirt_size || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Gender: </span>
                  <span className="capitalize">
                    {data.profile?.gender || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">
                    Academic Group:{" "}
                  </span>
                  <span className="capitalize">
                    {data.profile?.academic_group || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Student ID: </span>
                  <span className="font-mono">
                    {data.profile?.student_id || "N/A"}
                  </span>
                </div>
              </div>

              {data.profile?.work_profile && (
                <div className="border border-border/60 rounded-xl p-5 space-y-2 bg-background/50">
                  <h2 className="text-xl font-bold pb-2 border-b border-border">
                    Work Profile
                  </h2>
                  <div>
                    <span className="text-muted-foreground">
                      Organization:{" "}
                    </span>
                    <span className="font-semibold">
                      {data.profile.work_profile.organization_name}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Department: </span>
                    <span>
                      {data.profile.work_profile.department_or_division}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Designation: </span>
                    <span>{data.profile.work_profile.designation}</span>
                  </div>
                </div>
              )}

              {data.profile?.address && (
                <div className="border border-border/60 rounded-xl p-5 space-y-2 bg-background/50">
                  <h2 className="text-xl font-bold pb-2 border-b border-border">
                    Address
                  </h2>
                  <div>
                    <span className="text-muted-foreground">Street: </span>
                    <span>{data.profile.address.street_address}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">City: </span>
                    <span>{data.profile.address.city}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">
                      State/Province:{" "}
                    </span>
                    <span>{data.profile.address.state_or_province}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Postal Code: </span>
                    <span>{data.profile.address.postal_code}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Country: </span>
                    <span>{data.profile.address.country}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-border/50">
              <h3 className="text-lg font-semibold mb-2">Raw JSON Response:</h3>
              <pre className="bg-muted p-4 rounded-xl text-xs overflow-x-auto font-mono text-muted-foreground">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
