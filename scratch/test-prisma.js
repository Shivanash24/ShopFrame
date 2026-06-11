import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "../app/db.server.js";

try {
  const storage = new PrismaSessionStorage(prisma);
  console.log("Storage created successfully.");
  console.log("typeof sessionToRow:", typeof storage.sessionToRow);
} catch (err) {
  console.error(err);
}
