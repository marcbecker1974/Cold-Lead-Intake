"use client";

import Link from "next/link";
import { useState } from "react";
import { useLeads } from "@/hooks/useLeads";
import { formatCreated, type Lead, type LeadDraft } from "@/lib/lead";
import { reserveLeadNumber } from "@/lib/storage";
import { LeadForm } from "./lead-form";
import { LeadTransfer, type TransferMessage } from "./lead-transfer";

const searchClass =
  "w-full rounded-md border border-zinc-300 bg-zinc-50 px-3 py-2.5 text-base text-ellipsis focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-blue-600 md:py-1.5 md:text-sm dark:border-zinc-700 dark:bg-transparent";

// Managed-units filters; min is an exclusive lower bound, null shows all.
const UNIT_FILTERS = [
  { label: ">3000", min: 3000 },
  { label: ">5000", min: 5000 },
  { label: "All", min: null },
] as const;

const filterButtonClass =
  "rounded-md border px-3 py-2.5 text-base font-medium md:py-1 md:text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

// All saved information except the internal UUID and the raw timestamps,
// lowercased for matching.
const HIDDEN_FROM_SEARCH = ["id", "createdAt", "updatedAt", "exportedAt"];

function searchText(lead: Lead): string {
  return Object.entries(lead)
    .filter(([key]) => !HIDDEN_FROM_SEARCH.includes(key))
    .map(([key, value]) =>
      key === "leadNumber" ? `#${value} ${value}` : String(value),
    )
    .join(" ")
    .toLowerCase();
}

export function LeadList() {
  const { leads, isLoaded, saveFailed, setLeads } = useLeads();
  const [query, setQuery] = useState("");
  const [minUnits, setMinUnits] = useState<number | null>(null);
  const [message, setMessage] = useState<TransferMessage | null>(null);
  // Changing the key remounts the form, resetting it to its empty defaults.
  const [formKey, setFormKey] = useState(0);

  // Wait for localStorage to load so the empty state doesn't flash.
  if (!isLoaded) return null;

  function handleSave(draft: LeadDraft) {
    const now = new Date().toISOString();
    const lead: Lead = {
      ...draft,
      leadNumber: reserveLeadNumber(leads),
      createdAt: now,
      updatedAt: now,
    };
    setLeads([lead, ...leads]);
    setFormKey((key) => key + 1);
    // Clear the search so the new lead is visible right away.
    setQuery("");
    setMinUnits(null);
  }

  // Every search term must appear somewhere in the lead's saved information.
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  const visibleLeads = leads.filter((lead) => {
    // Leads without managed units never pass a units filter.
    if (minUnits !== null && (lead.managedUnits ?? 0) <= minUnits) return false;
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

      <hr className="my-2 border-zinc-200 dark:border-zinc-800" />

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Saved leads</h2>
          <LeadTransfer
            leads={leads}
            setLeads={setLeads}
            onMessage={setMessage}
          />
        </div>
        {message && (
          <p
            role={message.kind === "error" ? "alert" : "status"}
            className={
              message.kind === "error"
                ? "text-sm text-red-700 dark:text-red-400"
                : "text-sm text-zinc-600 dark:text-zinc-400"
            }
          >
            {message.text}
          </p>
        )}
        {leads.length > 0 && (
          <input
            type="search"
            aria-label="Search leads"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type whatever you search by any saved information"
            className={searchClass}
          />
        )}
      </div>

      <section className="space-y-2">
        {leads.length > 0 && (
          <div>
            <div
              role="group"
              aria-label="Filter by managed units"
              className="flex gap-2"
            >
              {UNIT_FILTERS.map((filter) => {
                const isActive = minUnits === filter.min;
                return (
                  <button
                    key={filter.label}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setMinUnits(filter.min)}
                    className={`${filterButtonClass} ${
                      isActive
                        ? "border-zinc-400 bg-zinc-200 dark:border-zinc-600 dark:bg-zinc-800"
                        : "border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900"
                    }`}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>
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
            <p className="text-sm font-semibold">No leads match</p>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
              Try a different search term or filter.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-md border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {visibleLeads.map((lead) => (
              <li
                key={lead.id}
                className="flex flex-col items-start gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
              >
                <div className="max-w-full min-w-0">
                  <div className="flex min-w-0 items-baseline gap-3">
                    <span className="shrink-0 text-sm tabular-nums text-zinc-500">
                      #{lead.leadNumber}
                    </span>
                    <Link
                      href={`/leads/${lead.id}`}
                      className="-my-2 min-w-0 py-2 break-words text-base font-medium text-blue-700 hover:underline dark:text-blue-400"
                    >
                      {lead.companyName}
                    </Link>
                  </div>
                  {formatCreated(lead.createdAt) && (
                    <p className="mt-0.5 text-xs text-zinc-500">
                      {formatCreated(lead.createdAt)}
                    </p>
                  )}
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
