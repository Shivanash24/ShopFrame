import { useState } from "react";
import { useLoaderData, useNavigate, useSubmit, useNavigation, useSearchParams } from "@remix-run/react";
import {
  Page,
  Text,
  Card,
  Button,
  BlockStack,
  InlineStack,
  Badge,
  Grid,
  List,
  Banner,
  Spinner,
} from "@shopify/polaris";
import { authenticate, PLAN_BASIC, PLAN_PRO, PLAN_PLATINUM, PLAN_LEVELS } from "../shopify.server";
import prisma from "../db.server";
import { subscriptionPlans } from "../data/templates";

const ALL_PAID_PLANS = [PLAN_BASIC, PLAN_PRO, PLAN_PLATINUM];

export const loader = async ({ request }) => {
  const { billing, session } = await authenticate.admin(request);

  let subscription = null;
  let billingCheckError = null;

  try {
    // Always sync with Shopify first — check if there's a real active subscription
    const billingCheck = await billing.check({
      plans: ALL_PAID_PLANS,
      isTest: true,
    });

    if (billingCheck.hasActivePayment) {
      // Shopify says subscription is active — trust it and sync DB
      const activeSub = billingCheck.appSubscriptions?.[0];
      const planName = activeSub?.name;

      if (planName && ALL_PAID_PLANS.includes(planName)) {
        subscription = await prisma.subscription.upsert({
          where: { shop: session.shop },
          create: {
            shop: session.shop,
            plan: planName,
            status: "ACTIVE",
            subscriptionId: activeSub?.id || null,
            currentPeriodEnd: activeSub?.currentPeriodEnd
              ? new Date(activeSub.currentPeriodEnd)
              : null,
          },
          update: {
            plan: planName,
            status: "ACTIVE",
            subscriptionId: activeSub?.id || null,
            currentPeriodEnd: activeSub?.currentPeriodEnd
              ? new Date(activeSub.currentPeriodEnd)
              : null,
          },
        });
      }
    } else {
      // Shopify says no active subscription — downgrade DB if it was previously set
      const dbSub = await prisma.subscription.findUnique({
        where: { shop: session.shop },
      });

      if (dbSub && dbSub.status === "ACTIVE" && dbSub.plan !== "FREE") {
        // Subscription lapsed on Shopify side — mark as expired in DB
        subscription = await prisma.subscription.update({
          where: { shop: session.shop },
          data: { plan: "FREE", status: "ACTIVE" },
        });
      } else {
        subscription = dbSub;
      }
    }
  } catch (error) {
    // billing.check() can fail for Custom Apps (403). Fall back to DB only.
    console.warn("billing.check() failed, falling back to DB:", error.message);
    billingCheckError = true;
    try {
      subscription = await prisma.subscription.findUnique({
        where: { shop: session.shop },
      });
    } catch (dbError) {
      console.error("DB lookup failed:", dbError);
    }
  }

  return { subscription, billingCheckError };
};

export const action = async ({ request }) => {
  const { billing, session } = await authenticate.admin(request);
  const formData = await request.formData();
  const plan = formData.get("plan");

  if (!plan) {
    throw new Response("Missing plan field", { status: 400 });
  }

  // ── FREE DOWNGRADE ──────────────────────────────────────────────────────────
  if (plan === "FREE") {
    try {
      // Find existing subscription to get the Shopify subscriptionId
      const existing = await prisma.subscription.findUnique({
        where: { shop: session.shop },
      });

      if (existing?.subscriptionId) {
        // Cancel on Shopify's side so the merchant is no longer charged
        try {
          await billing.cancel({
            subscriptionId: existing.subscriptionId,
            isTest: true,
            prorate: true,
          });
        } catch (cancelError) {
          // Log but don't block DB update — Shopify may have already cancelled
          console.warn("billing.cancel() error (non-fatal):", cancelError.message);
        }
      }

      // Update DB to FREE/ACTIVE
      await prisma.subscription.upsert({
        where: { shop: session.shop },
        create: { shop: session.shop, plan: "FREE", status: "ACTIVE" },
        update: { plan: "FREE", status: "ACTIVE", subscriptionId: null },
      });
    } catch (dbError) {
      console.error("DB error during FREE downgrade:", dbError);
      throw new Response("Database error while downgrading plan", { status: 500 });
    }

    return { success: true, message: "Downgraded to Free plan." };
  }

  // ── PAID PLAN UPGRADE ───────────────────────────────────────────────────────
  // We do NOT bypass billing. We call billing.request() which returns a redirect
  // Response that Remix forwards to the browser → merchant sees Shopify approval page.
  try {
    // Mark subscription as PENDING so we know a billing request is in flight
    await prisma.subscription.upsert({
      where: { shop: session.shop },
      create: { shop: session.shop, plan, status: "PENDING" },
      update: { plan, status: "PENDING" },
    });

    // This call returns a redirect Response to Shopify's approval page.
    // We MUST return it so Remix sends the 302 to the browser.
    const redirectUrl = `${process.env.SHOPIFY_APP_URL}/billing/callback`;

    return await billing.request({
      plan,
      isTest: true,
      returnUrl: redirectUrl,
    });
  } catch (error) {
    console.error("billing.request() failed:", error);

    // Revert PENDING status on failure
    try {
      await prisma.subscription.upsert({
        where: { shop: session.shop },
        create: { shop: session.shop, plan: "FREE", status: "ACTIVE" },
        update: { status: "ACTIVE", plan: "FREE" },
      });
    } catch (_) {}

    // Throw a proper Response so Remix shows the error boundary
    throw new Response(
      JSON.stringify({ message: error?.message || "Failed to initiate billing" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

// ─── UI Helpers ─────────────────────────────────────────────────────────────

const PLAN_ORDER = ["FREE", PLAN_BASIC, PLAN_PRO, PLAN_PLATINUM];

function getPlanButtonLabel(planId, currentPlan) {
  if (planId === currentPlan) return "Current Plan";
  const currentIndex = PLAN_ORDER.indexOf(currentPlan);
  const targetIndex = PLAN_ORDER.indexOf(planId);
  if (targetIndex > currentIndex) return "Upgrade";
  if (targetIndex < currentIndex) return "Downgrade";
  return "Select";
}

function getPlanBadgeTone(planId) {
  switch (planId) {
    case PLAN_BASIC: return "info";
    case PLAN_PRO: return "attention";
    case PLAN_PLATINUM: return "warning";
    default: return "success";
  }
}

export default function PricingPage() {
  const { subscription, billingCheckError } = useLoaderData();
  const submit = useSubmit();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const [searchParams] = useSearchParams();

  const isSubmitting = navigation.state === "submitting";
  const userPlan = (subscription?.status === "ACTIVE" ? subscription?.plan : null) || "FREE";
  const billingStatus = searchParams.get("billingStatus");

  const handleSubscribe = (planId) => {
    submit({ plan: planId }, { method: "post" });
  };

  const statusBanner = () => {
    const accessDeniedTier = searchParams.get("accessDenied");
    if (accessDeniedTier) {
      const tierName = accessDeniedTier.replace("PLAN_", "");
      return (
        <Banner tone="warning" title={`${tierName} Plan Required`}>
          That template requires a {tierName} subscription or higher. Upgrade
          below to unlock it.
        </Banner>
      );
    }
    if (billingStatus === "success") {
      return (
        <Banner tone="success" title="Subscription activated!">
          Your plan has been upgraded and features are now unlocked.
        </Banner>
      );
    }
    if (billingStatus === "cancelled") {
      return (
        <Banner tone="warning" title="Payment cancelled">
          You cancelled the subscription approval. No charge was made.
        </Banner>
      );
    }
    if (billingStatus === "error") {
      return (
        <Banner tone="critical" title="Billing error">
          Something went wrong verifying your subscription. Please try again.
        </Banner>
      );
    }
    return null;
  };

  return (
    <Page
      title="Subscription Plans"
      backAction={{ content: "Dashboard", onAction: () => navigate("/app") }}
    >
      <BlockStack gap="500">
        {billingCheckError && (
          <Banner tone="warning" title="Live billing sync unavailable">
            We couldn't verify your subscription with Shopify right now. Showing
            last known plan from our database. Features are granted based on your
            last confirmed active plan.
          </Banner>
        )}

        {statusBanner()}

        {/* Active subscription info */}
        {subscription?.status === "ACTIVE" && subscription?.plan !== "FREE" && (
          <Banner tone="info" title={`Active: ${subscription.plan.replace("PLAN_", "")} Plan`}>
            {subscription.currentPeriodEnd && (
              <Text>
                Current period ends:{" "}
                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
              </Text>
            )}
          </Banner>
        )}

        {subscription?.status === "PENDING" && (
          <Banner tone="attention" title="Awaiting payment approval">
            A subscription request is pending. Complete the payment on Shopify's
            approval page to activate your plan.
          </Banner>
        )}

        <Text variant="bodyLg" as="p" alignment="center">
          Unlock premium layouts, advanced sections, and a richer visual
          experience. Free templates are always included with every plan.
        </Text>

        <Grid>
          {subscriptionPlans.map((plan) => {
            const isCurrent = userPlan === plan.id;
            const buttonLabel = getPlanButtonLabel(plan.id, userPlan);
            const isLoading = isSubmitting;
            const isPaidPlan = plan.id !== "FREE";

            return (
              <Grid.Cell
                key={plan.id}
                columnSpan={{ xs: 6, sm: 6, md: 3, lg: 3, xl: 3 }}
              >
                <Card background={isCurrent ? "bg-surface-secondary" : "bg-surface"}>
                  <BlockStack gap="500">
                    <BlockStack gap="200" align="center" inlineAlign="center">
                      {isCurrent && (
                        <Badge tone={getPlanBadgeTone(plan.id)}>Current Plan</Badge>
                      )}
                      <Text variant="headingLg" as="h3">
                        {plan.name}
                      </Text>
                      <Text variant="headingXl" as="h4">
                        ${plan.price}
                        <Text as="span" variant="bodyMd" tone="subdued">
                          /mo
                        </Text>
                      </Text>
                      {isPaidPlan && (
                        <Text variant="bodySm" tone="subdued">
                          Includes all Free features
                        </Text>
                      )}
                    </BlockStack>

                    <div style={{ minHeight: "200px" }}>
                      <List type="bullet">
                        {plan.features.map((feature, i) => (
                          <List.Item key={i}>{feature}</List.Item>
                        ))}
                      </List>
                    </div>

                    {isLoading && isCurrent ? (
                      <InlineStack align="center">
                        <Spinner size="small" />
                        <Text>Processing...</Text>
                      </InlineStack>
                    ) : (
                      <Button
                        fullWidth
                        variant={isCurrent ? "secondary" : "primary"}
                        disabled={isCurrent || isLoading}
                        onClick={() => handleSubscribe(plan.id)}
                        loading={isLoading && !isCurrent}
                      >
                        {buttonLabel}
                      </Button>
                    )}
                  </BlockStack>
                </Card>
              </Grid.Cell>
            );
          })}
        </Grid>

        <Card>
          <BlockStack gap="200">
            <Text variant="headingSm" as="h3">
              ✅ Free plan is always available
            </Text>
            <Text variant="bodySm" tone="subdued">
              Free templates remain accessible regardless of your subscription
              status. Upgrading adds access to premium templates; it never
              removes free content.
            </Text>
          </BlockStack>
        </Card>
      </BlockStack>
    </Page>
  );
}
