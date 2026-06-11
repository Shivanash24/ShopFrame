import { Session } from "@shopify/shopify-api";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import prisma from "../app/db.server.js";

class MongoDBSessionStorage extends PrismaSessionStorage {
  async storeSession(session) {
    await this.ready;
    const data = this.sessionToRow(session);

    const { id, ...updateData } = data;

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

async function test() {
  const storage = new MongoDBSessionStorage(prisma);
  const session = new Session({
    id: "offline_test.myshopify.com",
    shop: "test.myshopify.com",
    state: "123",
    isOnline: false,
    accessToken: "shpca_123",
    scope: "write_themes,read_themes",
  });

  try {
    console.log("Attempting to store session...");
    await storage.storeSession(session);
    console.log("Session stored successfully!");
  } catch (err) {
    console.error("Failed to store session:", err);
  } finally {
    await prisma.$disconnect();
  }
}

test();
