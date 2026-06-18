import { ShieldCheck } from 'lucide-react';

export function GlobalLoadingScreen({
  message = 'Preparing your Kodeye workspace...',
}: {
  message?: string;
}) {
  const rows = [
    'sync repositories',
    'inspect code signals',
    'prepare audit context',
  ];

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f5ef] px-4 text-slate-950">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-2xl shadow-slate-300">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight">Kodeye</h1>
        <p className="mt-2 text-sm font-medium text-slate-500">{message}</p>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 p-4 text-left shadow-2xl shadow-slate-200">
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
            <span className="text-xs font-semibold text-slate-400">
              loading
            </span>
          </div>
          <div className="grid gap-3">
            {rows.map((row, index) => (
              <div
                className="grid grid-cols-[1.5rem_1fr] rounded-lg bg-white/[0.04] px-3 py-2 font-mono text-xs"
                key={row}
              >
                <span className="text-slate-500">{index + 1}</span>
                <span className="text-cyan-200">{row}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="global-loading-bar h-full rounded-full bg-cyan-300" />
          </div>
        </div>
      </div>
    </main>
  );
}
