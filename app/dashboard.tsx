"use client";

import Link from "next/link";
import { useLeads } from "@/hooks/useLeads";
import { computeDashboard } from "@/lib/dashboard";

const numberFormat = new Intl.NumberFormat("en-US");

const cardClass =
  "min-w-0 rounded-md border border-zinc-200 p-4 dark:border-zinc-800";

export function Dashboard() {
  const { leads, isLoaded } = useLeads();
  const stats = computeDashboard(leads);

  const cards = [
    {
      label: "Target companies",
      value: stats.targetCompanies,
      note: "Total leads",
    },
    {
      label: "Managed units",
      value: stats.managedUnits,
      note: "Across all leads",
    },
    {
      label: "Ready for Qualification",
      value: stats.readyForQualification,
      note: "Sales review ready",
    },
    {
      // Non-breaking hyphen keeps "re-export" on one line when the label wraps.
      label: "Need export / re\u2011export",
      value: stats.needExport,
      note: "New or changed since export",
    },
  ];

  return (
    <div className="space-y-3">
      <section aria-label="Key figures" aria-busy={!isLoaded}>
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {cards.map((card) => (
            <div key={card.label} className={cardClass}>
              <dt className="text-sm font-medium md:min-h-10">{card.label}</dt>
              {/* Until localStorage is read, show a dash instead of a false 0. */}
              <dd className="mt-2 text-3xl font-semibold tabular-nums tracking-tight">
                {isLoaded ? numberFormat.format(card.value) : "–"}
              </dd>
              <dd className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                {card.note}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-3 md:grid-cols-2">
        <section aria-labelledby="research-progress" className={cardClass}>
          <h2 id="research-progress" className="text-base font-semibold">
            Research progress
          </h2>
          <ul className="mt-4 space-y-4">
            {stats.researchProgress.map(({ status, count, percent }) => (
              <li key={status}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="min-w-0">{status}</span>
                  {/* Dashes until localStorage is read, never a false 0. */}
                  <span className="shrink-0 tabular-nums">
                    <span className="font-medium">
                      {isLoaded ? numberFormat.format(count) : "–"}
                    </span>{" "}
                    <span className="ml-2 inline-block w-10 text-right text-zinc-600 dark:text-zinc-400">
                      {isLoaded ? `${percent}%` : "–"}
                    </span>
                  </span>
                </div>
                {/* Decorative: the numbers above carry the information. */}
                <div
                  aria-hidden="true"
                  className="mt-1.5 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-800"
                >
                  <div
                    className="h-full rounded-full bg-blue-700 dark:bg-blue-500"
                    style={{ width: isLoaded ? `${percent}%` : "0%" }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="needs-attention" className={cardClass}>
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="needs-attention" className="text-base font-semibold">
              Needs attention
            </h2>
            <Link
              href="/leads"
              className="-my-2 shrink-0 py-2 text-sm text-blue-700 hover:underline dark:text-blue-400"
            >
              View all leads
            </Link>
          </div>
          {isLoaded &&
            (stats.needsAttention.length === 0 ? (
              <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
                Nothing needs attention right now.
              </p>
            ) : (
              <ul className="mt-2 divide-y divide-zinc-200 dark:divide-zinc-800">
                {stats.needsAttention.map((item) => (
                  <li key={item.id}>
                    <Link
                      href={`/leads/${item.id}`}
                      className="-mx-2 block rounded-md px-2 py-2.5 hover:bg-zinc-100 focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-blue-600 dark:hover:bg-zinc-900"
                    >
                      <span className="flex min-w-0 items-baseline gap-3">
                        <span className="shrink-0 text-sm tabular-nums text-zinc-500">
                          #{item.leadNumber}
                        </span>
                        <span className="min-w-0 break-words text-base font-medium text-blue-700 md:text-sm dark:text-blue-400">
                          {item.companyName}
                        </span>
                      </span>
                      <span className="mt-0.5 block text-xs text-zinc-600 dark:text-zinc-400">
                        {item.reason}
                        {item.city && ` · ${item.city}`}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ))}
        </section>
      </div>
    </div>
  );
}
