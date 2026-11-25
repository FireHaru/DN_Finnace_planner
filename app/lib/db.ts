import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

const globalForNeon = globalThis as typeof globalThis & {
  financeSql?: NeonQueryFunction<false, false>;
};

export function getSql() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("Thiếu DATABASE_URL. Hãy kết nối Neon và cấu hình biến môi trường theo README.");
  }

  globalForNeon.financeSql ??= neon(connectionString);

  return globalForNeon.financeSql;
}
