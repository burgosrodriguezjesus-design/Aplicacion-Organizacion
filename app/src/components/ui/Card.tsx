import type { HTMLAttributes, ReactNode } from 'react';

export function Card({ children, className = '', ...rest }: { children: ReactNode; className?: string } & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-2xl border border-zinc-200/80 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900 ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
