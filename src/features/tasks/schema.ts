import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { tasks } from "@/db/schema";

/** Tipe baris database (satu-satunya sumber kebenaran: `src/db/schema/tasks.ts`). */
export type Task = typeof tasks.$inferSelect;

// Aturan field yang lebih ketat dari tipe kolom (pesan dalam Bahasa Indonesia).
const title = z
  .string({ error: "Judul wajib diisi" })
  .trim()
  .min(1, "Judul wajib diisi")
  .max(100, "Judul maksimal 100 karakter");

/** Input buat task — diturunkan dari tabel lewat drizzle-zod. Hanya field yang boleh diisi klien. */
export const taskInputSchema = createInsertSchema(tasks, { title }).pick({ title: true });

/** Input ubah task (PATCH): semua field opsional, minimal satu harus ada. */
// Catatan: meng-override kolom dengan schema Zod ikut mengganti sifat opsionalnya, jadi `.optional()` eksplisit.
export const taskPatchSchema = createUpdateSchema(tasks, { title: title.optional() })
  .pick({ title: true, done: true })
  .refine((value) => value.title !== undefined || value.done !== undefined, {
    message: "Minimal satu field (title/done) harus diisi",
  });

/** Query string `GET /api/tasks`. Nilai default sekaligus batas maksimal. */
export const listTasksQuerySchema = z.object({
  limit: z.coerce
    .number({ error: "limit harus berupa angka" })
    .int("limit harus bilangan bulat")
    .min(1, "limit minimal 1")
    .max(100, "limit maksimal 100")
    .default(20),
  offset: z.coerce
    .number({ error: "offset harus berupa angka" })
    .int("offset harus bilangan bulat")
    .min(0, "offset minimal 0")
    .default(0),
  done: z
    .enum(["true", "false"], { error: "done harus 'true' atau 'false'" })
    .transform((value) => value === "true")
    .optional(),
});

/** `id` task adalah UUID. Id yang bentuknya salah diperlakukan sebagai "tidak ditemukan". */
export const taskIdSchema = z.uuid();

export type TaskInput = z.infer<typeof taskInputSchema>;
export type TaskPatch = z.infer<typeof taskPatchSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;

/** State untuk `useActionState` pada form tambah task. */
export type CreateTaskState = { error?: string };
