import type { Metadata } from "next";

import { MarketplaceCategoryPage } from "@/components/assistance/marketplace-category-page";
import { STUDY_MATERIALS_CATEGORY } from "@/config/marketplace/categories/study-materials";

export const metadata: Metadata = {
  title: "Notes & Study Materials",
  description:
    "Legally shareable lecture notes, study guides, question banks and practice questions across all education tracks.",
  alternates: { canonical: "/assistance/study-materials" },
};

export default function StudyMaterialsPage() {
  return <MarketplaceCategoryPage category={STUDY_MATERIALS_CATEGORY} />;
}
