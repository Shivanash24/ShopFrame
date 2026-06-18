import { PrismaClient } from '@prisma/client';
import { PrismaSessionStorage } from '@shopify/shopify-app-session-storage-prisma';

const prisma = new PrismaClient();

class MongoDBSessionStorage extends PrismaSessionStorage {
  async storeSession(session) {
    console.log("Storing", session);
  }
}

const storage = new MongoDBSessionStorage(prisma);

storage.findSessionsByShop("shopframe-6lgjkb5p.myshopify.com").then(sessions => {
  console.log("Sessions found:", sessions);
  prisma.$disconnect();
}).catch(console.error);
