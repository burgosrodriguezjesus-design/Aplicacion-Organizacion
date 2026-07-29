import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

export function PageHeader({ title, subtitle, action, back }: { title: string; subtitle?: string; action?: ReactNode; back?: boolean }) {
  const navigate = useNavigate();
  return (
    <div className="mb-5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        {back && (
          <button onClick={() => navigate(-1)} className="-ml-1.5 flex h-9 w-9 items-center justify-center rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
            <ChevronLeft size={20} />
          </button>
        )}
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-2xl">{title}</h1>
          {subtitle && <p className="text-sm text-zinc-400">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
