"use client";

import * as React from "react";
import Link from "next/link";
import {
  Sparkles,
  MapPin,
  PenTool,
  Navigation,
  Sliders,
  CheckCircle2,
  Star,
  ExternalLink,
  MessageSquare,
  ChevronRight,
  Loader2,
  Building2,
  GraduationCap,
  Layers,
  ArrowRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  matchHelpers,
  fetchCampuses,
  type MatchedHelper,
  type CampusLocation,
} from "@/lib/matching-api";

export default function HandwritingMatcherPage() {
  const [campuses, setCampuses] = React.useState<CampusLocation[]>([]);
  const [helpers, setHelpers] = React.useState<MatchedHelper[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Filter States
  const [selectedUniversity, setSelectedUniversity] = React.useState("");
  const [department, setDepartment] = React.useState("");
  const [handwritingStyle, setHandwritingStyle] = React.useState<
    "CURSIVE" | "PRINT" | "MIXED" | "MATH_EQUATION"
  >("CURSIVE");
  const [handwritingSampleUrl, setHandwritingSampleUrl] = React.useState(
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
  );
  const [desiredNeatness, setDesiredNeatness] = React.useState(5);
  const [maxDistanceKm, setMaxDistanceKm] = React.useState<number>(25);

  // GPS Device state
  const [gpsCoords, setGpsCoords] = React.useState<{ latitude: number; longitude: number } | null>(
    null,
  );
  const [detectingGps, setDetectingGps] = React.useState(false);

  // Load campus list for autocomplete
  React.useEffect(() => {
    async function loadCampuses() {
      try {
        const list = await fetchCampuses();
        setCampuses(list);
      } catch {
        // Fallback
      }
    }
    loadCampuses();
  }, []);

  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setDetectingGps(false);
        toast.success(
          `GPS location detected: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
        );
      },
      () => {
        setDetectingGps(false);
        toast.error("Could not obtain device location. Please select your campus manually.");
      },
    );
  };

  const handleSearch = React.useCallback(async () => {
    setLoading(true);
    try {
      const results = await matchHelpers({
        university: selectedUniversity || undefined,
        department: department.trim() || undefined,
        handwritingStyle,
        handwritingSampleUrl: handwritingSampleUrl.trim() || undefined,
        desiredNeatness,
        latitude: gpsCoords?.latitude,
        longitude: gpsCoords?.longitude,
        maxDistanceKm: maxDistanceKm > 0 ? maxDistanceKm : undefined,
      });
      setHelpers(results);
    } catch (err: any) {
      toast.error(err?.message || "Failed to search matching helpers");
    } finally {
      setLoading(false);
    }
  }, [
    selectedUniversity,
    department,
    handwritingStyle,
    handwritingSampleUrl,
    desiredNeatness,
    gpsCoords,
    maxDistanceKm,
  ]);

  React.useEffect(() => {
    handleSearch();
  }, [handleSearch]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background/95 to-muted/20 py-8">
      <div className="container mx-auto px-4 sm:px-8 max-w-6xl">
        {/* Header Breadcrumb */}
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground mb-4">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/helpers" className="hover:text-foreground">Helpers</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
            Handwriting & Campus Proximity Matcher
          </span>
        </div>

        {/* Hero Title */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-2">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Visual Similarity & Campus Geocoding Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Handwriting Style & Campus Matcher
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Compare handwriting samples side-by-side and find verified academic peers on your campus
            or nearby for fast, secure hardcopy handoffs.
          </p>
        </div>

        {/* Filter Configuration Panel */}
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm mb-8 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-border/40">
            <Sliders className="h-4 w-4 text-indigo-500" />
            <h3 className="font-bold text-sm text-foreground">Matching Criteria</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Campus & Proximity */}
            <div className="space-y-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block flex items-center gap-1.5">
                <Building2 className="h-3.5 w-3.5 text-indigo-500" />
                <span>1. Campus & University</span>
              </label>

              <div>
                <select
                  value={selectedUniversity}
                  onChange={(e) => setSelectedUniversity(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border/80 bg-background text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Any Bangladesh University / Campus</option>
                  {campuses.map((c) => (
                    <option key={c.shortName} value={c.name}>
                      {c.name} ({c.district})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Department (e.g. Mathematics, CSE, BBA)"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-border/80 bg-background text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleDetectGps}
                  disabled={detectingGps}
                  className="w-full text-xs gap-1.5 border-dashed"
                >
                  <Navigation className={`h-3.5 w-3.5 ${detectingGps ? "animate-spin text-indigo-500" : ""}`} />
                  <span>{gpsCoords ? "GPS Coordinates Active" : "Detect Device GPS"}</span>
                </Button>
              </div>
            </div>

            {/* Column 2: Handwriting Style Selector */}
            <div className="space-y-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block flex items-center gap-1.5">
                <PenTool className="h-3.5 w-3.5 text-indigo-500" />
                <span>2. Handwriting Style</span>
              </label>

              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { style: "CURSIVE", label: "Cursive Script" },
                    { style: "PRINT", label: "Neat Print" },
                    { style: "MIXED", label: "Mixed / Fluent" },
                    { style: "MATH_EQUATION", label: "Math & Symbols" },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.style}
                    type="button"
                    onClick={() => setHandwritingStyle(item.style)}
                    className={`p-2.5 rounded-xl border text-center text-xs transition-all ${
                      handwritingStyle === item.style
                        ? "border-indigo-600 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold ring-1 ring-indigo-500"
                        : "border-border/60 hover:bg-accent text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div>
                <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                  <span>Desired Neatness Level:</span>
                  <span className="font-bold text-foreground">{desiredNeatness} / 5</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  value={desiredNeatness}
                  onChange={(e) => setDesiredNeatness(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>

            {/* Column 3: Visual Sample Preview for Comparison */}
            <div className="space-y-4">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 text-indigo-500" />
                <span>3. Your Handwriting Photo URL</span>
              </label>

              <div>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/... or your sample photo URL"
                  value={handwritingSampleUrl}
                  onChange={(e) => setHandwritingSampleUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-border/80 bg-background text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {handwritingSampleUrl && (
                <div className="relative h-28 w-full rounded-xl overflow-hidden border border-border/80 bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={handwritingSampleUrl}
                    alt="Your Sample"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute bottom-1 left-2 bg-black/60 backdrop-blur text-white text-[10px] px-2 py-0.5 rounded font-mono">
                    Target Reference Sample
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-border/40">
            <div className="text-xs text-muted-foreground">
              Showing <strong>{helpers.length}</strong> verified peer helpers ranked by similarity
            </div>
            <Button
              type="button"
              onClick={handleSearch}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm"
            >
              {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
              Update Match Results
            </Button>
          </div>
        </div>

        {/* Results Gallery: Ranked Helpers */}
        {loading ? (
          <div className="p-16 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
            <span>Calculating proximity and handwriting style scores...</span>
          </div>
        ) : helpers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center text-muted-foreground">
            <Sparkles className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
            <h3 className="font-semibold text-foreground text-base">No matching helpers found</h3>
            <p className="text-xs max-w-md mx-auto mt-1 mb-4">
              Try adjusting your campus or handwriting style filters to broaden your search.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedUniversity("");
                setDepartment("");
                handleSearch();
              }}
              className="text-xs"
            >
              Clear Campus Filter
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            {helpers.map((h, rankIdx) => (
              <div
                key={h.helperId}
                className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm hover:border-indigo-500/40 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                  {/* Left: Helper Profile & Match Highlights */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="h-12 w-12 rounded-full bg-indigo-600/15 text-indigo-600 dark:text-indigo-400 font-bold text-base flex items-center justify-center">
                          {h.name.charAt(0).toUpperCase()}
                        </div>
                        <span className="absolute -top-1 -left-1 h-5 w-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                          #{rankIdx + 1}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-base text-foreground">{h.name}</h3>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-mono">
                            <Sparkles className="h-3 w-3" /> {h.matchScore}% Match
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                          <GraduationCap className="h-3.5 w-3.5 text-indigo-500" />
                          <span>
                            {h.university} • {h.department}
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* Highlights Pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {h.matchHighlights.map((hl, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-muted text-foreground border border-border/40"
                        >
                          {hl}
                        </span>
                      ))}

                      {h.distanceKm !== undefined && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-mono flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{h.distanceKm} km away</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                      <span className="flex items-center gap-1 font-semibold text-amber-500">
                        <Star className="h-3.5 w-3.5 fill-current" /> {h.rating.toFixed(1)} ({h.totalReviews} reviews)
                      </span>
                      <span>•</span>
                      <span>{h.completedOrders} orders completed</span>
                    </div>
                  </div>

                  {/* Right: Side-by-Side Handwriting Comparison */}
                  {h.matchingSample && (
                    <div className="lg:w-[420px] bg-muted/30 p-3.5 rounded-xl border border-border/50 space-y-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block flex items-center justify-between">
                        <span>Side-by-Side Handwriting Check</span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                          Style: {h.matchingSample.style}
                        </span>
                      </span>

                      <div className="grid grid-cols-2 gap-2">
                        {/* Target uploaded by student */}
                        <div className="space-y-1">
                          <span className="text-[10px] text-muted-foreground block truncate">
                            Your Reference
                          </span>
                          <div className="h-24 rounded-lg overflow-hidden border border-border/60 bg-background">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={handwritingSampleUrl}
                              alt="Your Sample"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        </div>

                        {/* Helper's verified sample */}
                        <div className="space-y-1">
                          <span className="text-[10px] text-muted-foreground block truncate">
                            Helper&apos;s Verified Sample
                          </span>
                          <a
                            href={h.matchingSample.sampleUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block h-24 rounded-lg overflow-hidden border border-border/60 bg-background hover:ring-2 hover:ring-indigo-500 transition-all group"
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={h.matchingSample.sampleUrl}
                              alt="Helper Sample"
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-2 shrink-0 self-end lg:self-center">
                    <Link
                      href={`/helpers/${h.helperId}`}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-border/80 hover:bg-accent text-xs font-semibold text-foreground transition-all"
                    >
                      View Profile
                    </Link>
                    <Link
                      href={`/messages`}
                      className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all gap-1"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Message</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
