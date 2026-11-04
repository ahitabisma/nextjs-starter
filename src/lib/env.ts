import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_APP_NAME: z.string().min(1).default("Next Boilerplate"),
});

export type Env = z.infer<typeof envSchema>;

/** Validasi env. Dipisah dari `env` supaya mudah dites. */
export function parseEnv(source: Record<string, string | undefined>): Env {
  return envSchema.parse(source);
}

// Variabel NEXT_PUBLIC_* harus dirujuk secara eksplisit agar ter-inline saat build.
export const env = parseEnv({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
});
