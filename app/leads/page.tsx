import type { Metadata } from "next";
import { SkylineBanner } from "@/components/SkylineBanner";
import { LeadList } from "./lead-list";

export const metadata: Metadata = {
  title: "Leads · Cold Lead Intake",
};

export default function Page() {
  return (
    <>
      <header className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6 sm:pt-8">
        <SkylineBanner variant="strip" />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">Leads</h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Capture and prepare property management target companies for
          qualification.
        </p>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-10 pt-6 sm:px-6 sm:pb-16">
        <LeadList />
      </main>
    </>
  );
}
