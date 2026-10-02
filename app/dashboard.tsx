"use client";

import { useLeads } from "@/hooks/useLeads";
import { computeDashboard } from "@/lib/dashboard";

const numberFormat = new Intl.NumberFormat("en-US");

export function Dashboard() {
  const { leads, isLoaded } = useLeads();
  const stats = computeDashboard(leads);

  const cards = [
    {
      label: "Target companies",
      value: stats.targetCompanies,
      note: "Total leads",
    },
    {
      label: "Managed units",
      value: stats.managedUnits,
      note: "Across all leads",
    },
    {
      label: "Ready for Qualification",
      value: stats.readyForQualification,
      note: "Sales review ready",
    },
    {
      // Non-breaking hyphen keeps "re-export" on one line when the label wraps.
      label: "Need export / re\u2011export",
      value: stats.needExport,
      note: "New or changed since export",
    },
  ];

  return (
    <section aria-label="Key figures" aria-busy={!isLoaded}>
      <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="min-w-0 rounded-md border border-zinc-200 p-4 dark:border-zinc-800"
          >
            <dt className="text-sm font-medium md:min-h-10">{card.label}</dt>
            {/* Until localStorage is read, show a dash instead of a false 0. */}
            <dd className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
              {isLoaded ? numberFormat.format(card.value) : "–"}
            </dd>
            <dd className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              {card.note}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
