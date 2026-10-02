"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useLeads } from "@/hooks/useLeads";
import type { Lead } from "@/lib/lead";
import { LeadForm } from "../lead-form";

const buttonClass =
  "rounded-md border px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

const backLinkClass =
  "text-sm text-blue-700 hover:underline dark:text-blue-400";

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

  function handleSave(updated: Lead) {
    setLeads(leads.map((item) => (item.id === updated.id ? updated : item)));
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

  const fields: [string, string | number | undefined][] = [
    ["Website", lead.website],
    ["Management type", lead.managementType],
    ["Managed units", lead.managedUnits],
    ["City", lead.city],
    ["Federal state", lead.federalState],
    ["Ownership structure", lead.ownershipStructure],
    ["Source", lead.source],
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
          <p className="mt-2">
            <span className="inline-block rounded-full border border-zinc-300 px-2.5 py-0.5 text-xs font-medium dark:border-zinc-700">
              <span className="sr-only">Research status: </span>
              {lead.researchStatus}
            </span>
          </p>
        </div>
        {!isEditing && (
          <div className="flex gap-2">
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
        )}
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
        <dl className="mt-6 grid grid-cols-1 gap-x-6 gap-y-4 md:grid-cols-2">
          {fields.map(([label, value]) => (
            <div
              key={label}
              className={`min-w-0${label === "Notes" ? " md:col-span-2" : ""}`}
            >
              <dt className="text-sm text-zinc-600 dark:text-zinc-400">
                {label}
              </dt>
              <dd className="mt-0.5 whitespace-pre-wrap break-words text-base">
                {value === undefined || value === "" ? (
                  <span className="text-sm text-zinc-500">Not specified</span>
                ) : (
                  value
                )}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
