import type { Metadata } from "next";

import { MarketplaceCategoryPage } from "@/components/assistance/marketplace-category-page";
import { TRANSLATION_TRANSCRIPTION_CATEGORY } from "@/config/marketplace/categories/translation";

export const metadata: Metadata = {
  title: "Translation & Transcription",
  description:
    "Bangla, English and Arabic translation plus audio and video transcription for academic work.",
  alternates: { canonical: "/assistance/translation-transcription" },
};

export default function TranslationTranscriptionPage() {
  return <MarketplaceCategoryPage category={TRANSLATION_TRANSCRIPTION_CATEGORY} />;
}
