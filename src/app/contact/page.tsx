"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Mail,
  Building2,
  Clock,
  Send,
  Sparkles,
  CheckCircle,
  HelpCircle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { contactSchema, ContactInput } from "@/lib/schemas/contact.schema";
import { useLanguage } from "@/components/providers/language-provider";

export default function ContactPage() {
  const { t } = useLanguage();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submittedData, setSubmittedData] = React.useState<{ referenceId: string; receivedAt: string } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      category: "general",
      subject: "",
      message: "",
    },
  });

  // Demo Data quick filler for rapid testing
  const handleFillDemoData = () => {
    setValue("name", "Jordan Hayes");
    setValue("email", "jordan.hayes@enterprise-cloud.io");
    setValue("category", "security");
    setValue("subject", "Enterprise SOC2 Compliance Audit Consultation");
    setValue(
      "message",
      "We are evaluating the NextEnterprise starter paired with your NestJS backend for our healthcare data infrastructure. We would love to discuss custom CSP policies and correlation tracing."
    );
    toast.info("Demo inquiry details populated into form.");
  };

  const onSubmit = async (data: ContactInput) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to submit inquiry");
      }

      setSubmittedData({
        referenceId: result.data.referenceId,
        receivedAt: result.data.receivedAt,
      });

      toast.success("Inquiry securely transmitted!", {
        description: `Ticket Reference: ${result.data.referenceId}`,
      });
      reset();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Please check your network and retry.";
      toast.error("Transmission failed", {
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-16 sm:px-8 space-y-16">
      {/* Top Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <Badge variant="outline" className="px-3 py-1 text-xs font-mono uppercase tracking-wider text-indigo-500 border-indigo-500/30">
          Direct Channels
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          {t.contact.title}
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {t.contact.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Contact Form with Demo Data */}
        <div className="lg:col-span-7">
          <Card className="border border-border/60 bg-card/70 backdrop-blur-md shadow-md">
            <CardHeader className="space-y-2 border-b border-border/40 pb-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-xl font-bold text-foreground">
                  Send a Secure Message
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleFillDemoData}
                    className="gap-1.5 text-xs font-mono border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>{t.contact.fillDemoData}</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => reset()}
                    title="Reset Form"
                    className="h-8 w-8 text-muted-foreground"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <CardDescription className="text-xs text-muted-foreground">
                All transmissions are validated via Zod schemas and protected with correlation identifiers.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              {submittedData && (
                <div className="mb-6 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 space-y-2">
                  <div className="flex items-center gap-2 font-semibold text-sm">
                    <CheckCircle className="h-4 w-4" />
                    <span>Inquiry Registered Successfully</span>
                  </div>
                  <p className="text-xs font-mono">
                    Tracking Reference: <strong>{submittedData.referenceId}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Timestamp: {new Date(submittedData.receivedAt).toLocaleString()}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name Field */}
                  <div className="space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-medium">
                      {t.contact.name} *
                    </Label>
                    <Input
                      id="name"
                      placeholder="e.g. Jordan Hayes"
                      {...register("name")}
                      className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    {errors.name && (
                      <p className="text-xs text-destructive">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium">
                      {t.contact.email} *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      {...register("email")}
                      className={errors.email ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Category Field */}
                  <div className="space-y-1.5">
                    <Label htmlFor="category" className="text-xs font-medium">
                      {t.contact.category} *
                    </Label>
                    <select
                      id="category"
                      {...register("category")}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="general">General Inquiries</option>
                      <option value="sales">Architecture & Licensing</option>
                      <option value="security">Security & Vulnerability Disclosure</option>
                      <option value="support">Technical Integration Help</option>
                    </select>
                    {errors.category && (
                      <p className="text-xs text-destructive">{errors.category.message}</p>
                    )}
                  </div>

                  {/* Subject Field */}
                  <div className="space-y-1.5">
                    <Label htmlFor="subject" className="text-xs font-medium">
                      {t.contact.subject} *
                    </Label>
                    <Input
                      id="subject"
                      placeholder="Inquiry topic"
                      {...register("subject")}
                      className={errors.subject ? "border-destructive focus-visible:ring-destructive" : ""}
                    />
                    {errors.subject && (
                      <p className="text-xs text-destructive">{errors.subject.message}</p>
                    )}
                  </div>
                </div>

                {/* Message Field */}
                <div className="space-y-1.5">
                  <Label htmlFor="message" className="text-xs font-medium">
                    {t.contact.message} *
                  </Label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Provide specific details regarding your inquiry..."
                    {...register("message")}
                    className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                      errors.message ? "border-destructive focus-visible:ring-destructive" : ""
                    }`}
                  />
                  {errors.message && (
                    <p className="text-xs text-destructive">{errors.message.message}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-11 gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all shadow-md shadow-indigo-600/20"
                >
                  {isSubmitting ? (
                    <span>Encrypting & Sending...</span>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>{t.contact.sendButton}</span>
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Direct Channels & Help FAQ */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="border border-border/60 bg-card/60 shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base font-bold text-foreground">
                {t.contact.directContact}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Direct points of contact for developers, auditors, and security teams.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/40">
                <Mail className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                    Security Operations Center
                  </h4>
                  <a href="mailto:security@nexcenterprise.internal" className="text-sm font-medium text-indigo-500 hover:underline">
                    security@nextenterprise.internal
                  </a>
                  <p className="text-[11px] text-muted-foreground">PGP Key available upon request for zero-trust disclosure.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/40">
                <Clock className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                    SLA Guarantees
                  </h4>
                  <p className="text-sm font-medium text-foreground">{t.contact.responseTime}</p>
                  <p className="text-[11px] text-muted-foreground">24/7 incident response for certified enterprise clusters.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/40 border border-border/40">
                <Building2 className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                    Engineering Headquarters
                  </h4>
                  <p className="text-sm text-foreground">One Market Plaza, Suite 300</p>
                  <p className="text-xs text-muted-foreground">San Francisco, CA 94105</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick FAQ Box */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-5 space-y-3">
            <h4 className="text-sm font-bold font-mono uppercase text-foreground flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-indigo-500" />
              Frequently Asked Questions
            </h4>
            <div className="space-y-2.5 text-xs text-muted-foreground">
              <div>
                <strong className="text-foreground block">How do I pair with the NestJS backend?</strong>
                Configure <code className="text-[11px] bg-background px-1 py-0.5 rounded">NEXT_PUBLIC_BACKEND_URL</code> in <code className="text-[11px] bg-background px-1 py-0.5 rounded">.env</code> to point to NestJS (e.g. port 3000).
              </div>
              <div>
                <strong className="text-foreground block">Are CSP headers applied to all routes?</strong>
                Yes, our edge middleware and <code className="text-[11px] bg-background px-1 py-0.5 rounded">next.config.ts</code> apply defense-in-depth headers automatically.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
