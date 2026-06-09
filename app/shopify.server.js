import "@shopify/shopify-app-remix/adapters/node";
import {
  ApiVersion,
  AppDistribution,
  shopifyApp,
  BillingInterval,
  DeliveryMethod,
} from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "./db.server";

// Import constants for use inside this file (billing config)
import { PLAN_BASIC, PLAN_PRO, PLAN_PLATINUM } from "./plans.js";

// Plan constants and access-control helpers live in plans.js (no .server in name)
// so they can be safely imported by both server and client code.
export {
  PLAN_BASIC,
  PLAN_PRO,
  PLAN_PLATINUM,
  PLAN_LEVELS,
  ALL_PAID_PLANS,
  PLAN_ORDER,
  canAccessTier,
  getPlanDisplayName,
} from "./plans.js";

// Custom wrapper to fix Prisma + MongoDB issues
class MongoDBSessionStorage extends PrismaSessionStorage {
  async storeSession(session) {
    await this.ready;
    const data = this.sessionToRow(session);

    // Fix 1: MongoDB cannot update the _id field. We must omit it from the update payload.
    const { id, ...updateData } = data;

    // Fix 2: Convert userId to String because Prisma schema expects String, but Shopify sends a number
    if (data.userId !== null && data.userId !== undefined) {
      data.userId = String(data.userId);
      if (updateData.userId !== undefined) {
        updateData.userId = String(updateData.userId);
      }
    }

    try {
      await this.prisma[this.tableName].upsert({
        where: { id },
        update: updateData,
        create: data,
      });
      return true;
    } catch (error) {
      if (error.code === "P2002") {
        await this.prisma[this.tableName].upsert({
          where: { id },
          update: updateData,
          create: data,
        });
        return true;
      }
      throw error;
    }
  }
}

const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET || "",
  apiVersion: ApiVersion.January25,
  scopes: process.env.SCOPES?.split(","),
  appUrl: process.env.SHOPIFY_APP_URL || "",
  authPathPrefix: "/auth",
  sessionStorage: new MongoDBSessionStorage(prisma),
  distribution: AppDistribution.AppStore,
  billing: {
    [PLAN_BASIC]: {
      lineItems: [
        {
          amount: 49,
          currencyCode: "USD",
          interval: BillingInterval.Every30Days,
        },
      ],
    },
    [PLAN_PRO]: {
      lineItems: [
        {
          amount: 89,
          currencyCode: "USD",
          interval: BillingInterval.Every30Days,
        },
      ],
    },
    [PLAN_PLATINUM]: {
      lineItems: [
        {
          amount: 119,
          currencyCode: "USD",
          interval: BillingInterval.Every30Days,
        },
      ],
    },
  },
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks/app/uninstalled",
    },
    CUSTOMERS_DATA_REQUEST: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
    CUSTOMERS_REDACT: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
    SHOP_REDACT: {
      deliveryMethod: DeliveryMethod.Http,
      callbackUrl: "/webhooks",
    },
  },
  ...(process.env.SHOP_CUSTOM_DOMAIN
    ? { customShopDomains: [process.env.SHOP_CUSTOM_DOMAIN] }
    : {}),
});

export default shopify;
export const apiVersion = ApiVersion.January25;
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const authenticate = shopify.authenticate;
export const unauthenticated = shopify.unauthenticated;
export const login = shopify.login;
export const registerWebhooks = shopify.registerWebhooks;
export const sessionStorage = shopify.sessionStorage;
