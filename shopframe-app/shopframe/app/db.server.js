import { PrismaClient } from "@prisma/client";

if (process.env.NODE_ENV !== "production") {
  if (!global.__db_prisma) {
    global.__db_prisma = new PrismaClient();
  }
}

const prisma = global.__db_prisma ?? new PrismaClient();

export default prisma;
