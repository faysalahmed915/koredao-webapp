import type { Metadata } from "next";

import { MarketplaceCategoryPage } from "@/components/assistance/marketplace-category-page";
import { RESEARCH_THESIS_CATEGORY } from "@/config/marketplace/categories/research-thesis";

export const metadata: Metadata = {
  title: "Research & Thesis Assistance",
  description:
    "Questionnaire design, field data collection, statistical analysis and research write-ups from verified academic helpers.",
  alternates: { canonical: "/assistance/research-thesis" },
};

export default function ResearchThesisPage() {
  return <MarketplaceCategoryPage category={RESEARCH_THESIS_CATEGORY} />;
}
