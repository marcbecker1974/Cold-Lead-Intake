// All localStorage access lives here. See docs/persistence-decision.md.
// Browser-only: call from Client Components, after mount.

import {
  FEDERAL_STATES,
  LEAD_SOURCES,
  MANAGEMENT_TYPES,
  OWNERSHIP_STRUCTURES,
  RESEARCH_STATUSES,
  type Lead,
  type LeadDraft,
} from "@/lib/lead";

const STORAGE_KEY = "cold-leads:v1";
// Highest lead number ever handed out, so numbers are never reused.
const COUNTER_KEY = "cold-leads:counter:v1";

// A stored entry whose leadNumber has not been checked or assigned yet.
export type StoredLead = LeadDraft & {
  leadNumber?: unknown;
  createdAt?: string;
  updatedAt?: string;
  exportedAt?: string;
};

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isOneOf(values: readonly string[], value: unknown): boolean {
  return isString(value) && values.includes(value);
}

export function isPositiveInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value > 0;
}

export function isValidDate(value: unknown): value is string {
  return isString(value) && !Number.isNaN(new Date(value).getTime());
}

// An optional field is valid when absent or when it passes its check.
function isOptional(value: unknown, check: (value: unknown) => boolean) {
  return value === undefined || check(value);
}

// Checks a stored entry against the Lead model and allowed values.
// leadNumber is handled separately so older records can be migrated.
export function isStoredLead(value: unknown): value is StoredLead {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }
  const lead = value as Record<string, unknown>;
  return (
    isString(lead.id) &&
    lead.id !== "" &&
    isString(lead.companyName) &&
    lead.companyName.trim() !== "" &&
    isOneOf(RESEARCH_STATUSES, lead.researchStatus) &&
    isOptional(lead.website, isString) &&
    isOptional(lead.managementType, (v) => isOneOf(MANAGEMENT_TYPES, v)) &&
    isOptional(lead.managedUnits, (v) => typeof v === "number" && Number.isFinite(v)) &&
    isOptional(lead.city, isString) &&
    isOptional(lead.federalState, (v) => isOneOf(FEDERAL_STATES, v)) &&
    isOptional(lead.ownershipStructure, (v) => isOneOf(OWNERSHIP_STRUCTURES, v)) &&
    isOptional(lead.source, (v) => isOneOf(LEAD_SOURCES, v)) &&
    isOptional(lead.notes, isString) &&
    isOptional(lead.createdAt, isString) &&
    isOptional(lead.updatedAt, isString) &&
    isOptional(lead.exportedAt, isString)
  );
}

export function readLeadCounter(): number {
  try {
    const value = Number(window.localStorage.getItem(COUNTER_KEY));
    return isPositiveInteger(value) ? value : 0;
  } catch {
    return 0;
  }
}

export function writeLeadCounter(value: number): void {
  try {
    window.localStorage.setItem(COUNTER_KEY, String(value));
  } catch {
    // Same failure mode as saveLeads; the lead write reports it.
  }
}

// Keeps valid, unique lead numbers and assigns the rest, oldest first.
// Stored order is newest-first (the create flow prepends), so the last
// entry is the oldest. Returns the leads and whether any were assigned.
function assignLeadNumbers(entries: StoredLead[]) {
  const used = new Set<number>();
  const numbers = entries.map((entry) => {
    const n = entry.leadNumber;
    if (!isPositiveInteger(n) || used.has(n)) return undefined;
    used.add(n);
    return n;
  });

  let highest = Math.max(0, readLeadCounter(), ...used);
  let changed = false;
  for (let i = entries.length - 1; i >= 0; i--) {
    if (numbers[i] === undefined) {
      numbers[i] = ++highest;
      changed = true;
    }
  }

  const leads = entries.map(
    (entry, i): Lead => ({ ...entry, leadNumber: numbers[i] as number }),
  );
  return { leads, highest, changed };
}

// Leads saved before creation dates existed (or with an unreadable one) are
// stamped once with the current time, i.e. the date they were first seen.
// A missing updatedAt becomes createdAt, and an unreadable exportedAt is
// dropped. Returns the leads and whether any were changed.
export function stampMissingDates(leads: Lead[], now: string) {
  let changed = false;
  const stamped = leads.map((lead) => {
    const createdAt = isValidDate(lead.createdAt) ? lead.createdAt : now;
    const updatedAt = isValidDate(lead.updatedAt) ? lead.updatedAt : createdAt;
    const hasBadExportedAt =
      lead.exportedAt !== undefined && !isValidDate(lead.exportedAt);
    if (
      createdAt === lead.createdAt &&
      updatedAt === lead.updatedAt &&
      !hasBadExportedAt
    ) {
      return lead;
    }
    changed = true;
    const next: Lead = { ...lead, createdAt, updatedAt };
    if (hasBadExportedAt) delete next.exportedAt;
    return next;
  });
  return { leads: stamped, changed };
}

export function loadLeads(): Lead[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    // Entries that don't match the Lead model are ignored.
    const entries = Array.isArray(parsed) ? parsed.filter(isStoredLead) : [];
    const numbered = assignLeadNumbers(entries);
    const stamped = stampMissingDates(numbered.leads, new Date().toISOString());
    // Persist numbers and dates assigned to older records so they stay stable.
    if (
      (numbered.changed || stamped.changed) &&
      saveLeads(stamped.leads)
    ) {
      writeLeadCounter(numbered.highest);
    }
    return stamped.leads;
  } catch {
    return [];
  }
}

// Returns the next lead number and records it so it is never reused,
// even after the lead holding it is deleted.
export function reserveLeadNumber(leads: Lead[]): number {
  const next =
    Math.max(0, readLeadCounter(), ...leads.map((lead) => lead.leadNumber)) + 1;
  writeLeadCounter(next);
  return next;
}

// Returns false if the write failed (e.g. quota exceeded, storage blocked).
export function saveLeads(leads: Lead[]): boolean {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(leads));
    return true;
  } catch {
    return false;
  }
}
