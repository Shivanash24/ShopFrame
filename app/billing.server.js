/**
 * billing.server.js
 *
 * Safe wrapper around Shopify's Billing API calls.
 *
 * WHY THIS EXISTS:
 * Shopify's Billing API returns HTTP 403 Forbidden when:
 *   - The app is a Custom App (not listed in the Shopify App Store)
 *   - The app does not yet have billing permissions approved by Shopify
 *   - The app is in development and billing isn't enabled in Partners Dashboard
 *
 * These wrappers catch that 403 cleanly so the app never crashes,
 * while making the billing-unavailable state explicit and distinguishable
 * from a genuine "subscription is active" state.
 *
 * IMPORTANT: When billing is unavailable, we do NOT silently grant access.
 * We fall back to whatever is in the database (which defaults to FREE).
 */

const BILLING_UNAVAILABLE_CODES = [403];

/**
 * Returns true if the error is a Shopify 403 billing-unavailable error.
 */
function isBillingUnavailable(error) {
  return (
    error?.networkStatusCode === 403 ||
    error?.response?.code === 403 ||
    (typeof error?.message === "string" &&
      (error.message.includes("Forbidden") ||
        error.message.includes("403")))
  );
}

/**
 * Safely call billing.check().
 *
 * Returns:
 *   { available: true,  hasActivePayment: bool, appSubscriptions: [...] }
 *   { available: false, hasActivePayment: false, appSubscriptions: [] }
 */
export async function safeBillingCheck(billing, plans) {
  try {
    const result = await billing.check({ plans, isTest: true });
    return {
      available: true,
      hasActivePayment: result.hasActivePayment ?? false,
      appSubscriptions: result.appSubscriptions ?? [],
    };
  } catch (error) {
    if (isBillingUnavailable(error)) {
      console.warn(
        "[ShopFrame] Shopify Billing API unavailable (403). " +
          "This app is likely a Custom App or billing isn't enabled in the Shopify Partners Dashboard. " +
          "Falling back to database-only subscription tracking."
      );
      return { available: false, hasActivePayment: false, appSubscriptions: [] };
    }
    // Re-throw any unexpected errors
    throw error;
  }
}

/**
 * Safely call billing.request().
 *
 * Returns:
 *   { available: true,  redirect: Response }   → Remix MUST return this to redirect the browser
 *   { available: false, redirect: null }        → Billing not available for this app type
 */
export async function safeBillingRequest(billing, plan, returnUrl) {
  try {
    const redirectResponse = await billing.request({
      plan,
      isTest: true,
      returnUrl,
    });
    return { available: true, redirect: redirectResponse };
  } catch (error) {
    if (isBillingUnavailable(error)) {
      console.warn(
        "[ShopFrame] billing.request() returned 403 — billing unavailable for this app type."
      );
      return { available: false, redirect: null };
    }
    throw error;
  }
}

/**
 * Safely call billing.cancel().
 *
 * Returns:
 *   { available: true,  cancelled: true }
 *   { available: false, cancelled: false }  → Billing not available; DB update still proceeds
 */
export async function safeBillingCancel(billing, subscriptionId) {
  try {
    await billing.cancel({ subscriptionId, isTest: true, prorate: true });
    return { available: true, cancelled: true };
  } catch (error) {
    if (isBillingUnavailable(error)) {
      console.warn(
        "[ShopFrame] billing.cancel() returned 403 — skipping Shopify cancellation, updating DB only."
      );
      return { available: false, cancelled: false };
    }
    // Non-403 errors are logged but not re-thrown (cancel is best-effort)
    console.error("[ShopFrame] billing.cancel() unexpected error:", error.message);
    return { available: false, cancelled: false };
  }
}
