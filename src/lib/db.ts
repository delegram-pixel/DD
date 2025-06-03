import { PrismaClient } from "@prisma/client"

// Add prisma to the NodeJS global type
interface CustomNodeJsGlobal extends NodeJS.Global {
  prisma: PrismaClient
}

// Prevent multiple instances of Prisma Client in development
declare const global: CustomNodeJsGlobal

const prisma =
  global.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
  })

if (process.env.NODE_ENV === "development") global.prisma = prisma

export const db = prisma

// Test database connection
export async function testDatabaseConnection() {
  try {
    const result = await db.$queryRaw`SELECT 1 as test`
    console.log("Database connection test result:", result)
    return { success: true, result }
  } catch (error) {
    console.error("Database connection test failed:", error)
    return { success: false, error }
  }
}

