"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createTaskAction } from "@/features/tasks/actions";
import type { CreateTaskState } from "@/features/tasks/schema";

const initialState: CreateTaskState = {};

export function TaskForm() {
  const [state, formAction, pending] = useActionState(createTaskAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <label htmlFor="task-title" className="sr-only">
          Judul task
        </label>
        <input
          id="task-title"
          name="title"
          required
          maxLength={100}
          placeholder="Tambah task baru…"
          className="h-10 flex-1 rounded-md border border-foreground/20 bg-transparent px-3 text-sm"
        />
        <Button type="submit" disabled={pending}>
          {pending ? "Menyimpan…" : "Tambah"}
        </Button>
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-red-600">
          {state.error}
        </p>
      ) : null}
    </form>
  );
}
