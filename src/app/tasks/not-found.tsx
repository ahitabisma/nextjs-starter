import Link from "next/link";

export default function TaskNotFound() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Task tidak ditemukan</h1>
      <p className="text-foreground/70">Task yang kamu cari tidak ada atau sudah dihapus.</p>
      <Link href="/tasks" className="underline">
        Kembali ke daftar task
      </Link>
    </main>
  );
}
