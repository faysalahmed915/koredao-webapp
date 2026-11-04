// src/config/marketplace/categories/translation.ts
//
// Category 10: Translation & Transcription
// Slug: translation-transcription
//
// Respects copyright, confidentiality and privacy.

import type { MarketplaceCategory } from "../types";

export const TRANSLATION_TRANSCRIPTION_CATEGORY: MarketplaceCategory = {
  id: "cat-translation-transcription",
  title: "Translation & Transcription",
  slug: "translation-transcription",
  description:
    "Bangla, English and Arabic translation plus audio and video transcription for academic work.",
  enabled: true,
  subcategories: [
    {
      id: "sub-translation-bn-en",
      title: "Bangla to English",
      slug: "bangla-english",
      description: "Bangla to English academic translation.",
      enabled: true,
    },
    {
      id: "sub-translation-en-bn",
      title: "English to Bangla",
      slug: "english-bangla",
      description: "English to Bangla academic translation.",
      enabled: true,
    },
    {
      id: "sub-translation-ar-bn",
      title: "Arabic to Bangla",
      slug: "arabic-bangla",
      description: "Arabic to Bangla translation.",
      enabled: true,
    },
    {
      id: "sub-translation-bn-ar",
      title: "Bangla to Arabic",
      slug: "bangla-arabic",
      description: "Bangla to Arabic translation.",
      enabled: true,
    },
    {
      id: "sub-transcription-audio",
      title: "Audio Transcription",
      slug: "audio-transcription",
      description: "Academic audio transcription.",
      enabled: true,
    },
    {
      id: "sub-transcription-video",
      title: "Video Transcription",
      slug: "video-transcription",
      description: "Academic video transcription.",
      enabled: true,
    },
    {
      id: "sub-translation-academic",
      title: "Academic Translation",
      slug: "academic-translation",
      description: "Academic document translation.",
      enabled: true,
    },
    {
      id: "sub-language-tutoring",
      title: "Language Tutoring",
      slug: "language-tutoring",
      description: "Language tutoring support.",
      enabled: true,
    },
  ],
  relevantTags: ["tag-academic-translation", "tag-language-tutoring", "tag-audio-transcription", "tag-video-transcription"],
  defaultDeliveryModes: ["ONLINE", "IN_PERSON", "HYBRID"],
  defaultDeliverableFormats: ["DIGITAL", "BOTH"],
  policyClassification: {},
  defaultPolicy: "ALLOWED",
  gigCategory: "TRANSLATION_TRANSCRIPTION",
};

export default TRANSLATION_TRANSCRIPTION_CATEGORY;
