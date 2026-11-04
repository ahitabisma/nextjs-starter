import Link from "next/link";
import { Button } from "@/components/ui/button";
import { deleteTaskAction, toggleTaskAction } from "@/features/tasks/actions";
import type { Task } from "@/features/tasks/schema";
import { cn } from "@/lib/utils";

/** Komponen presentasi murni (mudah dites). Pengambilan data ada di `tasks-section.tsx`. */
export function TaskList({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return <p className="text-foreground/60">Belum ada task.</p>;
  }

  return (
    <ul className="flex flex-col divide-y divide-foreground/10">
      {tasks.map((task) => (
        <li key={task.id} className="flex items-center gap-3 py-3">
          <form action={toggleTaskAction}>
            <input type="hidden" name="id" value={task.id} />
            <Button
              type="submit"
              variant="outline"
              className="w-10 px-0"
              aria-label={
                task.done ? `Tandai belum selesai: ${task.title}` : `Tandai selesai: ${task.title}`
              }
            >
              {task.done ? "✓" : "○"}
            </Button>
          </form>
          <Link
            href={`/tasks/${task.id}`}
            className={cn("flex-1 hover:underline", task.done && "text-foreground/50 line-through")}
          >
            {task.title}
          </Link>
          <form action={deleteTaskAction}>
            <input type="hidden" name="id" value={task.id} />
            <Button type="submit" variant="outline" aria-label={`Hapus: ${task.title}`}>
              Hapus
            </Button>
          </form>
        </li>
      ))}
    </ul>
  );
}
