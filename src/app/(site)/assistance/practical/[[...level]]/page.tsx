import type { Metadata } from "next";

import { AssistanceCategoryPage } from "@/components/assistance/assistance-category-page";
import { PRACTICAL_CATEGORY } from "@/components/assistance/categories";

export const metadata: Metadata = {
  title: "Practical & Lab Assistance",
  description:
    "Lab reports, experiment write-ups, circuit analysis and handwritten practical notebooks delivered by verified campus helpers with escrow protection.",
  alternates: { canonical: "/assistance/practical" },
};

/**
 * Optional catch-all so the whole practical branch — `/assistance/practical`,
 * `/assistance/practical/ssc` and deeper paths such as
 * `/assistance/practical/ssc/science` — resolves to this one real page instead
 * of falling through to the 404 page or being swallowed by `/assistance/[id]`.
 */
export default async function PracticalAssistancePage({
  params,
}: {
  params: Promise<{ level?: string[] }>;
}) {
  const { level } = await params;
  return (
    <AssistanceCategoryPage
      config={PRACTICAL_CATEGORY}
      levelSegments={level ?? []}
    />
  );
}
