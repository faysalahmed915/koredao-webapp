# KoreDao Gig Data Structure & Fake Data Examples

This document defines the Gig data structure after the taxonomy extension and provides realistic fake data examples for testing and reference.

---

## 1. Gig Model Structure

### Prisma Schema

```prisma
model Gig {
  id                String            @id @default(cuid())
  vendorProfileId   String
  vendorProfile     VendorProfile     @relation(fields: [vendorProfileId], references: [id], onDelete: Cascade)
  title             String
  slug              String            @unique
  description       String            @db.Text
  category          GigCategory       @default(ASSIGNMENT)
  subjectTags       String[]          @default([])
  subjectIds        String[]          @default([])
  subject           Subject?          @relation(fields: [subjectIds], references: [id])
  coverImages       String[]          @default([])
  tierType          GigTierType       @default(SINGLE)
  priceFrom         Float
  deliveryDays      Int               @default(3)
  packages          Json
  requiresHardcopy  Boolean           @default(false)
  handwritingStyle  HandwritingStyle?
  isActive          Boolean           @default(true)

## 2. Fake Gig Record

### Complete Gig Entry

```json
{
  "id": "gig-abc123def456ghi789",
  "vendorProfileId": "vp-xyz789abc123",
  "title": "HSC Physics Chapter-wise Lecture Notes - Complete Guide",
  "slug": "hsc-physics-chapter-wise-lecture-notes-complete-guide-abc123",
  "description": "Comprehensive HSC Physics lecture notes covering all chapters with solved examples, diagrams, and exam-focused explanations. Aligned with NCTB curriculum.",
  "category": "STUDY_MATERIALS",
  "subjectTags": ["physics", "hsc", "notes", "study-materials"],
  "subjectIds": ["subj-physics-001"],
  "subject": {
    "id": "subj-physics-001",
    "title": "Physics",
    "slug": "physics",
    "description": "Physical sciences subject across education tracks",
    "enabled": true,
    "sortOrder": 1
  },
  "coverImages": [
    "https://cdn.koredao.com/gigs/hsc-physics-notes-cover-1.jpg",
    "https://cdn.koredao.com/gigs/hsc-physics-notes-sample-page.jpg"
  ],
  "tierType": "SINGLE",
  "priceFrom": 500.00,
  "deliveryDays": 3,
  "packages": [
    {
      "id": "pkg-basic",
      "title": "Basic Package",
      "description": "5 chapter-wise notes PDF",
      "price": 500,
      "deliveryDays": 3,
      "features": ["5 chapter notes", "PDF format", "Digital delivery"]
    },
    {
      "id": "pkg-premium",
      "title": "Premium Package",
      "description": "All 14 chapter-wise notes + practice questions",
      "price": 1200,
      "deliveryDays": 2,
      "features": ["14 chapter notes", "Practice questions", "PDF + Hardcopy", "Online delivery"]
    }
  ],
  "requiresHardcopy": false,
  "handwritingStyle": null,
  "isActive": true,
  "orderCount": 42,
  "rating": 4.8,
  "totalReviews": 38,
  "attachments": [
    {
      "id": "att-sample-001",
      "fileUrl": "https://cdn.koredao.com/gigs/sample-physics-chapter1.pdf",
      "fileName": "physics-chapter-1-sample.pdf",
      "fileType": "application/pdf",
      "fileSize": 2048000,
      "isPublicDemo": true
    }
  ],
  "educationTrackIds": ["track-general-001"],
  "academicLevelIds": ["level-hsc-001"],
  "level": {
    "id": "level-hsc-001",
    "title": "HSC (Higher Secondary Certificate)",
    "slug": "hsc",
    "trackId": "track-general-001",
    "enabled": true,
    "sortOrder": 3
  },
  "specializationIds": [],
  "specialization": null,
  "tagIds": ["tag-chapter-summary", "tag-exam-preparation"],
  "tag": null,
  "deliverableFormats": ["DIGITAL", "HARDCOPY"],
  "deliveryModes": ["ONLINE"],
  "locationLevelId": null,
  "locationLevel": null,
  "orders": [],
  "createdAt": "2026-10-15T08:30:00Z",
  "updatedAt": "2026-10-20T14:45:00Z"
}
```
  orderCount        Int               @default(0)
  rating            Float             @default(0.0)
  totalReviews      Int               @default(0)
  attachments       GigAttachment[]
  orders            Order[]
  educationTrackIds String[]          @default([])
  academicLevelIds  String[]          @default([])
  level             EducationLevel?   @relation(fields: [academicLevelIds], references: [id])
  specializationIds String[]          @default([])
  specialization    Specialization?   @relation(fields: [specializationIds], references: [id])
  tagIds            String[]          @default([])
  tag               TaxonomyTag?      @relation(fields: [tagIds], references: [id])
  deliverableFormats DeliverableFormat[] @default([DIGITAL, HARDCOPY, BOTH])
  deliveryModes     DeliveryMode[]    @default([ONLINE, IN_PERSON, HYBRID])
  locationLevelId   String?
  locationLevel     LocationLevel?    @relation(fields: [locationLevelId], references: [id])
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  @@index([vendorProfileId])
  @@index([category])
  @@index([priceFrom])
  @@index([isActive])
  @@map("gig")
}
```

## 3. Related Taxonomy Records

### Education Tracks

```json
{
  "educationTracks": [
    { "id": "track-general-001", "title": "General Education", "slug": "general-education", "enabled": true, "sortOrder": 1 },
    { "id": "track-madrasa-001", "title": "Madrasa Education", "slug": "madrasa-education", "enabled": true, "sortOrder": 2 },
    { "id": "track-technical-001", "title": "Technical & Vocational", "slug": "technical-vocational", "enabled": true, "sortOrder": 3 },
    { "id": "track-international-001", "title": "English-Medium & International", "slug": "english-medium-international", "enabled": true, "sortOrder": 4 },
    { "id": "track-higher-001", "title": "Higher Education", "slug": "higher-education", "enabled": true, "sortOrder": 5 }
  ]
}
```

### Education Levels

```json
{
  "educationLevels": [
    { "id": "level-hsc-001", "title": "HSC", "slug": "hsc", "trackId": "track-general-001", "enabled": true },
    { "id": "level-ssc-001", "title": "SSC", "slug": "ssc", "trackId": "track-general-001", "enabled": true },
    { "id": "level-dakhil-001", "title": "Dakhil", "slug": "dakhil", "trackId": "track-madrasa-001", "enabled": true },
    { "id": "level-alim-001", "title": "Alim", "slug": "alim", "trackId": "track-madrasa-001", "enabled": true },
    { "id": "level-diploma-001", "title": "Diploma in Engineering", "slug": "diploma-engineering", "trackId": "track-technical-001", "enabled": true },
    { "id": "level-olevel-001", "title": "O Level / IGCSE", "slug": "o-level-igcse", "trackId": "track-international-001", "enabled": true },
    { "id": "level-alevel-001", "title": "A Level", "slug": "a-level", "trackId": "track-international-001", "enabled": true },
    { "id": "level-undergraduate-001", "title": "Undergraduate", "slug": "undergraduate", "trackId": "track-higher-001", "enabled": true },
    { "id": "level-postgraduate-001", "title": "Postgraduate", "slug": "postgraduate", "trackId": "track-higher-001", "enabled": true }
  ]
}
```

### Subjects

```json
{
  "subjects": [
    { "id": "subj-physics-001", "title": "Physics", "slug": "physics", "enabled": true },
    { "id": "subj-mathematics-001", "title": "Mathematics", "slug": "mathematics", "enabled": true },
    { "id": "subj-bangla-001", "title": "Bangla", "slug": "bangla", "enabled": true },
    { "id": "subj-english-001", "title": "English", "slug": "english", "enabled": true },
    { "id": "subj-chemistry-001", "title": "Chemistry", "slug": "chemistry", "enabled": true },
    { "id": "subj-biology-001", "title": "Biology", "slug": "biology", "enabled": true },
    { "id": "subj-ict-001", "title": "ICT", "slug": "ict", "enabled": true },
    { "id": "subj-accounting-001", "title": "Accounting", "slug": "accounting", "enabled": true },
    { "id": "subj-economics-001", "title": "Economics", "slug": "economics", "enabled": true }
  ]
}
```

### Specializations

```json
{
  "specializations": [
    { "id": "spec-electrical-001", "title": "Electrical Engineering", "slug": "electrical-engineering", "subjectId": "subj-physics-001", "enabled": true },
    { "id": "spec-computer-science-001", "title": "Computer Science", "slug": "computer-science", "subjectId": null, "enabled": true },
    { "id": "spec-mechanical-001", "title": "Mechanical Engineering", "slug": "mechanical-engineering", "subjectId": null, "enabled": true },
    { "id": "spec-civil-001", "title": "Civil Engineering", "slug": "civil-engineering", "subjectId": null, "enabled": true }
  ]
}
```

### Taxonomy Tags

```json
{
  "taxonomyTags": [
    { "id": "tag-chapter-summary", "title": "Chapter Summary", "slug": "chapter-summary", "enabled": true },
    { "id": "tag-exam-preparation", "title": "Exam Preparation", "slug": "exam-preparation", "enabled": true },
    { "id": "tag-mcq-practice", "title": "MCQ Practice", "slug": "mcq-practice", "enabled": true },
    { "id": "tag-cq-practice", "title": "CQ Practice", "slug": "cq-practice", "enabled": true },
    { "id": "tag-practical-demo", "title": "Practical Demonstration", "slug": "practical-demonstration", "enabled": true },
    { "id": "tag-online-class", "title": "Online Class", "slug": "online-class", "enabled": true }
  ]
}
```

### Taxonomy Aliases (Search Normalization)

```json
{
  "taxonomyAliases": [
    { "id": "alias-fisics-001", "entityType": "SUBJECT", "entityId": "subj-physics-001", "alias": "fisics", "normalizedAlias": "fisics", "language": "en", "aliasType": "MISSPELLING", "status": "ACTIVE" },
    { "id": "alias-porar-note-001", "entityType": "SERVICE", "entityId": "svc-lecture-notes-001", "alias": "পড়ার নোট", "normalizedAlias": "porar note", "language": "bn-Latn", "aliasType": "TRANSLITERATION", "status": "ACTIVE" },
    { "id": "alias-varsity-001", "entityType": "CATEGORY", "entityId": "cat-assignments", "alias": "varsity", "normalizedAlias": "varsity", "language": "bn-Latn", "aliasType": "ABBREVIATION", "status": "ACTIVE" },
    { "id": "alias-asignment-001", "entityType": "SERVICE", "entityId": "svc-assignment-guidance-001", "alias": "asignment", "normalizedAlias": "asignment", "language": "en", "aliasType": "MISSPELLING", "status": "ACTIVE" },
    { "id": "alias-gonit-001", "entityType": "SUBJECT", "entityId": "subj-mathematics-001", "alias": "গণিত", "normalizedAlias": "gonit", "language": "bn", "aliasType": "SYNONYM", "status": "ACTIVE" },
    { "id": "alias-chemisrty-001", "entityType": "SUBJECT", "entityId": "subj-chemistry-001", "alias": "chemisrty", "normalizedAlias": "chemisrty", "language": "en", "aliasType": "MISSPELLING", "status": "ACTIVE" },
    { "id": "alias-verseity-001", "entityType": "CATEGORY", "entityId": "cat-tutoring", "alias": "verseity", "normalizedAlias": "verseity", "language": "bn-Latn", "aliasType": "MISSPELLING", "status": "ACTIVE" }
  ]
}
```

### Location Levels (Bangladesh Hierarchy)

```json
{
  "locationLevels": [
    { "id": "loc-dhaka-001", "title": "Dhaka", "slug": "dhaka", "level": "Division", "enabled": true },
    { "id": "loc-chittagong-001", "title": "Chittagong", "slug": "chittagong", "level": "Division", "enabled": true },
    { "id": "loc-sylhet-001", "title": "Sylhet", "slug": "sylhet", "level": "Division", "enabled": true },
    { "id": "loc-dhaka-city-001", "title": "Dhaka City", "slug": "dhaka-city", "level": "City", "parentId": "loc-dhaka-001", "enabled": true },
    { "id": "loc-mohakhali-001", "title": "Mohakhali", "slug": "mohakhali", "level": "Area", "parentId": "loc-dhaka-city-001", "enabled": true },
    { "id": "loc-gulshan-001", "title": "Gulshan", "slug": "gulshan", "level": "Area", "parentId": "loc-dhaka-city-001", "enabled": true }
  ]
}
```

### Vendor Profile

```json
{
  "vendors": [
    { "id": "vp-xyz789abc123", "userId": "usr-vendor-001", "university": "Dhaka University", "department": "Physics Department", "academicLevel": "POSTGRADUATE", "degree": "MSc Physics", "verificationStatus": "APPROVED", "rating": 4.9, "totalReviews": 156, "completedOrders": 284 }
  ]
}
```

## 4. Gig Category Enum Values

```typescript
enum GigCategory {
  ASSIGNMENT,
  LAB_REPORT,
  THESIS_RESEARCH,
  HANDWRITTEN_HARDCOPY,
  MATH_PROBLEM_SOLVING,
  PRESENTATION_SLIDES,
  EDITING_PROOFREADING,
  TRANSLATION_TRANSCRIPTION,
  EXAM_ADMISSION,
  STUDY_MATERIALS,
  DATA_ANALYSIS,
  OTHER
}
```

### Category → Slug Mapping

| GigCategory | Category Title | Slug |
|-------------|---------------|------|
| ASSIGNMENT | Assignments & Coursework | assignments |
| LAB_REPORT | Practical & Lab Assistance | practical-lab |
| THESIS_RESEARCH | Research & Thesis | research-thesis |
| HANDWRITTEN_HARDCOPY | Handwritten Hardcopy | handwritten-hardcopy |
| MATH_PROBLEM_SOLVING | Math Problem Solving | math-problem-solving |
| PRESENTATION_SLIDES | Presentations & Reports | presentations-reports |
| EDITING_PROOFREADING | Editing & Proofreading | editing-proofreading |
| TRANSLATION_TRANSCRIPTION | Translation & Transcription | translation-transcription |
| EXAM_ADMISSION | Exam & Admission Preparation | exam-admission |
| STUDY_MATERIALS | Notes & Study Materials | study-materials |
| DATA_ANALYSIS | Data Analysis & Statistics | data-analysis |
| OTHER | Other | other |

## 5. Deliverable Formats & Delivery Modes

### DeliverableFormat Enum

| Value | Description | Example Use Case |
|-------|-------------|------------------|
| DIGITAL | Digital delivery only | PDF notes, online tutoring |
| HARDCOPY | Physical hardcopy only | Printed notes, in-person lab |
| BOTH | Both digital and hardcopy | Notes with PDF + printed copy |

### DeliveryMode Enum

| Value | Description | Example Use Case |
|-------|-------------|------------------|
| ONLINE | Online delivery | Video calls, PDF, digital files |
| IN_PERSON | In-person delivery | Home tutoring, lab practical |
| HYBRID | Mix of online and in-person | Some sessions online, some in-person |

## 6. Example Gig Combinations

### Example 1: Digital Notes (Online Only)

```json
{
  "category": "STUDY_MATERIALS",
  "subjectIds": ["subj-physics-001"],
  "educationTrackIds": ["track-general-001"],
  "academicLevelIds": ["level-hsc-001"],
  "tagIds": ["tag-chapter-summary"],
  "deliveryModes": ["ONLINE"],
  "deliverableFormats": ["DIGITAL"],
  "requiresHardcopy": false
}
```

### Example 2: In-Person Lab Practical

```json
{
  "category": "LAB_REPORT",
  "subjectIds": ["subj-chemistry-001"],
  "educationTrackIds": ["track-general-001"],
  "academicLevelIds": ["level-hsc-001"],
  "tagIds": ["tag-practical-demo"],
  "deliveryModes": ["IN_PERSON"],
  "deliverableFormats": ["HARDCOPY"],
  "requiresHardcopy": true,
  "locationLevelId": "loc-dhaka-city-001"
}
```

### Example 3: Hybrid Tutoring

```json
{
  "category": "ASSIGNMENT",
  "subjectIds": ["subj-mathematics-001"],
  "educationTrackIds": ["track-general-001"],
  "academicLevelIds": ["level-ssc-001"],
  "tagIds": ["tag-exam-preparation"],
  "deliveryModes": ["HYBRID"],
  "deliverableFormats": ["DIGITAL", "BOTH"],
  "requiresHardcopy": false
}
```

## 7. How Fields Connect

```
┌─────────────────────────────────────────────────────────────────┐
│                      GIG RECORD                                 │
│  id: gig-abc123def456ghi789                                    │
│  category: STUDY_MATERIALS                                      │
│  title: "HSC Physics Chapter-wise Lecture Notes"               │
└──────────────────────┬──────────────────────────────────────────┘
                       │
    ┌──────────────────┼──────────────────┬──────────────────┐
    │                  │                  │                  │
    ▼                  ▼                  ▼                  ▼
┌─────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│Subject  │     │Education │     │Taxonomy  │     │Location  │
│Physics  │     │Track     │     │Tag       │     │Level     │
│subj-    │     │General   │     │Chapter   │     │(optional)│
│physics- │     │Education │     │Summary   │     │          │
│001      │     │track-    │     │tag-      │     │          │
│         │     │general-  │     │chapter-  │     │          │
│         │     │001       │     │summary   │     │          │
└─────────┘     └──────────┘     └──────────┘     └──────────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │Deliverable   │
                                    │Format        │
                                    │DIGITAL       │
                                    │HARDCOPY      │
                                    └──────────────┘
                                    ┌──────────────┐
                                    │Delivery Mode │
                                    │ONLINE        │
                                    └──────────────┘
```

## 8. Key Design Principles

1. **Subjects are reusable**: Physics (`subj-physics-001`) works across tutoring, notes, labs, assignments — no duplication per category.

2. **Levels belong to tracks**: HSC (`level-hsc-001`) exists only under General Education track, not duplicated across all tracks.

3. **Backward compatible**: `subjectTags` (String[]) still works alongside new `subjectIds` — existing gigs keep working without migration.

4. **No hardcoded categories**: All IDs are stable UUIDs/slugs manageable through admin interface without code changes.

5. **Aliases enable search**: "fisics" → Physics subject, "পড়ার নোট" → Lecture Notes, "varsity" → Assignments category — all resolve to canonical entities.

6. **Listing attributes separate from taxonomy**: Delivery modes, formats, price, delivery time are listing attributes, not taxonomy entities.

## 9. File Locations

| File | Purpose |
|------|---------|
| `koredao-server/prisma/schema/gig.prisma` | Gig model with new taxonomy fields |
| `koredao-server/prisma/schema/education-track.prisma` | EducationTrack model |
| `koredao-server/prisma/schema/education-level.prisma` | EducationLevel model |
| `koredao-server/prisma/schema/subject.prisma` | Subject model |
| `koredao-server/prisma/schema/specialization.prisma` | Specialization model |
| `koredao-server/prisma/schema/taxonomy-tag.prisma` | TaxonomyTag model |
| `koredao-server/prisma/schema/taxonomy-alias.prisma` | TaxonomyAlias model |
| `koredao-server/prisma/schema/location-level.prisma` | LocationLevel model |
| `koredao-server/prisma/schema/enums.prisma` | All enum definitions |
| `koredao-webapp/src/components/gigs/gig-types.ts` | Frontend GigFilterState types |
| `koredao-webapp/src/components/gigs/gig-filters.tsx` | Frontend filter component |

---

*Document generated as part of KoreDao Taxonomy Extension Implementation (Phase 1)*