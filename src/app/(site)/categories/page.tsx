import { notFound } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  FlaskConical,
  BookOpen,
  Users,
  GraduationCap,
  Layers,
  Calculator,
  PenTool,
  Mail,
  Phone,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  findMarketplaceCategory,
  enabledCategories,
} from "@/config/marketplace/categories";
import { CategoryGigsClient } from "./category-gigs-client";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  assignments: FileText,
  "practical-lab": FlaskConical,
  "research-thesis": BookOpen,
  tutoring: Users,
  "study-materials": GraduationCap,
  "data-analysis": Layers,
  "programming-technical": Calculator,
  "presentations-reports": PenTool,
  "editing-proofreading": PenTool,
  "translation-transcription": Mail,
  "exam-admission": Phone,
};

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string | string[] }>;
}) {
  const { category } = await searchParams;
  const slugs = Array.isArray(category) ? category : category ? [category] : [];

  // When a category search param is present, render the gig listing for it.
  if (slugs.length > 0) {
    const resolved = slugs
      .map((s) => findMarketplaceCategory(s))
      .filter(Boolean);

    if (resolved.length === 0) {
      notFound();
    }
    const allCategories = enabledCategories();
    return (
      <CategoryGigsClient
        initialCategorySlugs={slugs}
        allCategories={allCategories}
      />
    );
  }

  // Otherwise, render the category index page with all category cards.
  const categories = enabledCategories();

  return (
    <div className="container mx-auto px-4 py-12 sm:px-8 sm:py-16">
      <div className="mb-12 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
          <Layers className="h-3.5 w-3.5" />
          Browse Academic Services
        </div>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Choose Your Academic Service Category
        </h1>
        <p className="mt-2 max-w-2xl text-base text-muted-foreground sm:text-sm">
          Find verified helpers for assignments, lab reports, thesis research,
          tutoring and more — all with escrow-protected payment.
        </p>
      </div>

      <section>
        <h2 className="sr-only">Academic service categories</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((category) => {
            const Icon = CATEGORY_ICONS[category.slug] || Layers;
            console.log("category", category);
            return (
              <Card
                key={category.slug}
                className="border-border/60 hover:border-indigo-500/40 transition-colors group"
              >
                <CardHeader className="flex flex-row items-center justify-between p-5">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 group-hover:bg-indigo-100 transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-semibold leading-none">
                        {category.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {category.description}
                      </CardDescription>
                    </div>
                  </div>
                  <Link
                    href={`/categories?category=${category.slug}`}
                    className="rounded-md p-2 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    aria-label={`Browse ${category.title}`}
                  >
                    <span className="sr-only">Browse {category.title}</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={16}
                      height={16}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </Link>
                </CardHeader>
                <CardContent className="p-5 pt-0">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-medium">
                      {category.subcategories.length} subcategory
                      {category.subcategories.length !== 1 ? "s" : ""}
                    </span>
                    <span>·</span>
                    <span>
                      {category.defaultDeliveryModes?.join(", ").toLowerCase()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mt-16 rounded-2xl border border-indigo-500/25 bg-gradient-to-r from-indigo-950/20 via-purple-950/10 to-card p-8 sm:p-12">
        <h2 className="text-lg font-bold text-foreground mb-6 sm:text-xl">
          How It Works
        </h2>
        <div className="grid gap-6 sm:grid-cols-3 text-center sm:text-left">
          <div className="flex flex-col items-center sm:items-start gap-3">
            <div className="rounded-full bg-indigo-600/10 p-2 text-indigo-600">
              <FileText className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-sm">Choose a category</h3>
            <p className="text-xs text-muted-foreground">
              Pick the academic service you need help with.
            </p>
          </div>
          <div className="flex flex-col items-center sm:items-start gap-3">
            <div className="rounded-full bg-indigo-600/10 p-2 text-indigo-600">
              <GraduationCap className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-sm">Browse verified helpers</h3>
            <p className="text-xs text-muted-foreground">
              View top-rated gigs and open job requests in that category.
            </p>
          </div>
          <div className="flex flex-col items-center sm:items-start gap-3">
            <div className="rounded-full bg-indigo-600/10 p-2 text-indigo-600">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <h3 className="font-semibold text-sm">Escrow protection</h3>
            <p className="text-xs text-muted-foreground">
              Payment is held securely until you approve the delivered work.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
    </svg>
  );
}
