"use client";

import { useLeads } from "@/hooks/useLeads";

export function LeadList() {
  const { leads, isLoaded } = useLeads();

  // Wait for localStorage to load so the empty state doesn't flash.
  if (!isLoaded) return null;

  if (leads.length === 0) {
    return (
      <div className="rounded-md border border-zinc-200 px-4 py-4 dark:border-zinc-800">
        <p className="text-sm font-semibold">No target companies yet</p>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Companies you add will appear here for further research and
          qualification.
        </p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 rounded-md border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
      {leads.map((lead) => (
        <li
          key={lead.id}
          className="flex items-center justify-between gap-4 px-4 py-3"
        >
          <span className="text-base">{lead.companyName}</span>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            {lead.researchStatus}
          </span>
        </li>
      ))}
    </ul>
  );
}
