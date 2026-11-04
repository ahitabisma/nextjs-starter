import type { Metadata } from "next";
import { Suspense } from "react";
import { TaskForm } from "@/features/tasks/components/task-form";
import { TasksSection } from "@/features/tasks/components/tasks-section";

export const metadata: Metadata = { title: "Tasks" };

export default function TasksPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Tasks</h1>
      <TaskForm />
      <Suspense fallback={<p className="text-foreground/60">Memuat task…</p>}>
        <TasksSection />
      </Suspense>
    </main>
  );
}
