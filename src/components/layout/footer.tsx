"use client";

import Link from "next/link";
import { GraduationCap, ShieldCheck, Lock, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/components/providers/language-provider";
import { useSession } from "@/lib/auth-client";

export function Footer() {
  const { t } = useLanguage();
  const { data: session } = useSession();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-border/50 bg-background/95 text-foreground/80">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-8 lg:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4 lg:gap-12">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 text-white shadow-md shadow-indigo-500/25">
                <GraduationCap className="h-5 w-5 stroke-[2.2]" />
              </div>
              <span className="text-xl font-black tracking-tight font-mono">
                Kore<span className="text-indigo-600 dark:text-indigo-400">Dao</span>
              </span>
            </Link>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Bangladesh&apos;s trusted academic freelance ecosystem. Connecting students with verified peer helpers from BUET, DU, IUT, and SUST with 100% escrow protection.
            </p>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 pt-1">
              <ShieldCheck className="h-4 w-4" />
              <span>100% Bank-Grade Escrow Vault</span>
            </div>
          </div>

          {/* Marketplace Discovery */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase text-foreground mb-4 font-mono">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/gigs" className="text-muted-foreground hover:text-foreground transition-colors">
                  Services & Gigs Catalog
                </Link>
              </li>
              <li>
                <Link href="/assignments" className="text-muted-foreground hover:text-foreground transition-colors">
                  Assignment Job Board
                </Link>
              </li>
              <li>
                <Link href="/helpers" className="text-muted-foreground hover:text-foreground transition-colors">
                  Find Academic Helpers
                </Link>
              </li>
              <li>
                <Link href="/handwriting-matcher" className="text-muted-foreground hover:text-foreground transition-colors">
                  Handwriting Style Matcher
                </Link>
              </li>
              <li>
                <Link href="/assignments/create" className="text-muted-foreground hover:text-foreground transition-colors">
                  Post an Assignment Brief
                </Link>
              </li>
            </ul>
          </div>

          {/* Student & Helper Portals */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase text-foreground mb-4 font-mono">
              Workspace & Accounts
            </h4>
            <ul className="space-y-2.5 text-sm">
              {session?.user ? (
                <>
                  <li>
                    <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                      Personalized Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/orders" className="text-muted-foreground hover:text-foreground transition-colors">
                      My Orders & Escrow
                    </Link>
                  </li>
                  <li>
                    <Link href="/messages" className="text-muted-foreground hover:text-foreground transition-colors">
                      Live Chat Workspace
                    </Link>
                  </li>
                  <li>
                    <Link href="/vendor/wallet" className="text-muted-foreground hover:text-foreground transition-colors">
                      Helper Wallet & Payouts
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li>
                    <Link href="/login" className="text-muted-foreground hover:text-foreground transition-colors">
                      Sign In to Workspace
                    </Link>
                  </li>
                  <li>
                    <Link href="/register" className="text-muted-foreground hover:text-foreground transition-colors">
                      Create Student Account
                    </Link>
                  </li>
                  <li>
                    <Link href="/vendor/apply" className="text-muted-foreground hover:text-foreground transition-colors">
                      Become a Verified Helper
                    </Link>
                  </li>
                </>
              )}
              <li>
                <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                  About KoreDao
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                  Support & Arbitration
                </Link>
              </li>
            </ul>
          </div>

          {/* Campus Network & Trust */}
          <div>
            <h4 className="text-sm font-semibold tracking-wider uppercase text-foreground mb-4 font-mono">
              Campus Coverage
            </h4>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500" />
                <span>BUET — Palashi, Dhaka</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500" />
                <span>DU — Curzon Hall & Nilkhet</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500" />
                <span>IUT — Board Bazar, Gazipur</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500" />
                <span>SUST — Kumargaon, Sylhet</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500" />
                <span>NSU — Bashundhara R/A</span>
              </li>
              <li className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-indigo-500" />
                <span>BRACU — Merul Badda</span>
              </li>
            </ul>
            <div className="mt-4 pt-3 border-t border-border/40 text-[11px] text-muted-foreground">
              Aamarpay & PipraPay secure payment gateways integrated.
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/40 pt-8 sm:flex-row text-xs text-muted-foreground">
          <p>© {currentYear} KoreDao Platform. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-foreground transition-colors">
              Terms & Escrow Policy
            </Link>
            <Link href="/about" className="hover:text-foreground transition-colors">
              Academic Integrity Code
            </Link>
            <Link href="/contact" className="hover:text-foreground transition-colors">
              Campus Ambassador Inquiries
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
