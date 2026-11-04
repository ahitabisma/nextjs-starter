import { boolean, index, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

// Nama kolom otomatis snake_case (opsi `casing: "snake_case"` di drizzle.config.ts & src/db/index.ts).
export const tasks = pgTable(
  "tasks",
  {
    id: uuid().primaryKey().defaultRandom(),
    title: varchar({ length: 100 }).notNull(),
    done: boolean().notNull().default(false),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [index("tasks_created_at_idx").on(table.createdAt)],
);
