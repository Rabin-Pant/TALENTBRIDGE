import { PrismaClient } from "@prisma/client";

// Global variable to prevent multiple connections in development
const globalForPrisma = globalThis;

// Cached connection pattern - prevents multiple connections on restart
export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === "development" 
    ? ["query", "error", "warn"] 
    : ["error"],
});

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Optional: Log slow queries in development
if (process.env.NODE_ENV === "development") {
  prisma.$use(async (params, next) => {
    const start = Date.now();
    const result = await next(params);
    const duration = Date.now() - start;
    
    if (duration > 200) {
      console.log(`[Slow Query] ${params.model}.${params.action} took ${duration}ms`);
    }
    
    return result;
  });
}

// Graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

export default prisma;