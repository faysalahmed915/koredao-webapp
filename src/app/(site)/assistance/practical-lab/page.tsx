import type { Metadata } from "next";

import { MarketplaceCategoryPage } from "@/components/assistance/marketplace-category-page";
import { PRACTICAL_LAB_CATEGORY } from "@/config/marketplace/categories/practical-lab";

export const metadata: Metadata = {
  title: "Practical & Lab Assistance",
  description:
    "Lab reports, experiment write-ups, circuit analysis and handwritten practical notebooks delivered by verified campus helpers with escrow protection.",
  alternates: { canonical: "/assistance/practical-lab" },
};

export default function PracticalLabPage() {
  return <MarketplaceCategoryPage category={PRACTICAL_LAB_CATEGORY} />;
}
