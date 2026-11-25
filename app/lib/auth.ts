import "server-only";
import { betterAuth } from "better-auth";
import { neonConfig, Pool } from "@neondatabase/serverless";
import WebSocket from "ws";

neonConfig.webSocketConstructor = WebSocket;

const connectionString = process.env.DATABASE_URL;
const secret = process.env.BETTER_AUTH_SECRET;

if (!connectionString) {
  throw new Error("Thiếu DATABASE_URL. Hãy cấu hình kết nối Neon theo README.");
}

if (!secret || secret.length < 32) {
  throw new Error(
    "BETTER_AUTH_SECRET chưa hợp lệ. Hãy tạo secret bằng `node -e \"console.log(require('node:crypto').randomBytes(32).toString('base64url'))\"` rồi đặt vào .env.local.",
  );
}

const globalForAuth = globalThis as typeof globalThis & {
  betterAuthPool?: Pool;
};

const pool =
  globalForAuth.betterAuthPool ??
  new Pool({ connectionString, max: 1 });

globalForAuth.betterAuthPool = pool;

const baseURL =
  process.env.VERCEL_ENV === "preview" && process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : process.env.BETTER_AUTH_URL ??
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000");

export const auth = betterAuth({
  database: pool,
  secret,
  baseURL,
  emailAndPassword: {
    enabled: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24 * 7,
  },
});

export type AuthUser = typeof auth.$Infer.Session.user;
