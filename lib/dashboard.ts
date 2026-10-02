// Pure dashboard numbers, derived from the leads on every render and never
// stored. No browser APIs.

import { getExportStatus, type Lead } from "@/lib/lead";

export type DashboardStats = {
  targetCompanies: number;
  managedUnits: number;
  readyForQualification: number;
  needExport: number;
};

export function computeDashboard(leads: Lead[]): DashboardStats {
  let managedUnits = 0;
  let readyForQualification = 0;
  let needExport = 0;

  for (const lead of leads) {
    // Missing or invalid managed units contribute 0.
    if (Number.isFinite(lead.managedUnits) && (lead.managedUnits as number) > 0) {
      managedUnits += lead.managedUnits as number;
    }
    if (lead.researchStatus === "Ready for Qualification") {
      readyForQualification += 1;
    }
    if (getExportStatus(lead) !== "exported") needExport += 1;
  }

  return {
    targetCompanies: leads.length,
    managedUnits,
    readyForQualification,
    needExport,
  };
}
