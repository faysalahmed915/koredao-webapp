import type { Metadata } from "next";

import { MarketplaceCategoryPage } from "@/components/assistance/marketplace-category-page";
import { TUTORING_CATEGORY } from "@/config/marketplace/categories/tutoring";

export const metadata: Metadata = {
  title: "Tutoring & Academic Guidance",
  description:
    "One-to-one tutoring and academic mentoring across all Bangladesh education tracks and levels.",
  alternates: { canonical: "/assistance/tutoring" },
};

export default function TutoringPage() {
  return <MarketplaceCategoryPage category={TUTORING_CATEGORY} />;
}
