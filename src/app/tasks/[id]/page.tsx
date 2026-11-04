import { Suspense } from "react";
import { TaskDetail } from "@/features/tasks/components/task-detail";

export default function TaskDetailPage({ params }: PageProps<"/tasks/[id]">) {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-16">
      <Suspense fallback={<p className="text-foreground/60">Memuat task…</p>}>
        <TaskDetail params={params} />
      </Suspense>
    </main>
  );
}
