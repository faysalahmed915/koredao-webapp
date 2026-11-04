import type { Metadata } from "next";

import { MarketplaceCategoryPage } from "@/components/assistance/marketplace-category-page";
import { PROGRAMMING_TECHNICAL_CATEGORY } from "@/config/marketplace/categories/programming-technical";

export const metadata: Metadata = {
  title: "Programming & Technical Assistance",
  description:
    "Web and mobile development, Python, C/C++, Java, databases, debugging, code review and electronics projects.",
  alternates: { canonical: "/assistance/programming-technical" },
};

export default function ProgrammingTechnicalPage() {
  return <MarketplaceCategoryPage category={PROGRAMMING_TECHNICAL_CATEGORY} />;
}
