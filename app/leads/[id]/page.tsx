import type { Metadata } from "next";
import { LeadDetail } from "./lead-detail";

export const metadata: Metadata = {
  title: "Cold Lead Intake",
};

export default async function Page({ params }: PageProps<"/leads/[id]">) {
  const { id } = await params;

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-16">
      <LeadDetail id={id} />
    </main>
  );
}
