/**
 * billing.callback.jsx
 *
 * Shopify redirects the merchant here after they approve or decline
 * a subscription on the Shopify payment approval page.
 *
 * Uses safeBillingCheck() so a 403 never crashes this route.
 */
import { redirect } from "@remix-run/node";
import { authenticate, PLAN_BASIC, PLAN_PRO, PLAN_PLATINUM } from "../shopify.server";
import { safeBillingCheck } from "../billing.server";
import prisma from "../db.server";

const ALL_PLANS = [PLAN_BASIC, PLAN_PRO, PLAN_PLATINUM];

export const loader = async ({ request }) => {
  const { billing, session } = await authenticate.admin(request);

  try {
    const billingCheck = await safeBillingCheck(billing, ALL_PLANS);

    if (!billingCheck.available) {
      // Billing API unavailable (Custom App) — can't verify, just redirect
      return redirect("/app/pricing?billingStatus=error");
    }

    if (billingCheck.hasActivePayment) {
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

    // Merchant cancelled on Shopify's approval page — revert PENDING
    await prisma.subscription.upsert({
      where: { shop: session.shop },
      create: { shop: session.shop, plan: "FREE", status: "ACTIVE" },
      update: { plan: "FREE", status: "ACTIVE", subscriptionId: null },
    }).catch(() => {});

    return redirect("/app/pricing?billingStatus=cancelled");
  } catch (error) {
    console.error("Billing callback error:", error);
    return redirect("/app/pricing?billingStatus=error");
  }
};

// Some Shopify redirect flows POST back to the return URL
export const action = loader;
