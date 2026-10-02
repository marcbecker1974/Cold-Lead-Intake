# Persistence Decision

## Decision

Use browser `localStorage` to persist cold leads.

## Context

- Next.js App Router, TypeScript, Tailwind CSS
- Single user, no accounts, no backend
- A small list of structured cold leads
- Data must survive a full page reload
- The app runs locally in the browser for this sprint

## Why localStorage

- Meets the requirement: data survives reloads and browser restarts.
- Simplest option: built into the browser, no new dependencies
  (CLAUDE.md requires asking before adding libraries).
- Sufficient capacity: about 5 MB per origin is far more than a small
  list of leads needs.
- Synchronous API keeps state handling simple.
- Alternatives are overkill: IndexedDB adds complexity for large data,
  queries, and async writes that this app does not need.

## Accepted limitations

- Data lives only in one browser on one device. No sync or sharing.
- Data can be lost if the user clears site data or the browser's privacy
  settings clear it.
- Storage is limited to about 5 MB, and writes can fail when the quota is
  exceeded.
- Values are strings only, so data is stored as JSON.
- No querying or indexing. Filtering and sorting happen in memory.
- Two open tabs can overwrite each other's changes.

## Implementation guidelines (for later)

- Read and write only in Client Components, after mount, to avoid
  server-render and hydration errors.
- Keep all storage access in one small module so the backend can be
  swapped later.
- Parse defensively: fall back to an empty list on missing or corrupt data.
- Version the storage key, for example `cold-leads:v1`.
- Handle write errors such as quota exceeded.

## Lead numbers

Each lead has a sequential, human-readable `leadNumber` (shown as `#12`) in
addition to its technical UUID `id`, which stays internal and is used in the
URL.

- The highest number ever assigned is stored under `cold-leads:counter:v1`,
  so a number is never reused after its lead is deleted. If the counter is
  missing, the next number is derived from the existing leads.
- Records stored without a valid or unique `leadNumber` are numbered on load,
  oldest first (stored order is newest first), and written back. The leads
  key stays `cold-leads:v1`.

## Creation date

New leads store `createdAt` (an ISO timestamp), and the UI shows the date (DD.MM.YY)
and the age in whole calendar days. Leads saved before this existed had no
real creation date, so on first load they are stamped once with that day's
date (when they were first seen) and the value is written back; their age
counts up from there. Edits keep `createdAt`.

## When to revisit

Move to IndexedDB or a backend if the app needs large data, attachments,
indexed search over many records, multiple devices, or multiple users.
