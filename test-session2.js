import { PrismaClient } from '@prisma/client';
import { PrismaSessionStorage } from '@shopify/shopify-app-session-storage-prisma';

const prisma = new PrismaClient();

class MongoDBSessionStorage extends PrismaSessionStorage {
  async storeSession(session) {
    console.log("Storing", session);
  }
}

const storage = new MongoDBSessionStorage(prisma);

storage.loadSession("offline_shopframe-6lgjkb5p.myshopify.com").then(session => {
  console.log("Session loaded:", session);
  prisma.$disconnect();
}).catch(console.error);
