"use client";

import { ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function SecurityShowcase() {
  const securityControls = [
    {
      category: "100% Bank-Grade Escrow Protection",
      icon: ShieldCheck,
      badge: "Financial Shield",
      items: [
        {
          name: "Upfront Escrow Locking",
          feature: "Aamarpay & PipraPay secure holding",
          protection: "Helpers cannot request payment without delivering verified project files.",
        },
        {
          name: "72-Hour Review Guarantee",
          feature: "Mandatory student inspection window",
          protection: "Inspect proofs, graphs, and handwriting before funds release to the helper.",
        },
        {
          name: "Dispute Arbitration Engine",
          feature: "Admin dispute mediation & refund logic",
          protection: "Full refund guarantee if work does not match agreed specifications.",
        },
      ],
    },
    {
      category: "Zero-Leakage AI Safety & Privacy",
      icon: Lock,
      badge: "Privacy Shield",
      items: [
        {
          name: "Off-Platform Scam Blocker",
          feature: "Real-time AI contact leakage detection",
          protection: "Phone numbers and WhatsApp leaks are flagged to keep escrow valid.",
        },
        {
          name: "Student Identity Confidentiality",
          feature: "Pseudonymous student profiles",
          protection: "Your university roll number and personal data remain 100% private.",
        },
        {
          name: "Isolated Order Workspaces",
          feature: "Socket.io room isolation & encrypted chats",
          protection: "Chat messages and attachments are confined to authorized participants.",
        },
      ],
    },
    {
      category: "Helper Verification & Authenticity",
      icon: CheckCircle2,
      badge: "Academic Vetting",
      items: [
        {
          name: "Student ID Card Verification",
          feature: "Admin-reviewed institutional badges",
          protection: "Helpers must prove active enrollment at BUET, DU, IUT, SUST, etc.",
        },
        {
          name: "Handwriting Sample Auditing",
          feature: "High-resolution photo proof checks",
          protection: "Guarantees helper's cursive or equation style matches your notebook.",
        },
        {
          name: "Progressive Milestone Tracking",
          feature: "Draft checks & Steadfast courier tracking",
          protection: "Review early drafts and track physical deliveries in real-time.",
        },
      ],
    },
  ];

  return (
    <section className="py-20 border-t border-border/40 bg-muted/10">
      <div className="container mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          <Badge variant="outline" className="px-3 py-1 text-xs font-mono uppercase tracking-wider text-emerald-500 border-emerald-500/30">
            KoreDao Trust & Safety
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground max-w-3xl">
            Bank-Grade Escrow & Student Privacy Protection
          </h2>
          <p className="text-muted-foreground max-w-2xl text-base">
            Every transaction, milestone checkpoint, and conversation on KoreDao is safeguarded by strict multi-layer academic integrity and escrow protocols.
          </p>
        </div>

        <div className="space-y-8 max-w-5xl mx-auto">
          {securityControls.map((group, groupIdx) => {
            const GroupIcon = group.icon;
            return (
              <div
                key={groupIdx}
                className="rounded-xl border border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden shadow-sm hover:border-indigo-500/40 transition-colors"
              >
                <div className="bg-muted/40 px-6 py-3.5 border-b border-border/50 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
                      <GroupIcon className="h-4 w-4" />
                    </div>
                    <h3 className="text-sm font-bold text-foreground">
                      {group.category}
                    </h3>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono text-emerald-500 border-emerald-500/30">
                    {group.badge}
                  </Badge>
                </div>

                <div className="divide-y divide-border/40">
                  {group.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-0.5 md:w-1/3">
                        <span className="font-bold text-foreground block">{item.name}</span>
                        <span className="text-[11px] text-indigo-500 font-medium">{item.feature}</span>
                      </div>
                      <div className="md:w-2/3 text-muted-foreground flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span>{item.protection}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
