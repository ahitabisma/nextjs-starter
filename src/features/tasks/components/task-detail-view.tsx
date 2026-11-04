import Link from "next/link";
import { Button } from "@/components/ui/button";
import { deleteTaskAction, toggleTaskAction } from "@/features/tasks/actions";
import type { Task } from "@/features/tasks/schema";
import { formatDateTime } from "@/lib/format";

export function TaskDetailView({ task }: { task: Task }) {
  return (
    <article className="flex flex-col gap-4">
      <Link href="/tasks" className="text-sm text-foreground/70 hover:underline">
        ← Kembali ke daftar
      </Link>
      <h1 className="text-2xl font-semibold tracking-tight">{task.title}</h1>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt className="text-foreground/60">Status</dt>
        <dd>{task.done ? "Selesai" : "Belum selesai"}</dd>
        <dt className="text-foreground/60">Dibuat</dt>
        <dd>{formatDateTime(task.createdAt)}</dd>
      </dl>
      <div className="flex gap-2">
        <form action={toggleTaskAction}>
          <input type="hidden" name="id" value={task.id} />
          <Button type="submit">{task.done ? "Tandai belum selesai" : "Tandai selesai"}</Button>
        </form>
        <form action={deleteTaskAction}>
          <input type="hidden" name="id" value={task.id} />
          <Button type="submit" variant="outline">
            Hapus
          </Button>
        </form>
      </div>
    </article>
  );
}
