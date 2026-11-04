import Link from "next/link";
import { Button } from "@/components/ui/button";
import { env } from "@/lib/env";
import { formatRupiah } from "@/lib/format";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-6 py-24">
      <h1 className="text-3xl font-semibold tracking-tight">{env.NEXT_PUBLIC_APP_NAME}</h1>
      <p className="text-foreground/70">
        Contoh format harga: <strong>{formatRupiah(1_500_000)}</strong>
      </p>
      <nav className="flex gap-3">
        <Button>Mulai</Button>
        <Link
          href="/tasks"
          className="inline-flex h-10 items-center rounded-md border border-foreground/20 px-4 text-sm font-medium hover:bg-foreground/5"
        >
          Contoh fitur: Tasks
        </Link>
      </nav>
    </main>
  );
}
