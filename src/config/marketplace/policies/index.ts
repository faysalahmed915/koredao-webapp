// src/config/marketplace/policies/index.ts

export type { ServicePolicy, ServicePolicyMap } from "../types";
export {
  SERVICE_TYPE_POLICIES,
  DEFAULT_SERVICE_POLICY,
  CONDITIONAL_SERVICE_CONDITIONS,
  PROHIBITED_SERVICE_TYPES,
  MODERATION_REVIEW_SERVICE_TYPES,
} from "./academic-integrity";
export {
  CATEGORY_DEFAULT_POLICY,
  resolveServicePolicy,
  conditionalServiceConditions,
  annotateCategoriesWithPolicy,
} from "./service-restrictions";
