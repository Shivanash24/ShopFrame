/**
 * billing.callback.jsx
 *
 * Shopify redirects the merchant here after they approve or decline
 * a subscription on the Shopify payment approval page.
 *
 * Flow:
 *   1. billing.check() verifies whether the subscription is now ACTIVE on Shopify
 *   2. Save result to DB
 *   3. Redirect to pricing page with success/cancel query param
 */
import { redirect } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import prisma from "../db.server";
import { PLAN_BASIC, PLAN_PRO, PLAN_PLATINUM } from "../shopify.server";

const ALL_PLANS = [PLAN_BASIC, PLAN_PRO, PLAN_PLATINUM];

export const loader = async ({ request }) => {
  const { billing, session } = await authenticate.admin(request);

  try {
    // Ask Shopify whether any of our plans are now active for this shop
    const billingCheck = await billing.check({
      plans: ALL_PLANS,
      isTest: true,
    });

    if (billingCheck.hasActivePayment) {
      // Find which plan is active
      const activePlan = billingCheck.appSubscriptions?.[0];
      const planName = activePlan?.name || null;
      const subscriptionId = activePlan?.id || null;
      const currentPeriodEnd = activePlan?.currentPeriodEnd
        ? new Date(activePlan.currentPeriodEnd)
        : null;

      if (planName && ALL_PLANS.includes(planName)) {
        await prisma.subscription.upsert({
          where: { shop: session.shop },
          create: {
            shop: session.shop,
            plan: planName,
            status: "ACTIVE",
            subscriptionId,
            currentPeriodEnd,
          },
          update: {
            plan: planName,
            status: "ACTIVE",
            subscriptionId,
            currentPeriodEnd,
          },
        });

        return redirect("/app/pricing?billingStatus=success");
      }
    }

    // If no active payment found (merchant cancelled on Shopify page)
    return redirect("/app/pricing?billingStatus=cancelled");
  } catch (error) {
    console.error("Billing callback error:", error);
    return redirect("/app/pricing?billingStatus=error");
  }
};

// Also handle POST (some Shopify redirect flows use POST)
export const action = loader;
