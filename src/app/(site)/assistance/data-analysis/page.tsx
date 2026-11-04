import type { Metadata } from "next";

import { MarketplaceCategoryPage } from "@/components/assistance/marketplace-category-page";
import { DATA_ANALYSIS_CATEGORY } from "@/config/marketplace/categories/data-analysis";

export const metadata: Metadata = {
  title: "Data Analysis & Statistics",
  description:
    "SPSS, Excel, Python and R statistical tutoring and research analysis for academic projects.",
  alternates: { canonical: "/assistance/data-analysis" },
};

export default function DataAnalysisPage() {
  return <MarketplaceCategoryPage category={DATA_ANALYSIS_CATEGORY} />;
}
