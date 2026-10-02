// Pure export/import logic (no browser APIs). Storage access and the file
// download/upload live in the UI. See docs/persistence-decision.md.

import type { Lead } from "@/lib/lead";
import {
  isPositiveInteger,
  isStoredLead,
  stampMissingDates,
  type StoredLead,
} from "@/lib/storage";

export const EXPORT_FORMAT = "cold-lead-intake";
export const EXPORT_VERSION = 1;

export type ExportFile = {
  format: typeof EXPORT_FORMAT;
  version: number;
  exportedAt: string;
  // Highest lead number ever issued, so a restore never reuses a number.
  counter: number;
  leads: Lead[];
};

export type ImportSummary = {
  added: number;
  updated: number;
  keptLocal: number;
  renumbered: number;
  invalid: number;
};

export type ParsedImport =
  | { ok: true; leads: Lead[]; counter: number; invalid: number }
  | { ok: false; error: string };

// The only fields copied from an imported entry; anything else is dropped.
const LEAD_KEYS = [
  "id",
  "createdAt",
  "updatedAt",
  "exportedAt",
  "companyName",
  "researchStatus",
  "website",
  "managementType",
  "managedUnits",
  "city",
  "federalState",
  "ownershipStructure",
  "source",
  "notes",
] as const;

function highestNumber(leads: Lead[]): number {
  return Math.max(0, ...leads.map((lead) => lead.leadNumber));
}

function time(value: string | undefined): number {
  const t = value ? Date.parse(value) : NaN;
  return Number.isNaN(t) ? 0 : t;
}

// Builds the export file and returns the leads stamped with exportedAt.
// The input is not modified and no lead is removed.
export function buildExport(
  leads: Lead[],
  counter: number,
  now: Date = new Date(),
): { file: ExportFile; leads: Lead[] } {
  const exportedAt = now.toISOString();
  const stamped = leads.map((lead) => ({ ...lead, exportedAt }));
  const file: ExportFile = {
    format: EXPORT_FORMAT,
    version: EXPORT_VERSION,
    exportedAt,
    counter: Math.max(counter, highestNumber(leads)),
    leads: stamped,
  };
  return { file, leads: stamped };
}

// e.g. cold-leads-2026-10-02.json (local date)
export function exportFileName(now: Date = new Date()): string {
  const two = (n: number) => String(n).padStart(2, "0");
  const date = `${now.getFullYear()}-${two(now.getMonth() + 1)}-${two(now.getDate())}`;
  return `cold-leads-${date}.json`;
}

// Copies only known fields. leadNumber 0 means "needs a number".
function toLead(entry: StoredLead): Lead {
  const source = entry as Record<string, unknown>;
  const lead: Record<string, unknown> = {};
  for (const key of LEAD_KEYS) {
    if (source[key] !== undefined) lead[key] = source[key];
  }
  lead.leadNumber = isPositiveInteger(entry.leadNumber) ? entry.leadNumber : 0;
  return lead as unknown as Lead;
}

export function parseImport(text: string, now: Date = new Date()): ParsedImport {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return { ok: false, error: "The file is not valid JSON." };
  }
  if (
    typeof data !== "object" ||
    data === null ||
    Array.isArray(data) ||
    (data as Record<string, unknown>).format !== EXPORT_FORMAT
  ) {
    return { ok: false, error: "This is not a Cold Lead Intake export file." };
  }
  const file = data as Record<string, unknown>;
  const version = file.version;
  if (typeof version !== "number" || !Number.isInteger(version) || version < 1) {
    return { ok: false, error: "The file has no valid format version." };
  }
  if (version > EXPORT_VERSION) {
    return {
      ok: false,
      error: `This file uses export format v${version}, which this version of the app cannot import.`,
    };
  }
  if (!Array.isArray(file.leads)) {
    return { ok: false, error: "The file has no list of leads." };
  }

  let invalid = 0;
  const entries: Lead[] = [];
  for (const entry of file.leads) {
    if (isStoredLead(entry)) entries.push(toLead(entry));
    else invalid++;
  }
  const { leads } = stampMissingDates(entries, now.toISOString());
  return {
    ok: true,
    leads,
    counter: isPositiveInteger(file.counter) ? file.counter : 0,
    invalid,
  };
}

// Non-destructive merge, matched by id: new leads are added, an existing lead
// is replaced only by a strictly newer updatedAt (keeping its local lead
// number), and everything else is kept as is. Nothing is ever deleted.
export function mergeImport(
  local: Lead[],
  incoming: Lead[],
  localCounter: number,
  fileCounter: number,
  invalid = 0,
): { leads: Lead[]; counter: number; summary: ImportSummary } {
  const byId = new Map(local.map((lead) => [lead.id, lead]));
  const used = new Set(local.map((lead) => lead.leadNumber));
  let counter = Math.max(
    localCounter,
    fileCounter,
    highestNumber(local),
    highestNumber(incoming),
  );

  // A file listing the same id twice contributes its newer copy.
  const unique = new Map<string, Lead>();
  for (const lead of incoming) {
    const seen = unique.get(lead.id);
    if (!seen || time(lead.updatedAt) > time(seen.updatedAt)) {
      unique.set(lead.id, lead);
    }
  }

  const summary: ImportSummary = {
    added: 0,
    updated: 0,
    keptLocal: 0,
    renumbered: 0,
    invalid,
  };

  const ordered = [...unique.values()].sort((a, b) => a.leadNumber - b.leadNumber);
  for (const lead of ordered) {
    const existing = byId.get(lead.id);
    if (!existing) {
      let leadNumber = lead.leadNumber;
      if (leadNumber <= 0 || used.has(leadNumber)) {
        leadNumber = ++counter;
        summary.renumbered++;
      }
      used.add(leadNumber);
      byId.set(lead.id, { ...lead, leadNumber });
      summary.added++;
    } else if (
      time(lead.updatedAt) > time(existing.updatedAt ?? existing.createdAt)
    ) {
      byId.set(lead.id, {
        ...lead,
        leadNumber: existing.leadNumber,
        createdAt: existing.createdAt ?? lead.createdAt,
      });
      summary.updated++;
    } else {
      summary.keptLocal++;
    }
  }

  // Newest first, matching the order the create flow produces.
  const leads = [...byId.values()].sort((a, b) => b.leadNumber - a.leadNumber);
  return { leads, counter: Math.max(counter, highestNumber(leads)), summary };
}

export function formatImportSummary(summary: ImportSummary): string {
  const parts = [
    `${summary.added} new`,
    `${summary.updated} updated`,
    `${summary.keptLocal} kept (local copy unchanged or newer)`,
  ];
  if (summary.renumbered > 0) parts.push(`${summary.renumbered} renumbered`);
  if (summary.invalid > 0) parts.push(`${summary.invalid} invalid skipped`);
  return `Import complete: ${parts.join(", ")}.`;
}
