import type { ReactNode, CSSProperties } from 'react';

export function Badge({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
