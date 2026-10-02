// All localStorage access lives here. See docs/persistence-decision.md.
// Browser-only: call from Client Components, after mount.

export type Lead = {
  id: string;
  companyName: string;
  notes: string;
  createdAt: string;
};

const STORAGE_KEY = "cold-leads:v1";

export function loadLeads(): Lead[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Lead[]) : [];
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
