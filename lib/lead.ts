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
  id: string;
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
