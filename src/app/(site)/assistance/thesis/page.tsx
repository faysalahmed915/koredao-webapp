import type { Metadata } from "next";

import { AssistanceCategoryPage } from "@/components/assistance/assistance-category-page";
import { THESIS_CATEGORY } from "@/components/assistance/categories";

export const metadata: Metadata = {
  title: "Thesis & Dissertation Assistance",
  description:
    "Chapter-by-chapter thesis support: proposal, literature review, methodology, analysis, formatting and defence preparation.",
  alternates: { canonical: "/assistance/thesis" },
};

export default function ThesisAssistancePage() {
  return <AssistanceCategoryPage config={THESIS_CATEGORY} levelSegments={[]} />;
}
