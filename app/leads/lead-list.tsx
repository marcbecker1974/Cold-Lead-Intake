"use client";

import Link from "next/link";
import { useState } from "react";
import { useLeads } from "@/hooks/useLeads";
import type { Lead, LeadDraft } from "@/lib/lead";
import { reserveLeadNumber } from "@/lib/storage";
import { LeadForm } from "./lead-form";

const searchClass =
  "w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-blue-600 dark:border-zinc-700 dark:bg-transparent";

// All saved information except the internal UUID, lowercased for matching.
function searchText(lead: Lead): string {
  return Object.entries(lead)
    .filter(([key]) => key !== "id")
    .map(([key, value]) =>
      key === "leadNumber" ? `#${value} ${value}` : String(value),
    )
    .join(" ")
    .toLowerCase();
}

export function LeadList() {
  const { leads, isLoaded, saveFailed, setLeads } = useLeads();
  const [query, setQuery] = useState("");
  // Changing the key remounts the form, resetting it to its empty defaults.
  const [formKey, setFormKey] = useState(0);

  // Wait for localStorage to load so the empty state doesn't flash.
  if (!isLoaded) return null;

  function handleSave(draft: LeadDraft) {
    const lead: Lead = { ...draft, leadNumber: reserveLeadNumber(leads) };
    setLeads([lead, ...leads]);
    setFormKey((key) => key + 1);
    // Clear the search so the new lead is visible right away.
    setQuery("");
  }

  // Every search term must appear somewhere in the lead's saved information.
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const visibleLeads = leads.filter((lead) => {
    const text = searchText(lead);
    return terms.every((term) => text.includes(term));
  });

  return (
    <div className="space-y-4">
      <LeadForm
        key={formKey}
        onSave={handleSave}
        onCancel={() => setFormKey((key) => key + 1)}
      />

      {saveFailed && (
        <p role="alert" className="text-sm text-red-700 dark:text-red-400">
          Could not save to browser storage. Recent changes may be lost on
          reload.
        </p>
      )}

      {leads.length > 0 && (
        <div>
          <label htmlFor="lead-search" className="mb-1 block text-sm font-semibold">
            Search leads
          </label>
          <input
            id="lead-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type whatever you search by any saved information"
            className={searchClass}
          />
        </div>
      )}

      <section className="space-y-2">
        {leads.length > 0 && (
          <h2 className="text-sm font-semibold">Saved leads</h2>
        )}

        {leads.length === 0 ? (
          <div className="rounded-md border border-zinc-200 px-4 py-4 dark:border-zinc-800">
            <p className="text-sm font-semibold">No target companies yet</p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Companies you add will appear here for further research and
              qualification.
            </p>
          </div>
        ) : visibleLeads.length === 0 ? (
          <div className="rounded-md border border-zinc-200 px-4 py-4 dark:border-zinc-800">
            <p className="text-sm font-semibold">No leads match your search</p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Try a different term, or clear the search field.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-md border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {visibleLeads.map((lead) => (
              <li
                key={lead.id}
                className="flex items-center justify-between gap-4 px-4 py-3"
              >
                <div className="flex min-w-0 items-baseline gap-3">
                  <span className="shrink-0 text-sm tabular-nums text-zinc-500">
                    #{lead.leadNumber}
                  </span>
                  <Link
                    href={`/leads/${lead.id}`}
                    className="min-w-0 break-words text-base font-medium text-blue-700 hover:underline dark:text-blue-400"
                  >
                    {lead.companyName}
                  </Link>
                </div>
                <span className="shrink-0 rounded-full border border-zinc-300 px-2.5 py-0.5 text-xs font-medium dark:border-zinc-700">
                  <span className="sr-only">Research status: </span>
                  {lead.researchStatus}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
