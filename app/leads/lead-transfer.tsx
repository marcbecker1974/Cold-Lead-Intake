"use client";

import { useRef, type ChangeEvent } from "react";
import type { Lead } from "@/lib/lead";
import { readLeadCounter, saveLeads, writeLeadCounter } from "@/lib/storage";
import {
  buildExport,
  exportFileName,
  formatImportSummary,
  mergeImport,
  parseImport,
} from "@/lib/transfer";

export type TransferMessage = { kind: "success" | "error"; text: string };

type LeadTransferProps = {
  leads: Lead[];
  setLeads: (next: Lead[]) => void;
  onMessage: (message: TransferMessage | null) => void;
};

const buttonClass =
  "rounded-md border border-zinc-300 px-3 py-2.5 text-base font-medium hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent md:py-1 md:text-sm dark:border-zinc-700 dark:hover:bg-zinc-900 dark:disabled:hover:bg-transparent";

export function LeadTransfer({ leads, setLeads, onMessage }: LeadTransferProps) {
  const fileInput = useRef<HTMLInputElement>(null);

  function handleExport() {
    const now = new Date();
    const { file, leads: stamped } = buildExport(leads, readLeadCounter(), now);
    const fileName = exportFileName(now);

    const url = URL.createObjectURL(
      new Blob([JSON.stringify(file, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    // Keep every lead; only mark them as exported.
    setLeads(stamped);
    onMessage({
      kind: "success",
      text: `Exported ${stamped.length} ${stamped.length === 1 ? "lead" : "leads"} to ${fileName}.`,
    });
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target;
    const file = input.files?.[0];
    input.value = ""; // allow choosing the same file again
    if (!file) return;

    const parsed = parseImport(await file.text());
    if (!parsed.ok) {
      onMessage({ kind: "error", text: parsed.error });
      return;
    }

    const merged = mergeImport(
      leads,
      parsed.leads,
      readLeadCounter(),
      parsed.counter,
      parsed.invalid,
    );
    // Save before touching state so a failed write imports nothing.
    if (!saveLeads(merged.leads)) {
      onMessage({
        kind: "error",
        text: "Could not save the imported leads to browser storage. Nothing was imported.",
      });
      return;
    }
    writeLeadCounter(merged.counter);
    setLeads(merged.leads);
    onMessage({ kind: "success", text: formatImportSummary(merged.summary) });
  }

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={handleExport}
        disabled={leads.length === 0}
        className={buttonClass}
      >
        Export JSON
      </button>
      <button
        type="button"
        onClick={() => fileInput.current?.click()}
        className={buttonClass}
      >
        Import JSON
      </button>
      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        onChange={handleFile}
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  );
}
