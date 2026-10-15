import type { Metadata } from "next";

import { AssistanceCategoryPage } from "@/components/assistance/assistance-category-page";
import { RESEARCH_SURVEY_CATEGORY } from "@/components/assistance/categories";

export const metadata: Metadata = {
  title: "Research & Survey Assistance",
  description:
    "Questionnaire design, field data collection, statistical analysis and research write-ups from verified academic helpers.",
  alternates: { canonical: "/assistance/research-and-survey" },
};

export default async function ResearchAndSurveyPage({
  params,
}: {
  params: Promise<{ level?: string[] }>;
}) {
  const { level } = await params;
  return (
    <AssistanceCategoryPage
      config={RESEARCH_SURVEY_CATEGORY}
      levelSegments={level ?? []}
    />
  );
}
