import type { Metadata } from "next";
import Link from "next/link";
import { SkylineBanner } from "@/components/SkylineBanner";
import { Dashboard } from "./dashboard";

export const metadata: Metadata = {
  title: "Home · Cold Lead Intake",
};

const actionClass =
  "rounded-md border px-4 py-2.5 text-center text-base font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 md:py-1.5 md:text-sm";

export default function Home() {
  return (
    <>
      <header className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6 sm:pt-10">
        <SkylineBanner variant="hero" />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight">
          Property management target research &amp; qualification
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Capture target companies, enrich them, and prepare them for
          qualification.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href="/leads"
            className={`${actionClass} border-blue-700 bg-blue-700 text-white hover:bg-blue-800`}
          >
            Leads
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-10 pt-8 sm:px-6 sm:pb-16">
        <Dashboard />
      </main>
    </>
  );
}
