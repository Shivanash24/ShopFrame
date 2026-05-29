import { PrismaClient } from "@prisma/client";

// Prevent multiple instances of PrismaClient in development (due to HMR)
// In production (Vercel), each function invocation is a fresh process so
// the module-level singleton is sufficient.
const prisma =
  global.__db_prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__db_prisma = prisma;
}

export default prisma;
