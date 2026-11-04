// src/config/marketplace/subjects.ts
//
// Reusable subjects and specializations. Subjects are NOT duplicated per
// category; the same subject id is referenced across tutoring, assignments,
// practical assistance, exam preparation, etc.

import type { Subject } from "./types";

export const SUBJECTS: readonly Subject[] = [
  // General / common
  { id: "subject-bangla", title: "Bangla", slug: "bangla", enabled: true },
  { id: "subject-english", title: "English", slug: "english", enabled: true },
  { id: "subject-ict", title: "ICT", slug: "ict", enabled: true },
  { id: "subject-mathematics", title: "Mathematics", slug: "mathematics", enabled: true },
  { id: "subject-general-science", title: "General Science", slug: "general-science", enabled: true },

  // Science group
  { id: "subject-physics", title: "Physics", slug: "physics", enabled: true },
  { id: "subject-chemistry", title: "Chemistry", slug: "chemistry", enabled: true },
  { id: "subject-biology", title: "Biology", slug: "biology", enabled: true },
  { id: "subject-higher-mathematics", title: "Higher Mathematics", slug: "higher-mathematics", enabled: true },

  // Humanities
  { id: "subject-history", title: "History", slug: "history", enabled: true },
  { id: "subject-geography", title: "Geography", slug: "geography", enabled: true },
  { id: "subject-civics", title: "Civics", slug: "civics", enabled: true },
  { id: "subject-economics", title: "Economics", slug: "economics", enabled: true },
  { id: "subject-sociology", title: "Sociology", slug: "sociology", enabled: true },
  { id: "subject-logic", title: "Logic", slug: "logic", enabled: true },
  { id: "subject-religion-moral-education", title: "Religion and Moral Education", slug: "religion-moral-education", enabled: true },

  // Business Studies
  { id: "subject-accounting", title: "Accounting", slug: "accounting", enabled: true },
  { id: "subject-finance-banking", title: "Finance & Banking", slug: "finance-banking", enabled: true },
  { id: "subject-business-entrepreneurship", title: "Business Entrepreneurship", slug: "business-entrepreneurship", enabled: true },
  { id: "subject-production-management", title: "Production Management", slug: "production-management", enabled: true },
  { id: "subject-business-organization", title: "Business Organization", slug: "business-organization", enabled: true },

  // Madrasa / Islamic
  { id: "subject-quran", title: "Quran", slug: "quran", enabled: true },
  { id: "subject-hadith", title: "Hadith", slug: "hadith", enabled: true },
  { id: "subject-tafsir", title: "Tafsir", slug: "tafsir", enabled: true },
  { id: "subject-fiqh", title: "Fiqh", slug: "fiqh", enabled: true },
  { id: "subject-arabic-language", title: "Arabic Language", slug: "arabic-language", enabled: true },
  { id: "subject-arabic-grammar", title: "Arabic Grammar", slug: "arabic-grammar", enabled: true },
  { id: "subject-arabic-literature", title: "Arabic Literature", slug: "arabic-literature", enabled: true },
  { id: "subject-islamic-history", title: "Islamic History", slug: "islamic-history", enabled: true },

  // Technical & Vocational
  { id: "subject-civil-engineering", title: "Civil Engineering", slug: "civil-engineering", enabled: true },
  { id: "subject-electrical-engineering", title: "Electrical Engineering", slug: "electrical-engineering", enabled: true },
  { id: "subject-electronics", title: "Electronics", slug: "electronics", enabled: true },
  { id: "subject-mechanical-engineering", title: "Mechanical Engineering", slug: "mechanical-engineering", enabled: true },
  { id: "subject-computer-technology", title: "Computer Technology", slug: "computer-technology", enabled: true },
  { id: "subject-architecture-technology", title: "Architecture Technology", slug: "architecture-technology", enabled: true },
  { id: "subject-textile-engineering", title: "Textile Engineering", slug: "textile-engineering", enabled: true },
  { id: "subject-garments-technology", title: "Garments Technology", slug: "garments-technology", enabled: true },
  { id: "subject-agriculture-technology", title: "Agriculture Technology", slug: "agriculture-technology", enabled: true },
  { id: "subject-refrigeration-ac", title: "Refrigeration & Air Conditioning", slug: "refrigeration-ac", enabled: true },
  { id: "subject-automotive-technology", title: "Automotive Technology", slug: "automotive-technology", enabled: true },
  { id: "subject-welding", title: "Welding", slug: "welding", enabled: true },
  { id: "subject-plumbing", title: "Plumbing", slug: "plumbing", enabled: true },

  // English-medium / International
  { id: "subject-further-mathematics", title: "Further Mathematics", slug: "further-mathematics", enabled: true },
  { id: "subject-computer-science", title: "Computer Science", slug: "computer-science", enabled: true },
  { id: "subject-business-studies", title: "Business Studies", slug: "business-studies", enabled: true },
  { id: "subject-english-language", title: "English Language", slug: "english-language", enabled: true },

  // Higher education
  { id: "subject-business-administration", title: "Business Administration", slug: "business-administration", enabled: true },
  { id: "subject-accounting-finance", title: "Accounting & Finance", slug: "accounting-finance", enabled: true },
  { id: "subject-arts-humanities", title: "Arts & Humanities", slug: "arts-humanities", enabled: true },
  { id: "subject-social-sciences", title: "Social Sciences", slug: "social-sciences", enabled: true },
  { id: "subject-natural-sciences", title: "Natural Sciences", slug: "natural-sciences", enabled: true },
  { id: "subject-medical-health-sciences", title: "Medical & Health Sciences", slug: "medical-health-sciences", enabled: true },
  { id: "subject-law", title: "Law", slug: "law", enabled: true },
  { id: "subject-agriculture", title: "Agriculture", slug: "agriculture", enabled: true },
  { id: "subject-pharmacy", title: "Pharmacy", slug: "pharmacy", enabled: true },
  { id: "subject-nursing", title: "Nursing", slug: "nursing", enabled: true },
  { id: "subject-aviation", title: "Aviation", slug: "aviation", enabled: true },
] as const;

export function findSubject(slug: string): Subject | undefined {
  return SUBJECTS.find((s) => s.slug === slug);
}

export function enabledSubjects(): readonly Subject[] {
  return SUBJECTS.filter((s) => s.enabled);
}
