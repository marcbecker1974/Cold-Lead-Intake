import type { Metadata } from "next";
import Image from "next/image";
import { LeadList } from "./lead-list";

export const metadata: Metadata = {
  title: "Cold Lead Intake",
};

export default function Page() {
  return (
    <>
      <header className="mx-auto w-full max-w-3xl px-4 pt-6 sm:px-6 sm:pt-10">
        {/* Banner: the skyline image with the page title over its sky area.
            The image is light in both color schemes, so the title stays dark.
            The mask fades the bottom edge into the page background. */}
        <div className="relative aspect-[8/3] overflow-hidden rounded-md">
          <Image
            src="/images/cold-lead-intake-header.png"
            alt=""
            fill
            sizes="(min-width: 768px) 720px, 100vw"
            preload
            className="object-cover [mask-image:linear-gradient(to_bottom,black_70%,transparent)]"
          />
          <h1 className="absolute left-4 top-3 text-2xl font-semibold tracking-tight text-zinc-900 sm:left-6 sm:top-6">
            Cold Lead Intake
          </h1>
        </div>
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
          Capture and prepare property management target companies for
          qualification.
        </p>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-10 pt-8 sm:px-6 sm:pb-16">
        <LeadList />
      </main>
    </>
  );
}
