import type { Metadata } from "next";

import { MarketplaceCategoryPage } from "@/components/assistance/marketplace-category-page";
import { EDITING_PROOFREADING_CATEGORY } from "@/config/marketplace/categories/editing";

export const metadata: Metadata = {
  title: "Editing & Proofreading",
  description:
    "Proofreading, document formatting, citation and referencing, grammar editing and academic structure feedback.",
  alternates: { canonical: "/assistance/editing-proofreading" },
};

export default function EditingProofreadingPage() {
  return <MarketplaceCategoryPage category={EDITING_PROOFREADING_CATEGORY} />;
}
