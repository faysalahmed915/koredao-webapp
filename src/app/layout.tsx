import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Fraunces, Geist_Mono, Hanken_Grotesk, Instrument_Serif } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { LanguageProvider } from "@/components/providers/language-provider";
import { MembershipProvider } from "@/components/providers/membership-provider";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config/site";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const fraunces = Fraunces({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});


// const hankenGrotesk = Hanken_Grotesk({
//   variable: "--font-hanken",
//   subsets: ["latin"],
//   display: "swap",
// });

// const instrumentSerif = Instrument_Serif({
//   variable: "--font-instrument",
//   subsets: ["latin"],
//   display: "swap",
//   weight: "400",
//   style: ["normal", "italic"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
//   display: "swap",
// });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - Enterprise Starter`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Next.js 16",
    "App Router",
    "React 19",
    "TypeScript",
    "shadcn/ui",
    "Better-Auth",
    "Zod",
    "Tailwind CSS v4",
    "NestJS",
    "Defense-in-depth",
    "Enterprise Starter",
  ],
  authors: [{ name: siteConfig.author.name, url: siteConfig.author.url }],
  creator: siteConfig.author.name,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    creator: "@NextEnterprise",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fcfdfc" },
    { media: "(prefers-color-scheme: dark)", color: "#0d140f" },
  ],
  width: "device-width",
  initialScale: 1,
};

/**
 * Root layout — providers only.
 *
 * Page chrome is intentionally NOT rendered here. The application has two
 * distinct shells, each owned by a route group:
 *
 * - `app/(site)`      → public marketing header + footer
 * - `app/(dashboard)` → role-aware sidebar shell
 * - `app/(auth)`      → focused, chrome-free authentication pages
 *
 * Keeping the root layout free of header/footer lets the dashboard shell own the
 * full viewport instead of fighting the marketing chrome for space.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${fraunces.variable} ${geistMono.variable}`}
    // className={`${hankenGrotesk.variable} ${instrumentSerif.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-emerald-500/20 selection:text-emerald-950 dark:selection:bg-emerald-500/30 dark:selection:text-emerald-100">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <LanguageProvider>
            <MembershipProvider>
              {children}
              <Toaster position="top-right" richColors />
            </MembershipProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
