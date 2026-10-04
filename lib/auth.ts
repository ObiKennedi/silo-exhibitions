// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "@better-auth/prisma-adapter";
import { nextCookies } from "better-auth/next-js";
import { admin, twoFactor, emailOTP } from "better-auth/plugins";
import { Redis } from "@upstash/redis";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { ac, roles } from "@/lib/permissions";
import { autoLinkRegistrationsToUser } from "@/lib/vendor-registrations";

// ─── Redis / Secondary Storage ──────────────────────────────────────────────
let redisUrl = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
let redisToken = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

// Auto-extract if redis-cli format was pasted into UPSTASH_REDIS_REST_URL
if (redisUrl && redisUrl.includes("redis://")) {
  const match = redisUrl.match(/redis:\/\/(?:default:)?([^@]+)@([^:]+)/);
  if (match) {
    if (!redisToken) redisToken = match[1];
    redisUrl = `https://${match[2]}`;
  }
}

const hasValidRedis = Boolean(
  redisUrl && (redisUrl.startsWith("https://") || redisUrl.startsWith("http://")) && redisToken
);

const redis = hasValidRedis
  ? new Redis({
      url: redisUrl!,
      token: redisToken!,
      automaticDeserialization: false,
    })
  : null;

// Resilient memory store for local development / builds without Redis credentials
const memoryStore = new Map<string, { value: string; expiresAt?: number }>();

// ─── URLs ───────────────────────────────────────────────────────────────────
// Set BETTER_AUTH_URL in Production (and locally). Previews fall back to the
// deployment URL Vercel provides.
const baseURL =
  process.env.BETTER_AUTH_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

const trustedOrigins = [
  baseURL,
  "https://siloexhibitions.com.ng",
  "https://www.siloexhibitions.com.ng",
  process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
  process.env.VERCEL_BRANCH_URL && `https://${process.env.VERCEL_BRANCH_URL}`,
].filter(Boolean) as string[];

export const auth = betterAuth({
  appName: "Silo Exhibitions",
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins,

  database: prismaAdapter(prisma, { provider: "postgresql" }),

  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          if (user && user.email) {
            try {
              await autoLinkRegistrationsToUser(user.id, user.email);
            } catch (err) {
              console.error("[BetterAuth Hook] Auto-linking registrations error:", err);
            }
          }
        },
      },
    },
  },

  secondaryStorage: {
    get: async (key) => {
      if (redis) {
        return (await redis.get<string>(key)) ?? null;
      }
      const item = memoryStore.get(key);
      if (!item) return null;
      if (item.expiresAt && item.expiresAt < Date.now()) {
        memoryStore.delete(key);
        return null;
      }
      return item.value;
    },
    set: async (key, value, ttl) => {
      if (redis) {
        if (ttl) await redis.set(key, value, { ex: ttl });
        else await redis.set(key, value);
        return;
      }
      memoryStore.set(key, {
        value,
        expiresAt: ttl ? Date.now() + ttl * 1000 : undefined,
      });
    },
    delete: async (key) => {
      if (redis) {
        await redis.del(key);
        return;
      }
      memoryStore.delete(key);
    },
    getAndDelete: async (key) => {
      if (redis) {
        return (await redis.getdel<string>(key)) ?? null;
      }
      const item = memoryStore.get(key);
      if (!item) return null;
      memoryStore.delete(key);
      if (item.expiresAt && item.expiresAt < Date.now()) {
        return null;
      }
      return item.value;
    },
    increment: async (key, ttl) => {
      if (redis) {
        const value = await redis.incr(key);
        if (value === 1 && ttl) {
          await redis.expire(key, ttl);
        }
        return value;
      }
      const item = memoryStore.get(key);
      let num = item ? parseInt(item.value, 10) || 0 : 0;
      num += 1;
      memoryStore.set(key, {
        value: String(num),
        expiresAt: ttl ? Date.now() + ttl * 1000 : item?.expiresAt,
      });
      return num;
    },
  },

  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // refresh expiry at most once a day
    storeSessionInDatabase: true, // keep a Postgres record for auditing / admin listing
    cookieCache: { enabled: true, maxAge: 60 * 5 }, // skip Redis on most reads
  },

  rateLimit: {
    enabled: true,
    storage: "secondary-storage",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": { window: 60, max: 5 },
    },
  },

  // ─── Email + password ──────────────────────────────────────────────────────
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
    resetPasswordTokenExpiresIn: 60 * 60, // 1h
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Set your Silo Exhibitions password",
        html: `<p>Hi ${user.name},</p>
               <p><a href="${url}">Set your password</a>. This link expires in 1 hour.</p>
               <p>If you didn't expect this, ignore this email.</p>`,
      });
    },
  },

  // ─── OAuth ────────────────────────────────────────────────────────────────
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      accessType: "offline",
      prompt: "select_account",
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
      // Allow invited/pre-registered users whose local emailVerified is not yet true
      // to link automatically if Google reports the email as verified.
      requireLocalEmailVerified: false,
    },
  },

  plugins: [
    admin({
      ac,
      roles,
      defaultRole: "user",
      adminRoles: ["super_admin"],
    }),
    twoFactor({ issuer: "Silo Exhibitions" }),
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        const isPasswordReset = type === "forget-password";
        const subject = isPasswordReset
          ? `${otp} is your Silo Exhibitions password reset code`
          : `${otp} is your Silo Exhibitions verification code`;

        await sendEmail({
          to: email,
          subject,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; background: #ffffff; border: 1px solid #f1f5f9; border-radius: 16px;">
              <div style="margin-bottom: 24px;">
                <h2 style="margin: 0 0 8px 0; color: #0f172a; font-size: 20px; font-weight: 700;">
                  ${isPasswordReset ? "Reset your password" : "Verify your email"}
                </h2>
                <p style="margin: 0; color: #64748b; font-size: 14px; line-height: 20px;">
                  ${isPasswordReset
                    ? "Enter the 6-digit code below to set a new password for your Silo Exhibitions account."
                    : "Welcome to Silo Exhibitions! Enter the 6-digit code below to verify your email address."}
                </p>
              </div>
              <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 12px; margin-bottom: 24px; border: 1px solid #e2e8f0;">
                <span style="font-family: monospace; font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #0f172a;">
                  ${otp}
                </span>
              </div>
              <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 18px;">
                This code expires in 5 minutes. If you didn't request this code, you can safely ignore this email.
              </p>
            </div>
          `,
        });
      },
      otpLength: 6,
      expiresIn: 300,
      sendVerificationOnSignUp: true,
    }),
    nextCookies(), 
  ],
});

export type Session = typeof auth.$Infer.Session;