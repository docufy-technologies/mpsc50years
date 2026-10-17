import { createFileRoute } from "@tanstack/react-router";
import { cn } from "cn";
import { useState } from "react";

import { OpenMicForm } from "@/features/involve/components/openmic-form";
import { SponsorForm } from "@/features/involve/components/sponsor-form";
import { StallForm } from "@/features/involve/components/stall-form";
import { SubcommitteeForm } from "@/features/involve/components/subcommittee-form";

export const Route = createFileRoute("/involve")({
  component: RouteComponent,
});

type TabId = "stall" | "sponsor" | "subcommittee" | "openmic";

const TABS: { id: TabId; label: string }[] = [
  { id: "stall", label: "Book a Stall" },
  { id: "sponsor", label: "Sponsor" },
  { id: "subcommittee", label: "Join a Sub-committee" },
  { id: "openmic", label: "Open Mic" },
];

function RouteComponent() {
  const [activeTab, setActiveTab] = useState<TabId>("stall");

  return (
    <section className="min-h-screen pb-20 pt-32 max-w-3xl px-8 mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">Get Involved</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Beyond registering, there are many ways to be part of the MPSC 50
          Years Golden Jubilee.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Get involved options"
        className="mb-8 flex flex-wrap justify-center gap-2"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`involve-tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`involve-panel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`involve-panel-${activeTab}`}
        aria-labelledby={`involve-tab-${activeTab}`}
      >
        {activeTab === "stall" && <StallForm />}
        {activeTab === "sponsor" && <SponsorForm />}
        {activeTab === "subcommittee" && <SubcommitteeForm />}
        {activeTab === "openmic" && <OpenMicForm />}
      </div>
    </section>
  );
}
