// Canonical Lead model. Types only, serializable (strings and numbers),
// so leads can be stored as JSON. Optional fields are omitted when empty.

export const RESEARCH_STATUSES = [
  "New",
  "Enriched",
  "Ready for Qualification",
] as const;
export type ResearchStatus = (typeof RESEARCH_STATUSES)[number];

export const MANAGEMENT_TYPES = [
  "WEG Management",
  "Rental Management",
  "Both",
] as const;
export type ManagementType = (typeof MANAGEMENT_TYPES)[number];

export const OWNERSHIP_STRUCTURES = [
  "Founder / Family-owned",
  "Management-owned",
  "Corporate Group",
  "Private Equity",
  "Unknown",
] as const;
export type OwnershipStructure = (typeof OWNERSHIP_STRUCTURES)[number];

export const LEAD_SOURCES = [
  "Web Research",
  "LinkedIn",
  "Industry Association",
  "Referral",
  "Existing Network",
  "Other",
] as const;
export type LeadSource = (typeof LEAD_SOURCES)[number];

export const FEDERAL_STATES = [
  "Baden-Württemberg",
  "Bayern",
  "Berlin",
  "Brandenburg",
  "Bremen",
  "Hamburg",
  "Hessen",
  "Mecklenburg-Vorpommern",
  "Niedersachsen",
  "Nordrhein-Westfalen",
  "Rheinland-Pfalz",
  "Saarland",
  "Sachsen",
  "Sachsen-Anhalt",
  "Schleswig-Holstein",
  "Thüringen",
] as const;
export type FederalState = (typeof FEDERAL_STATES)[number];

export type Lead = {
  id: string; // technical UUID, internal; used in the URL
  leadNumber: number; // sequential, human-readable, never reused
  createdAt?: string; // ISO timestamp; older leads are stamped when first loaded
  updatedAt?: string; // ISO timestamp of the last edit; equals createdAt until edited
  exportedAt?: string; // ISO timestamp of the last export that included this lead
  companyName: string;
  researchStatus: ResearchStatus;
  website?: string;
  managementType?: ManagementType;
  managedUnits?: number;
  city?: string;
  federalState?: FederalState;
  ownershipStructure?: OwnershipStructure;
  source?: LeadSource;
  notes?: string;
};

// A lead before the app has assigned its number and timestamps.
export type LeadDraft = Omit<
  Lead,
  "leadNumber" | "createdAt" | "updatedAt" | "exportedAt"
>;

// The fields a user edits in the form. Timestamps, id and leadNumber are not
// business fields and never count as a change.
const BUSINESS_FIELDS = [
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
] as const satisfies readonly (keyof LeadDraft)[];

// True if any business field differs. An omitted optional field equals an
// absent one, so clearing a field or filling an empty one is a change.
export function hasBusinessChanges(existing: LeadDraft, next: LeadDraft): boolean {
  return BUSINESS_FIELDS.some((key) => existing[key] !== next[key]);
}

export type ExportStatus =
  | "not-exported"
  | "exported"
  | "modified-since-export";

// Derived, never stored: exportedAt says whether a lead was ever exported,
// and an updatedAt after it means the lead changed since.
export function getExportStatus(
  lead: Pick<Lead, "exportedAt" | "updatedAt">,
): ExportStatus {
  if (!lead.exportedAt) return "not-exported";
  const exported = Date.parse(lead.exportedAt);
  const updated = lead.updatedAt ? Date.parse(lead.updatedAt) : NaN;
  return updated > exported ? "modified-since-export" : "exported";
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Whole calendar days (local time) from createdAt to today, or null if the
// lead has no valid creation date. Midnight-to-midnight, so a lead created
// late yesterday is already 1 day old.
export function daysSinceCreated(
  createdAt: string | undefined,
  now: Date = new Date(),
): number | null {
  if (!createdAt) return null;
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return null;
  const startOfDay = (d: Date) =>
    new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  // Rounding absorbs the 23/25-hour days around daylight saving changes.
  const days = Math.round((startOfDay(now) - startOfDay(created)) / MS_PER_DAY);
  return Math.max(0, days);
}

// The creation date as DD.MM.YY in local time, or null if unknown.
export function formatCreatedDate(createdAt: string | undefined): string | null {
  if (!createdAt) return null;
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) return null;
  const two = (n: number) => String(n).padStart(2, "0");
  return `${two(created.getDate())}.${two(created.getMonth() + 1)}.${two(created.getFullYear() % 100)}`;
}

// "Created 02.10.26 · 3 days ago" (0, 1, 2, ... days), or null if unknown.
export function formatCreated(createdAt: string | undefined): string | null {
  const date = formatCreatedDate(createdAt);
  const days = daysSinceCreated(createdAt);
  if (date === null || days === null) return null;
  return `Created ${date} · ${days} ${days === 1 ? "day" : "days"} ago`;
}
