export type SupportedLanguage = "en" | "bn";

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", flag: "🇺🇸" },
  { code: "bn", label: "বাংলা", flag: "🇧🇩" },
];

/** Shared UI strings used across many pages. */
export interface CommonDictionary {
  loading: string;
  error: string;
  retry: string;
  back: string;
  continue: string;
  cancel: string;
  save: string;
  delete: string;
  edit: string;
  search: string;
  searchPlaceholder: string;
  noResults: string;
  submit: string;
  sending: string;
  success: string;
  warning: string;
  info: string;
  close: string;
  view: string;
  apply: string;
  join: string;
  explore: string;
}

/** Navigation items from navigation-data.ts (mega-menu titles + descriptions). */
export interface NavItemsDictionary {
  hireAssistance: string;
  hireAssistanceDesc: string;
  findWork: string;
  findWorkDesc: string;
  resources: string;
  resourcesDesc: string;
  exploreAllServices: string;
  postAssignment: string;
  viewJobBoard: string;
  academicGigsCatalog: string;
  createGigPackage: string;
  handwritingMatcher: string;
  activeOrdersContracts: string;
  assistantWalletPayouts: string;
  becomeVerifiedAssistant: string;
  studyGuides: string;
  membershipPricing: string;
  howItWorks: string;
  aboutUs: string;
  contact: string;
  badgeMembers: string;
  badgeHelpers: string;
  badgeSignin: string;
}

/** Home page sections (hero, features, stats, cta already in root). */
export interface HomeDictionary {
  heroBadge: string;
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroDescription: string;
  heroGetStarted: string;
  heroExploreServices: string;
  heroFindHelpers: string;
  heroTrustPlatform: string;
  heroTrustDirect: string;
  heroSearchPlaceholder: string;
  heroSearchButton: string;
  heroCategoryAcademic: string;
  heroCategoryCreative: string;
  heroCategoryDigital: string;
  heroServiceGetWork: string;
  heroServiceGetWorkDesc: string;
  heroServiceMeetHelpers: string;
  heroServiceMeetHelpersDesc: string;
  heroTrustWork: string;
  heroTrustWorkDesc: string;
  heroYourNextStep: string;
  heroYourNextStepDesc: string;
  marketplaceVerifiedHelper: string;
  marketplaceTopRated: string;
  marketplaceFixedPrice: string;
  marketplaceExploreAll: string;
  marketplaceLiveJobBoard: string;
  marketplaceUrgentRequests: string;
  marketplacePostProject: string;
  marketplacePlaceBids: string;
  marketplacePostAssignment: string;
  marketplaceViewJobBoard: string;
  marketplaceHardcopy: string;
  marketplaceDigital: string;
  marketplaceBids: string;
  marketplaceStudentBudget: string;
  marketplaceViewBid: string;
  marketplaceMatcherBadge: string;
  marketplaceMatcherTitle: string;
  marketplaceMatcherDesc: string;
  marketplaceLaunchMatcher: string;
  securityBadge: string;
  securityTitle: string;
  securityDesc: string;
  ctaTitle: string;
  ctaDesc: string;
  ctaButton: string;
}

/** About page. */
export interface AboutDictionary {
  badge: string;
  title: string;
  subtitle: string;
  missionTitle: string;
  whyFounded: string;
  para1: string;
  para2: string;
  para3: string;
  exploreServices: string;
  becomeHelper: string;
  standardTitle: string;
  standardSubtitle: string;
  zeroLoss: string;
  zeroLossBold: string;
  authenticHandwriting: string;
  authenticHandwritingBold: string;
  campusProximity: string;
  campusProximityBold: string;
  zeroLeakage: string;
  zeroLeakageBold: string;
  pillarsTitle: string;
  pillarsDesc: string;
  campusNetworkTitle: string;
  campusNetworkSubtitle: string;
  universitiesConnected: string;
  advisoryTitle: string;
  advisorySubtitle: string;
  readyTitle: string;
  readyDesc: string;
  browseServices: string;
  postAssignment: string;
}

/** Auth pages. */
export interface AuthPagesDictionary {
  loginWelcome: string;
  loginSubtitle: string;
  registerCreate: string;
  registerSubtitle: string;
}

/** Dashboard. */
export interface DashboardDictionary {
  welcomeBack: string;
  dashboardTitle: string;
  myOrders: string;
  myWallet: string;
  liveChat: string;
  becomeHelper: string;
  verificationRequired: string;
  completeApplication: string;
  applicationUnderReview: string;
  applicationApproved: string;
  applicationRejected: string;
}

/** Vendor. */
export interface VendorDictionary {
  applyTitle: string;
  applySubtitle: string;
  verifiedRealName: string;
  university: string;
  department: string;
  academicLevel: string;
  degree: string;
  passingYear: string;
  skills: string;
  bio: string;
  idCardUrl: string;
  handwritingSamples: string;
  sampleStyle: string;
  neatnessScore: string;
  sampleDescription: string;
  addSample: string;
  submitApplication: string;
  reSubmitApplication: string;
  applying: string;
  successMessage: string;
}

/** Errors. */
export interface ErrorsDictionary {
  generic: string;
  network: string;
  unauthorized: string;
  notFound: string;
  validation: string;
  server: string;
  tryAgain: string;
}

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
  common: CommonDictionary;
  navItems: NavItemsDictionary;
  home: HomeDictionary;
  aboutPages: AboutDictionary;
  authPages: AuthPagesDictionary;
  dashboard: DashboardDictionary;
  vendor: VendorDictionary;
  errors: ErrorsDictionary;
}
