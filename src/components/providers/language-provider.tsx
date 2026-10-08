"use client";

import React, { createContext, useContext, useSyncExternalStore } from "react";
import { SupportedLanguage, TranslationDictionary } from "@/i18n/types";
import en from "@/i18n/dictionaries/en.json";
import bn from "@/i18n/dictionaries/bn.json";
// import es from "@/i18n/dictionaries/es.json";
// import fr from "@/i18n/dictionaries/fr.json";
// import de from "@/i18n/dictionaries/de.json";

const dictionaries: Record<SupportedLanguage, TranslationDictionary> = {
  en: en as TranslationDictionary,
  bn: bn as TranslationDictionary,
  // es: es as TranslationDictionary,
  // fr: fr as TranslationDictionary,
  // de: de as TranslationDictionary,
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: TranslationDictionary;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => { },
  t: en as TranslationDictionary,
});

let currentLang: SupportedLanguage = "en";
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function getSnapshot(): SupportedLanguage {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem("preferred-language") as SupportedLanguage;
      if (stored && dictionaries[stored]) {
        currentLang = stored;
      }
    } catch {
      // LocalStorage access restricted
    }
  }
  return currentLang;
}

function getServerSnapshot(): SupportedLanguage {
  return "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const language = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLanguage = (lang: SupportedLanguage) => {
    currentLang = lang;
    try {
      localStorage.setItem("preferred-language", lang);
      document.documentElement.lang = lang;
    } catch {
      // Ignore storage errors
    }
    listeners.forEach((listener) => listener());
  };

  const t = dictionaries[language] || dictionaries.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
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
