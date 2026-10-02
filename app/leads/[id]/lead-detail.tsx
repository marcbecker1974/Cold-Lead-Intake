"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLeads } from "@/hooks/useLeads";
import { formatCreated, hasBusinessChanges, type LeadDraft } from "@/lib/lead";
import { LeadForm } from "../lead-form";

const buttonClass =
  "rounded-md border px-3 py-2.5 text-base font-medium md:py-1.5 md:text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

// Read-only counterpart of the form controls in lead-form.tsx.
const valueBoxClass =
  "w-full min-w-0 whitespace-pre-wrap break-words rounded-md border border-zinc-300 bg-background px-3 py-2.5 text-base md:py-1.5 md:text-sm dark:border-zinc-700";

const backLinkClass =
  "-my-3 inline-block py-3 text-sm text-blue-700 hover:underline dark:text-blue-400";

export function LeadDetail({ id }: { id: string }) {
  const router = useRouter();
  const { leads, isLoaded, saveFailed, setLeads } = useLeads();
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const wasEditing = useRef(false);

  // Return focus to the Edit button when leaving edit mode.
  useEffect(() => {
    if (wasEditing.current && !isEditing) editButtonRef.current?.focus();
    wasEditing.current = isEditing;
  }, [isEditing]);

  // Wait for localStorage to load so "not found" doesn't flash.
  if (!isLoaded) return null;

  // Avoid flashing "not found" while navigating away after a delete.
  if (isDeleted) return null;

  const lead = leads.find((item) => item.id === id);

  if (!lead) {
    return (
      <div>
        <Link href="/leads" className={backLinkClass}>
          All leads
        </Link>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Lead not found
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          This lead does not exist or has been deleted.
        </p>
      </div>
    );
  }

  function handleSave(updated: LeadDraft) {
    // Saving without changing anything keeps the lead exactly as it is, so
    // updatedAt stays and an exported lead does not become "modified".
    const current = leads.find((item) => item.id === updated.id);
    if (current && hasBusinessChanges(current, updated)) {
      // The form doesn't handle numbers or timestamps: keep leadNumber,
      // createdAt and exportedAt, and mark the edit with a new updatedAt.
      setLeads(
        leads.map((item) =>
          item.id === updated.id
            ? {
                ...updated,
                leadNumber: item.leadNumber,
                ...(item.createdAt && { createdAt: item.createdAt }),
                ...(item.exportedAt && { exportedAt: item.exportedAt }),
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      );
    }
    setIsEditing(false);
  }

  function handleDelete() {
    if (!window.confirm(`Delete "${lead?.companyName}"? This cannot be undone.`)) {
      return;
    }
    setIsDeleted(true);
    setLeads(leads.filter((item) => item.id !== id));
    router.push("/leads");
  }

  const created = formatCreated(lead.createdAt);

  // Same fields and order as the form.
  const fields: [string, string | number | undefined][] = [
    ["Company name", lead.companyName],
    ["Website", lead.website],
    ["Management type", lead.managementType],
    ["Managed units", lead.managedUnits],
    ["City", lead.city],
    ["Federal state", lead.federalState],
    ["Ownership structure", lead.ownershipStructure],
    ["Source", lead.source],
    ["Research status", lead.researchStatus],
    ["Notes", lead.notes],
  ];

  return (
    <div>
      <Link href="/leads" className={backLinkClass}>
        All leads
      </Link>

      {saveFailed && (
        <p role="alert" className="mt-4 text-sm text-red-700 dark:text-red-400">
          Could not save to browser storage. Recent changes may be lost on
          reload.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-semibold tracking-tight">
            {lead.companyName}
          </h1>
          <p className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
              Lead #{lead.leadNumber}
            </span>
            {created && (
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {created}
              </span>
            )}
            <span className="inline-block rounded-full border border-zinc-300 px-2.5 py-0.5 text-xs font-medium dark:border-zinc-700">
              <span className="sr-only">Research status: </span>
              {lead.researchStatus}
            </span>
          </p>
        </div>
      </div>

      {isEditing ? (
        <div className="mt-6">
          <LeadForm
            initialLead={lead}
            onSave={handleSave}
            onCancel={() => setIsEditing(false)}
          />
        </div>
      ) : (
        <section
          aria-label="Lead details"
          className="mt-6 rounded-md border border-zinc-200 p-4 dark:border-zinc-800"
        >
          <h2 className="text-base font-semibold">Lead details</h2>

          <dl className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {fields.map(([label, value]) => {
              const isNotes = label === "Notes";
              const isEmpty = value === undefined || value === "";
              return (
                <div
                  key={label}
                  className={`min-w-0${isNotes ? " md:col-span-2" : ""}`}
                >
                  <dt className="mb-1 block text-sm font-medium">{label}</dt>
                  <dd
                    className={`${valueBoxClass}${isNotes ? " min-h-[5.875rem] md:min-h-[4.625rem]" : ""}${isEmpty ? " text-zinc-500" : ""}`}
                  >
                    {isEmpty ? "Not specified" : value}
                  </dd>
                </div>
              );
            })}
          </dl>

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              ref={editButtonRef}
              onClick={() => setIsEditing(true)}
              className={`${buttonClass} border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900`}
            >
              Edit
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className={`${buttonClass} border-zinc-300 text-red-700 hover:bg-red-50 dark:border-zinc-700 dark:text-red-400 dark:hover:bg-zinc-900`}
            >
              Delete
            </button>
          </div>
        </section>
      )}
    </div>
  );
}
