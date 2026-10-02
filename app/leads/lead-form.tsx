"use client";

import { useId, useState, type FormEvent, type ReactNode } from "react";
import {
  FEDERAL_STATES,
  LEAD_SOURCES,
  MANAGEMENT_TYPES,
  OWNERSHIP_STRUCTURES,
  RESEARCH_STATUSES,
  type FederalState,
  type Lead,
  type LeadSource,
  type ManagementType,
  type OwnershipStructure,
  type ResearchStatus,
} from "@/lib/lead";

type LeadFormProps = {
  onSave: (lead: Lead) => void;
  onCancel: () => void;
};

const controlClass =
  "w-full rounded-md border border-zinc-300 bg-background px-3 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-blue-600 dark:border-zinc-700";
const buttonClass =
  "rounded-md px-3 py-1.5 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";

function Field({
  label,
  htmlFor,
  error,
  errorId,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  errorId?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p id={errorId} className="mt-1 text-sm text-red-700 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

function Options({ values }: { values: readonly string[] }) {
  return values.map((value) => (
    <option key={value} value={value}>
      {value}
    </option>
  ));
}

export function LeadForm({ onSave, onCancel }: LeadFormProps) {
  const id = useId();
  const [companyName, setCompanyName] = useState("");
  const [website, setWebsite] = useState("");
  const [managementType, setManagementType] = useState("");
  const [managedUnits, setManagedUnits] = useState("");
  const [city, setCity] = useState("");
  const [federalState, setFederalState] = useState("");
  const [ownershipStructure, setOwnershipStructure] = useState("");
  const [source, setSource] = useState("");
  const [researchStatus, setResearchStatus] = useState<ResearchStatus>("New");
  const [notes, setNotes] = useState("");
  const [nameError, setNameError] = useState("");
  const [unitsError, setUnitsError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = companyName.trim();
    const units = managedUnits.trim();
    const unitsValue = Number(units);
    const nextNameError = name ? "" : "Company name is required.";
    const nextUnitsError =
      units === "" || (Number.isInteger(unitsValue) && unitsValue >= 0)
        ? ""
        : "Managed units must be a whole number of 0 or more.";
    setNameError(nextNameError);
    setUnitsError(nextUnitsError);
    if (nextNameError || nextUnitsError) return;

    // Empty optional fields are omitted rather than stored as "".
    const lead: Lead = {
      id: crypto.randomUUID(),
      companyName: name,
      researchStatus,
    };
    if (website.trim()) lead.website = website.trim();
    if (managementType) lead.managementType = managementType as ManagementType;
    if (units !== "") lead.managedUnits = unitsValue;
    if (city.trim()) lead.city = city.trim();
    if (federalState) lead.federalState = federalState as FederalState;
    if (ownershipStructure) {
      lead.ownershipStructure = ownershipStructure as OwnershipStructure;
    }
    if (source) lead.source = source as LeadSource;
    if (notes.trim()) lead.notes = notes.trim();

    onSave(lead);
  }

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      aria-label="Add lead"
      className="rounded-md border border-zinc-200 p-4 dark:border-zinc-800"
    >
      <h2 className="text-base font-semibold">Add lead</h2>

      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field
          label="Company name (required)"
          htmlFor={`${id}-name`}
          error={nameError}
          errorId={`${id}-name-error`}
        >
          <input
            id={`${id}-name`}
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            aria-invalid={nameError ? true : undefined}
            aria-describedby={nameError ? `${id}-name-error` : undefined}
            className={controlClass}
          />
        </Field>

        <Field label="Website" htmlFor={`${id}-website`}>
          <input
            id={`${id}-website`}
            type="text"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            className={controlClass}
          />
        </Field>

        <Field label="Management type" htmlFor={`${id}-management`}>
          <select
            id={`${id}-management`}
            value={managementType}
            onChange={(e) => setManagementType(e.target.value)}
            className={controlClass}
          >
            <option value="">Not specified</option>
            <Options values={MANAGEMENT_TYPES} />
          </select>
        </Field>

        <Field
          label="Managed units"
          htmlFor={`${id}-units`}
          error={unitsError}
          errorId={`${id}-units-error`}
        >
          <input
            id={`${id}-units`}
            type="number"
            min={0}
            step={1}
            value={managedUnits}
            onChange={(e) => setManagedUnits(e.target.value)}
            aria-invalid={unitsError ? true : undefined}
            aria-describedby={unitsError ? `${id}-units-error` : undefined}
            className={controlClass}
          />
        </Field>

        <Field label="City" htmlFor={`${id}-city`}>
          <input
            id={`${id}-city`}
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={controlClass}
          />
        </Field>

        <Field label="Federal state" htmlFor={`${id}-state`}>
          <select
            id={`${id}-state`}
            value={federalState}
            onChange={(e) => setFederalState(e.target.value)}
            className={controlClass}
          >
            <option value="">Not specified</option>
            <Options values={FEDERAL_STATES} />
          </select>
        </Field>

        <Field label="Ownership structure" htmlFor={`${id}-ownership`}>
          <select
            id={`${id}-ownership`}
            value={ownershipStructure}
            onChange={(e) => setOwnershipStructure(e.target.value)}
            className={controlClass}
          >
            <option value="">Not specified</option>
            <Options values={OWNERSHIP_STRUCTURES} />
          </select>
        </Field>

        <Field label="Source" htmlFor={`${id}-source`}>
          <select
            id={`${id}-source`}
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className={controlClass}
          >
            <option value="">Not specified</option>
            <Options values={LEAD_SOURCES} />
          </select>
        </Field>

        <Field label="Research status" htmlFor={`${id}-status`}>
          <select
            id={`${id}-status`}
            value={researchStatus}
            onChange={(e) => setResearchStatus(e.target.value as ResearchStatus)}
            className={controlClass}
          >
            <Options values={RESEARCH_STATUSES} />
          </select>
        </Field>

        <Field label="Notes" htmlFor={`${id}-notes`} className="md:col-span-2">
          <textarea
            id={`${id}-notes`}
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={controlClass}
          />
        </Field>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          className={`${buttonClass} bg-emerald-700 text-white hover:bg-emerald-800`}
        >
          Save lead
        </button>
        <button
          type="button"
          onClick={onCancel}
          className={`${buttonClass} border border-zinc-300 hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900`}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
