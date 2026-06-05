/**
 * plans.js — Shared plan constants and access-control helpers.
 *
 * This file has NO ".server" in its name intentionally so it can be safely
 * imported by both server-side loaders AND client-side components.
 *
 * Do NOT import any server-only modules (shopify.server, db.server, etc.) here.
 */

export const PLAN_BASIC = "PLAN_BASIC";
export const PLAN_PRO = "PLAN_PRO";
export const PLAN_PLATINUM = "PLAN_PLATINUM";

/**
 * Numeric rank for each plan. Higher = more access.
 */
export const PLAN_LEVELS = {
  FREE: 0,
  PLAN_BASIC: 1,
  PLAN_PRO: 2,
  PLAN_PLATINUM: 3,
};

/**
 * Returns true if `activePlan` grants access to content requiring `requiredTier`.
 * FREE tier content is always accessible.
 *
 * @param {string} activePlan  - The user's current plan (e.g. "PLAN_PRO")
 * @param {string} requiredTier - The tier required by the template/feature
 */
export function canAccessTier(activePlan, requiredTier) {
  if (requiredTier === "FREE") return true;
  const userLevel = PLAN_LEVELS[activePlan] ?? 0;
  const requiredLevel = PLAN_LEVELS[requiredTier] ?? 0;
  return userLevel >= requiredLevel;
}

/** All paid plan names as an array (useful for billing.check calls). */
export const ALL_PAID_PLANS = [PLAN_BASIC, PLAN_PRO, PLAN_PLATINUM];

/** Ordered from lowest to highest for upgrade/downgrade UI logic. */
export const PLAN_ORDER = ["FREE", PLAN_BASIC, PLAN_PRO, PLAN_PLATINUM];

/** Human-readable display name for each plan ID. */
export function getPlanDisplayName(planId) {
  switch (planId) {
    case PLAN_BASIC: return "Basic";
    case PLAN_PRO: return "Pro";
    case PLAN_PLATINUM: return "Platinum";
    default: return "Free";
  }
}
