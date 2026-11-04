"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

// Next.js 16: error boundary menerima `retry` (bukan `reset`); `error` bertipe unknown.
export default function TasksError({ error, retry }: { error: unknown; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-4 px-6 py-16">
      <h1 className="text-2xl font-semibold tracking-tight">Terjadi kesalahan</h1>
      <p className="text-foreground/70">Task gagal dimuat. Coba lagi sebentar.</p>
      <div>
        <Button onClick={() => retry()}>Coba lagi</Button>
      </div>
    </main>
  );
}
