import { PrismaClient } from "@prisma/client";

// Export a single PrismaClient instance to be reused across the app.
// This avoids exhausting the connection pool in serverless environments.
export const prisma = new PrismaClient();
