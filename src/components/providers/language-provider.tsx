"use client";

import React, { createContext, useContext, useSyncExternalStore } from "react";
import { SupportedLanguage, TranslationDictionary } from "@/i18n/types";
import en from "@/i18n/dictionaries/en.json";
import bn from "@/i18n/dictionaries/bn.json";

const dictionaries: Record<SupportedLanguage, TranslationDictionary> = {
  en: en as TranslationDictionary,
  bn: bn as TranslationDictionary,
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationDictionary;
  formatDate: (date: Date | string, options?: Intl.DateTimeFormatOptions) => string;
  formatNumber: (number: number, options?: Intl.NumberFormatOptions) => string;
  formatCurrency: (amount: number, options?: Intl.NumberFormatOptions) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: en as TranslationDictionary,
  formatDate: (d) => new Date(d).toLocaleDateString("en-US"),
  formatNumber: (n) => n.toLocaleString("en-US"),
  formatCurrency: (n) => n.toLocaleString("en-US", { style: "currency", currency: "BDT" }),
});

let currentLang: SupportedLanguage = "en";
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(initialLocale?: SupportedLanguage): SupportedLanguage {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("preferred-language") as SupportedLanguage;
      if (stored && dictionaries[stored]) {
        currentLang = stored;
        return stored;
      }
    } catch {
      // LocalStorage access restricted
    }
  }
  return initialLocale || currentLang;
}

function getServerSnapshot(): SupportedLanguage {
  return "en";
}

export function LanguageProvider({
  children,
  initialLocale,
}: {
  children: React.ReactNode;
  initialLocale?: SupportedLanguage;
}) {
  const language = useSyncExternalStore(
    () => subscribe(() => {}),
    () => getSnapshot(initialLocale),
    getServerSnapshot
  );

  const setLanguage = (lang: SupportedLanguage) => {
    currentLang = lang;
    try {
      localStorage.setItem("preferred-language", lang);
      document.documentElement.lang = lang;
      document.documentElement.dir = "ltr";
    } catch {
      // Ignore storage errors
    }
    listeners.forEach((listener) => listener());
  };

  const t = dictionaries[language] || dictionaries.en;

  // Locale-aware formatters
  const bnLocale = "bn-BD";
  const enLocale = "en-US";

  const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
    const locale = language === "bn" ? bnLocale : enLocale;
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
      ...options,
    };
    return new Date(date).toLocaleDateString(locale, defaultOptions);
  };

  const formatNumber = (number: number, options?: Intl.NumberFormatOptions): string => {
    const locale = language === "bn" ? bnLocale : enLocale;
    return number.toLocaleString(locale, options);
  };

  const formatCurrency = (amount: number, options?: Intl.NumberFormatOptions): string => {
    const locale = language === "bn" ? bnLocale : enLocale;
    const defaultOptions: Intl.NumberFormatOptions = {
      style: "currency",
      currency: "BDT",
      ...options,
    };
    return amount.toLocaleString(locale, defaultOptions);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatDate, formatNumber, formatCurrency }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
