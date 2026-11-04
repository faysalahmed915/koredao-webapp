import type { Metadata } from "next";

import { MarketplaceCategoryPage } from "@/components/assistance/marketplace-category-page";
import { EXAM_ADMISSION_CATEGORY } from "@/config/marketplace/categories/exam-preparation";

export const metadata: Metadata = {
  title: "Exam & Admission Preparation",
  description:
    "Mock exams, practice materials and tutoring for SSC, HSC, Dakhil, Alim, O/A Level, university and professional admission exams.",
  alternates: { canonical: "/assistance/exam-admission" },
};

export default function ExamAdmissionPage() {
  return <MarketplaceCategoryPage category={EXAM_ADMISSION_CATEGORY} />;
}
