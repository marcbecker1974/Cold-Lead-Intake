// All localStorage access lives here. See docs/persistence-decision.md.
// Browser-only: call from Client Components, after mount.

import {
  FEDERAL_STATES,
  LEAD_SOURCES,
  MANAGEMENT_TYPES,
  OWNERSHIP_STRUCTURES,
  RESEARCH_STATUSES,
  type Lead,
} from "@/lib/lead";

const STORAGE_KEY = "cold-leads:v1";

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isOneOf(values: readonly string[], value: unknown): boolean {
  return isString(value) && values.includes(value);
}

// An optional field is valid when absent or when it passes its check.
function isOptional(value: unknown, check: (value: unknown) => boolean) {
  return value === undefined || check(value);
}

// Checks a stored entry against the current Lead model and allowed values.
function isLead(value: unknown): value is Lead {
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
    isOptional(lead.notes, isString)
  );
}

export function loadLeads(): Lead[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    // Entries that don't match the Lead model are ignored.
    return Array.isArray(parsed) ? parsed.filter(isLead) : [];
  } catch {
    return [];
  }
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
