// src/lib/prisma.ts
import { Pool, PoolConfig } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pool?: Pool;
};

function getOrCreatePool(): Pool {
  if (globalForPrisma.pool) {
    return globalForPrisma.pool;
  }

  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) throw new Error("DATABASE_URL is not set");

  // Sanitize connection string: remove channel_binding if present (unsupported by PgBouncer)
  const connectionString = rawUrl
    .replace(/([?&])channel_binding=[^&]+(&|$)/, "$1")
    .replace(/[?&]$/, "");

  const poolConfig: PoolConfig = {
    connectionString,
    max: process.env.NODE_ENV === "production" ? 10 : 5,
    // 15s idle timeout ensures idle connections are closed before Neon's 5-minute compute suspension
    idleTimeoutMillis: 15000,
    // 25s timeout ensures queries wait for Neon cold-start wakeups without hanging indefinitely
    connectionTimeoutMillis: 25000,
    // TCP KeepAlive prevents proxy/firewall drops and quickly detects severed sockets
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  };

  const pool = new Pool(poolConfig);

  // Catch idle socket drops gracefully (e.g. when Neon serverless pauses) without crashing
  pool.on("error", (err) => {
    console.warn("[pg pool] Handled idle server connection drop:", err.message);
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.pool = pool;
  }

  return pool;
}

function createPrismaClient(): PrismaClient {
  const pool = getOrCreatePool();
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}