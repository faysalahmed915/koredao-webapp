import type { Metadata } from "next";

import { MarketplaceCategoryPage } from "@/components/assistance/marketplace-category-page";
import { PRESENTATIONS_REPORTS_CATEGORY } from "@/config/marketplace/categories/presentations";

export const metadata: Metadata = {
  title: "Presentations & Reports",
  description:
    "PowerPoint and seminar presentations, lab and technical reports, project documentation and report formatting.",
  alternates: { canonical: "/assistance/presentations-reports" },
};

export default function PresentationsReportsPage() {
  return <MarketplaceCategoryPage category={PRESENTATIONS_REPORTS_CATEGORY} />;
}
