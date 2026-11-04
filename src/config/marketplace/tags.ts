// src/config/marketplace/tags.ts
//
// Service tags describing the specific work involved. Reusable across
// categories; not duplicated per category.

import type { ServiceTag } from "./types";

export const SERVICE_TAGS: readonly ServiceTag[] = [
  { id: "tag-tutoring", title: "Tutoring", slug: "tutoring", enabled: true },
  { id: "tag-proofreading", title: "Proofreading", slug: "proofreading", enabled: true },
  { id: "tag-data-collection", title: "Data Collection", slug: "data-collection", enabled: true },
  { id: "tag-statistical-analysis", title: "Statistical Analysis", slug: "statistical-analysis", enabled: true },
  { id: "tag-cad", title: "CAD", slug: "cad", enabled: true },
  { id: "tag-practical-demonstration", title: "Practical Demonstration", slug: "practical-demonstration", enabled: true },
  { id: "tag-lab-report-feedback", title: "Lab Report Feedback", slug: "lab-report-feedback", enabled: true },
  { id: "tag-chapter-summary", title: "Chapter Summary", slug: "chapter-summary", enabled: true },
  { id: "tag-model-test", title: "Model Test", slug: "model-test", enabled: true },
  { id: "tag-mcq-practice", title: "MCQ Practice", slug: "mcq-practice", enabled: true },
  { id: "tag-cq-practice", title: "Creative Question (CQ) Practice", slug: "cq-practice", enabled: true },
  { id: "tag-exam-preparation", title: "Exam Preparation", slug: "exam-preparation", enabled: true },
  { id: "tag-admission-preparation", title: "Admission Preparation", slug: "admission-preparation", enabled: true },
  { id: "tag-arabic-translation", title: "Arabic Translation", slug: "arabic-translation", enabled: true },
  { id: "tag-arabic-text-explanation", title: "Arabic Text Explanation", slug: "arabic-text-explanation", enabled: true },
  { id: "tag-quran-recitation", title: "Quran Recitation and Tajweed", slug: "quran-recitation", enabled: true },
  { id: "tag-engineering-drawing", title: "Engineering Drawing", slug: "engineering-drawing", enabled: true },
  { id: "tag-electrical-circuit", title: "Electrical Circuit Guidance", slug: "electrical-circuit", enabled: true },
  { id: "tag-electronics-projects", title: "Electronics Projects", slug: "electronics-projects", enabled: true },
  { id: "tag-technical-report", title: "Technical Report Preparation", slug: "technical-report", enabled: true },
  { id: "tag-programming-microcontroller", title: "Programming and Microcontroller Tutoring", slug: "programming-microcontroller", enabled: true },
  { id: "tag-workshop-demonstration", title: "Workshop Demonstration", slug: "workshop-demonstration", enabled: true },
  { id: "tag-citation-referencing", title: "Citation & Referencing", slug: "citation-referencing", enabled: true },
  { id: "tag-grammar-editing", title: "Grammar & Language Editing", slug: "grammar-editing", enabled: true },
  { id: "tag-academic-structure-feedback", title: "Academic Structure Feedback", slug: "academic-structure-feedback", enabled: true },
  { id: "tag-plagiarism-free-guidance", title: "Plagiarism-Free Writing Guidance", slug: "plagiarism-free-guidance", enabled: true },
  { id: "tag-audio-transcription", title: "Audio Transcription", slug: "audio-transcription", enabled: true },
  { id: "tag-video-transcription", title: "Video Transcription", slug: "video-transcription", enabled: true },
  { id: "tag-academic-translation", title: "Academic Translation", slug: "academic-translation", enabled: true },
  { id: "tag-language-tutoring", title: "Language Tutoring", slug: "language-tutoring", enabled: true },
  { id: "tag-survey-design", title: "Survey Design", slug: "survey-design", enabled: true },
  { id: "tag-interviews", title: "Interviews", slug: "interviews", enabled: true },
  { id: "tag-field-research", title: "Field Research", slug: "field-research", enabled: true },
  { id: "tag-data-visualization", title: "Data Visualization", slug: "data-visualization", enabled: true },
  { id: "tag-debugging", title: "Debugging", slug: "debugging", enabled: true },
  { id: "tag-code-review", title: "Code Review", slug: "code-review", enabled: true },
  { id: "tag-presentation-design", title: "Presentation Design", slug: "presentation-design", enabled: true },
  { id: "tag-report-formatting", title: "Report Formatting", slug: "report-formatting", enabled: true },
] as const;

export function findTag(slug: string): ServiceTag | undefined {
  return SERVICE_TAGS.find((t) => t.slug === slug);
}

export function enabledTags(): readonly ServiceTag[] {
  return SERVICE_TAGS.filter((t) => t.enabled);
}
