"use client";

import * as React from "react";
import { Globe } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/components/providers/language-provider";
import { SUPPORTED_LANGUAGES, SupportedLanguage } from "@/i18n/types";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  const currentOption =
    SUPPORTED_LANGUAGES.find((opt) => opt.code === language) ||
    SUPPORTED_LANGUAGES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "h-9 px-2.5 rounded-md border border-border/40 hover:bg-accent/60 gap-1.5 text-xs font-medium transition-colors cursor-pointer"
        )}
        aria-label="Select language"
      >
        <span className="text-sm leading-none">{currentOption.flag}</span>
        <span className="hidden sm:inline-block uppercase tracking-wider">{currentOption.code}</span>
        <Globe className="h-3.5 w-3.5 text-muted-foreground ml-0.5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        {SUPPORTED_LANGUAGES.map((opt) => (
          <DropdownMenuItem
            key={opt.code}
            onClick={() => setLanguage(opt.code as SupportedLanguage)}
            className={`flex items-center justify-between cursor-pointer ${language === opt.code ? "bg-accent/80 font-semibold text-primary" : ""
              }`}
          >
            <span className="flex items-center gap-2">
              <span className="text-base">{opt.flag}</span>
              <span>{opt.label}</span>
            </span>
            <span className="text-[10px] text-muted-foreground uppercase">{opt.code}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
