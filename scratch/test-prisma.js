import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { Session } from "@shopify/shopify-api";
import prisma from "../app/db.server.js";

try {
  const storage = new PrismaSessionStorage(prisma);
  const session = new Session({
    id: "offline_test.myshopify.com",
    shop: "test.myshopify.com",
    state: "123",
    isOnline: false,
    accessToken: "shpca_123",
  });
  const row = storage.sessionToRow(session);
  console.log("Row:", row);
} catch (err) {
  console.error("Error:", err);
}
