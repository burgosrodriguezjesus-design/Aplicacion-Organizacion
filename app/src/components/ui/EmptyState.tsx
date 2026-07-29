import type { ReactNode } from 'react';

export function EmptyState({ icon, title, subtitle, action }: { icon: ReactNode; title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-200 px-6 py-10 text-center dark:border-zinc-800">
      <div className="text-3xl">{icon}</div>
      <p className="font-medium text-zinc-700 dark:text-zinc-200">{title}</p>
      {subtitle && <p className="max-w-xs text-sm text-zinc-400">{subtitle}</p>}
      {action}
    </div>
  );
}
