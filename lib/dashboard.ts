// Pure dashboard numbers, derived from the leads on every render and never
// stored. No browser APIs.

import {
  RESEARCH_STATUSES,
  daysSinceCreated,
  getExportStatus,
  type Lead,
  type ResearchStatus,
} from "@/lib/lead";

// A "New" lead this many days old (or older) needs a follow-up.
export const STALE_NEW_DAYS = 7;
// The attention list shows at most this many leads.
export const MAX_ATTENTION_LEADS = 5;

export type StatusProgress = {
  status: ResearchStatus;
  count: number;
  percent: number; // whole percent of all leads; 0 when there are no leads
};

export type AttentionItem = {
  id: string;
  leadNumber: number;
  companyName: string;
  city?: string;
  reason: string; // the single most important reason
};

export type DashboardStats = {
  targetCompanies: number;
  managedUnits: number;
  readyForQualification: number;
  needExport: number;
  researchProgress: StatusProgress[]; // one entry per status, in model order
  needsAttention: AttentionItem[]; // prioritized, at most MAX_ATTENTION_LEADS
};

// The key fields a lead should have, with the wording used in the reason.
// Notes, source and website are optional and never count as missing.
const KEY_FIELDS = [
  { missing: (l: Lead) => !Number.isFinite(l.managedUnits), label: "managed units" },
  { missing: (l: Lead) => !l.federalState, label: "federal state" },
  { missing: (l: Lead) => !l.managementType, label: "management type" },
  { missing: (l: Lead) => !l.ownershipStructure, label: "ownership" },
];

// Lower number = higher priority. A lead with exactly one missing field
// still needs attention, but ranks after the three listed priorities.
const PRIORITY = { manyMissing: 1, modified: 2, staleNew: 3, oneMissing: 4 };

type Candidate = { item: AttentionItem; priority: number; created: number };

function attentionCandidate(lead: Lead, now: Date): Candidate | null {
  const missing = KEY_FIELDS.filter((f) => f.missing(lead));
  const age = daysSinceCreated(lead.createdAt, now);

  let priority: number;
  let reason: string;
  if (missing.length >= 2) {
    priority = PRIORITY.manyMissing;
    reason = `Missing ${missing.length} fields`;
  } else if (getExportStatus(lead) === "modified-since-export") {
    priority = PRIORITY.modified;
    reason = "Modified since export";
  } else if (
    lead.researchStatus === "New" &&
    age !== null &&
    age >= STALE_NEW_DAYS
  ) {
    priority = PRIORITY.staleNew;
    reason = `New for ${age} days`;
  } else if (missing.length === 1) {
    priority = PRIORITY.oneMissing;
    reason = `Missing ${missing[0].label}`;
  } else {
    return null;
  }

  const created = Date.parse(lead.createdAt ?? "");
  return {
    item: {
      id: lead.id,
      leadNumber: lead.leadNumber,
      companyName: lead.companyName,
      ...(lead.city && { city: lead.city }),
      reason,
    },
    priority,
    // A lead without a readable creation date counts as newest.
    created: Number.isNaN(created) ? Infinity : created,
  };
}

// `now` is a parameter so the age-based rule can be tested.
export function computeDashboard(
  leads: Lead[],
  now: Date = new Date(),
): DashboardStats {
  let managedUnits = 0;
  let readyForQualification = 0;
  let needExport = 0;
  const counts = new Map<ResearchStatus, number>();

  for (const lead of leads) {
    // Missing or invalid managed units contribute 0.
    if (Number.isFinite(lead.managedUnits) && (lead.managedUnits as number) > 0) {
      managedUnits += lead.managedUnits as number;
    }
    if (lead.researchStatus === "Ready for Qualification") {
      readyForQualification += 1;
    }
    if (getExportStatus(lead) !== "exported") needExport += 1;
    counts.set(lead.researchStatus, (counts.get(lead.researchStatus) ?? 0) + 1);
  }

  const researchProgress = RESEARCH_STATUSES.map((status) => {
    const count = counts.get(status) ?? 0;
    return {
      status,
      count,
      percent: leads.length === 0 ? 0 : Math.round((count / leads.length) * 100),
    };
  });

  // Priority first, then the oldest lead; the lead number breaks exact ties.
  const needsAttention = leads
    .map((lead) => attentionCandidate(lead, now))
    .filter((c): c is Candidate => c !== null)
    .sort(
      (a, b) =>
        a.priority - b.priority ||
        (a.created === b.created ? 0 : a.created < b.created ? -1 : 1) ||
        a.item.leadNumber - b.item.leadNumber,
    )
    .slice(0, MAX_ATTENTION_LEADS)
    .map((c) => c.item);

  return {
    targetCompanies: leads.length,
    managedUnits,
    readyForQualification,
    needExport,
    researchProgress,
    needsAttention,
  };
}
