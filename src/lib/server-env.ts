import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.url({
    protocol: /^postgres(ql)?$/,
    error: "DATABASE_URL harus berupa URL PostgreSQL (postgres://...)",
  }),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/** Validasi env server. Dipisah dari `getServerEnv` supaya mudah dites. */
export function parseServerEnv(source: Record<string, string | undefined>): ServerEnv {
  return serverEnvSchema.parse(source);
}

let cached: ServerEnv | undefined;

/**
 * Env khusus server (rahasia). Dibaca malas (lazy) agar `next build` tidak gagal
 * ketika DATABASE_URL belum diset dan tidak ada route yang menyentuh database.
 */
export function getServerEnv(): ServerEnv {
  cached ??= parseServerEnv({ DATABASE_URL: process.env.DATABASE_URL });
  return cached;
}
