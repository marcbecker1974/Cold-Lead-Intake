"use client";

import Link from "next/link";
import { useState } from "react";
import { useLeads } from "@/hooks/useLeads";
import type { Lead, LeadDraft } from "@/lib/lead";
import { reserveLeadNumber } from "@/lib/storage";
import { LeadForm } from "./lead-form";

export function LeadList() {
  const { leads, isLoaded, saveFailed, setLeads } = useLeads();
  // Changing the key remounts the form, resetting it to its empty defaults.
  const [formKey, setFormKey] = useState(0);

  // Wait for localStorage to load so the empty state doesn't flash.
  if (!isLoaded) return null;

  function handleSave(draft: LeadDraft) {
    const lead: Lead = { ...draft, leadNumber: reserveLeadNumber(leads) };
    setLeads([lead, ...leads]);
    setFormKey((key) => key + 1);
  }

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

      {leads.length === 0 ? (
        <div className="rounded-md border border-zinc-200 px-4 py-4 dark:border-zinc-800">
          <p className="text-sm font-semibold">No target companies yet</p>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            Companies you add will appear here for further research and
            qualification.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-zinc-200 rounded-md border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {leads.map((lead) => (
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
    </div>
  );
}
