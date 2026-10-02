import type { Metadata } from "next";
import { LeadList } from "./lead-list";

export const metadata: Metadata = {
  title: "Cold Lead Intake",
};

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-16">
      <h1 className="text-2xl font-semibold tracking-tight">
        Cold Lead Intake
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Capture and prepare property management target companies for
        qualification.
      </p>
      <div className="mt-8">
        <LeadList />
      </div>
    </main>
  );
}
