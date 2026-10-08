// export type SupportedLanguage = "en" | "bn" | "es" | "fr" | "de";
export type SupportedLanguage = "en" | "bn";

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "bn", label: "বাংলা", flag: "🇧🇩" },
  // { code: "es", label: "Español", flag: "🇪🇸" },
  // { code: "fr", label: "Français", flag: "🇫🇷" },
  // { code: "de", label: "Deutsch", flag: "🇩🇪" },
];

export interface TranslationDictionary {
  nav: {
    home: string;
    about: string;
    contact: string;
    profile: string;
    login: string;
    register: string;
    dashboard: string;
    signOut: string;
  };
  hero: {
    badge: string;
    titleLine1: string;
    titleLine2: string;
    description: string;
    getStarted: string;
    exploreDocs: string;
    viewGithub: string;
  };
  features: {
    sectionBadge: string;
    sectionTitle: string;
    sectionDesc: string;
    securityTitle: string;
    securityDesc: string;
    performanceTitle: string;
    performanceDesc: string;
    authTitle: string;
    authDesc: string;
    seoTitle: string;
    seoDesc: string;
    backendTitle: string;
    backendDesc: string;
    scaleTitle: string;
    scaleDesc: string;
  };
  stats: {
    securityScore: string;
    securityScoreLabel: string;
    typeCoverage: string;
    typeCoverageLabel: string;
    lighthouseScore: string;
    lighthouseScoreLabel: string;
    productionReady: string;
    productionReadyLabel: string;
  };
  cta: {
    title: string;
    desc: string;
    button: string;
  };
  footer: {
    tagline: string;
    product: string;
    resources: string;
    legal: string;
    rights: string;
    privacy: string;
    terms: string;
    security: string;
  };
  auth: {
    welcomeBack: string;
    loginSubtitle: string;
    createAccount: string;
    registerSubtitle: string;
    emailLabel: string;
    passwordLabel: string;
    nameLabel: string;
    confirmPasswordLabel: string;
    rememberMe: string;
    forgotPassword: string;
    signInBtn: string;
    signUpBtn: string;
    orContinueWith: string;
    fillDemoUser: string;
    fillDemoAdmin: string;
    dontHaveAccount: string;
    alreadyHaveAccount: string;
    termsAgree: string;
  };
  contact: {
    title: string;
    subtitle: string;
    name: string;
    email: string;
    category: string;
    subject: string;
    message: string;
    sendButton: string;
    fillDemoData: string;
    successMessage: string;
    directContact: string;
    responseTime: string;
  };
  about: {
    badge: string;
    title: string;
    subtitle: string;
    missionTitle: string;
    missionDesc: string;
    principlesTitle: string;
    stackTitle: string;
    teamTitle: string;
  };
}
