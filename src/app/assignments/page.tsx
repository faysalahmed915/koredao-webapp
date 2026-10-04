"use client";

import * as React from "react";
import Link from "next/link";
import {
  Search,
  Briefcase,
  Sparkles,
  Clock,
  DollarSign,
  PenTool,
  FileText,
  MapPin,
  ArrowRight,
  Plus,
  Loader2,
  Users,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { searchAssignments, Assignment } from "@/lib/assignments-api";

export default function AssignmentsFeedPage() {
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("");
  const [type, setType] = React.useState("");
  const [preferredCampus, setPreferredCampus] = React.useState("");
  const [sortBy, setSortBy] = React.useState("newest");
  const [loading, setLoading] = React.useState(true);
  const [assignments, setAssignments] = React.useState<Assignment[]>([]);
  const [total, setTotal] = React.useState(0);

  const loadAssignments = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await searchAssignments({
        search: search.trim() || undefined,
        category: category || undefined,
        type: type || undefined,
        preferredCampus: preferredCampus.trim() || undefined,
        sortBy,
      });
      setAssignments(data.items);
      setTotal(data.total);
    } catch {
      setAssignments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [search, category, type, preferredCampus, sortBy]);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      loadAssignments();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadAssignments]);

  return (
    <div className="container mx-auto px-4 py-12 sm:px-8">
      {/* Header with CTA */}
      <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
            <Sparkles className="h-3.5 w-3.5" />
            Upwork-Style Assignment Bidding
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
            Assignment Job Board
          </h1>
          <p className="mt-2 text-base text-muted-foreground max-w-2xl">
            Post an assignment to receive bids from top students, or submit proposals if you are an
            approved academic helper.
          </p>
        </div>

        <Link href="/assignments/create">
          <Button className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20 font-semibold gap-2">
            <Plus className="h-4 w-4" /> Post an Assignment
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="mb-8 rounded-2xl border border-border/60 bg-card p-4 shadow-sm backdrop-blur-sm sm:p-5">
        <div className="grid gap-3 sm:grid-cols-12">
          {/* Keyword Search */}
          <div className="relative sm:col-span-5">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by topic, course, or assignment title..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Campus Proximity Filter */}
          <div className="relative sm:col-span-4">
            <MapPin className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by campus (e.g. DU, BUET, BRAC)..."
              className="pl-9"
              value={preferredCampus}
              onChange={(e) => setPreferredCampus(e.target.value)}
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="sm:col-span-3">
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="deadline">Urgent Deadline First</option>
              <option value="budget_desc">Highest Budget</option>
              <option value="budget_asc">Lowest Budget</option>
              <option value="bids">Most Proposals</option>
            </select>
          </div>
        </div>

        {/* Deliverable Type Filter Pills */}
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/40 pt-3 text-xs">
          <span className="text-xs text-muted-foreground font-medium mr-2">Deliverable:</span>
          <button
            type="button"
            onClick={() => setType("")}
            className={`rounded-full px-3 py-1 font-medium transition-colors ${
              type === ""
                ? "bg-indigo-600 text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            All Types
          </button>
          <button
            type="button"
            onClick={() => setType("SOFTCOPY")}
            className={`rounded-full px-3 py-1 font-medium transition-colors ${
              type === "SOFTCOPY"
                ? "bg-indigo-600 text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <FileText className="inline-block mr-1 h-3 w-3" /> Softcopy Digital
          </button>
          <button
            type="button"
            onClick={() => setType("HARDCOPY")}
            className={`rounded-full px-3 py-1 font-medium transition-colors ${
              type === "HARDCOPY"
                ? "bg-purple-600 text-white"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            <PenTool className="inline-block mr-1 h-3 w-3" /> Hardcopy Handwritten
          </button>
        </div>
      </div>

      {/* Results Header */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing <span className="font-semibold text-foreground">{assignments.length}</span> open
          assignments
        </p>
      </div>

      {/* Assignment List */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 p-8 text-center">
          <Briefcase className="h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 text-lg font-semibold">No open assignments found</h3>
          <p className="mt-1 text-sm text-muted-foreground max-w-sm">
            Be the first to post an assignment request and get proposals from verified campus helpers.
          </p>
          <Link href="/assignments/create" className="mt-5">
            <Button size="sm" className="bg-indigo-600 text-white">
              Post an Assignment
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const deadlineDate = new Date(assignment.deadline);
            const daysLeft = Math.ceil(
              (deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
            );

            return (
              <Card
                key={assignment.id}
                className="group border-border/70 p-6 transition-all hover:border-indigo-500/50 hover:shadow-md"
              >
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
                  <div className="space-y-2 max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {assignment.subject}
                      </span>
                      {assignment.type === "HARDCOPY" ? (
                        <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-semibold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                          <PenTool className="h-3 w-3" /> Hardcopy
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <FileText className="h-3 w-3" /> Softcopy
                        </span>
                      )}
                      {assignment.preferredCampus && (
                        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {assignment.preferredCampus}
                        </span>
                      )}
                    </div>

                    <Link href={`/assignments/${assignment.id}`}>
                      <h2 className="text-lg font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {assignment.title}
                      </h2>
                    </Link>

                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                      {assignment.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2">
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                        <Clock className="h-3.5 w-3.5" />
                        {daysLeft > 0 ? `${daysLeft} days left` : "Due today / urgent"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {assignment.bidsCount} Proposals
                      </span>
                      <span>Posted by {assignment.customer?.name || "Student"}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-start md:items-end justify-between self-stretch shrink-0">
                    <div className="text-left md:text-right">
                      <span className="text-xs text-muted-foreground block">Budget Range</span>
                      <span className="text-xl font-extrabold text-foreground">
                        ৳{assignment.budgetMin} - ৳{assignment.budgetMax}
                      </span>
                    </div>

                    <Link href={`/assignments/${assignment.id}`} className="mt-4 md:mt-0">
                      <Button size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700 gap-1 text-xs">
                        View & Bid <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
