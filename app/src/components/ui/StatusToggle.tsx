import { Check, X } from 'lucide-react';
import type { MouseEvent } from 'react';
import type { TaskStatus } from '../../types';

const ORDER: TaskStatus[] = ['pending', 'in_progress', 'completed', 'skipped'];

export function nextStatus(current: TaskStatus): TaskStatus {
  return ORDER[(ORDER.indexOf(current) + 1) % ORDER.length];
}

export function StatusToggle({ status, onChange, size = 22 }: { status: TaskStatus; onChange: (s: TaskStatus) => void; size?: number }) {
  const dim = `${size}px`;

  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    onChange(status === 'completed' ? 'pending' : 'completed');
  };

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(nextStatus(status));
  };

  if (status === 'completed') {
    return (
      <button
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        style={{ width: dim, height: dim }}
        className="animate-check-pop flex shrink-0 items-center justify-center rounded-full bg-accent text-white"
        aria-label="Completado"
        title="Marcar como pendiente"
      >
        <Check size={size * 0.65} strokeWidth={3} />
      </button>
    );
  }
  if (status === 'skipped') {
    return (
      <button
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        style={{ width: dim, height: dim }}
        className="flex shrink-0 items-center justify-center rounded-full border-2 border-zinc-300 bg-zinc-100 text-zinc-400 dark:border-zinc-700 dark:bg-zinc-800"
        aria-label="Saltado"
        title="Saltado — clic para completar"
      >
        <X size={size * 0.6} strokeWidth={3} />
      </button>
    );
  }
  if (status === 'in_progress') {
    return (
      <button
        onClick={handleClick}
        onContextMenu={handleContextMenu}
        style={{ width: dim, height: dim }}
        className="relative flex shrink-0 items-center justify-center rounded-full border-2 border-accent"
        aria-label="En progreso"
        title="En progreso — clic para completar"
      >
        <span className="h-full w-full rounded-full bg-accent/25" style={{ clipPath: 'inset(0 0 0 50%)' }} />
      </button>
    );
  }
  return (
    <button
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      style={{ width: dim, height: dim }}
      className="shrink-0 rounded-full border-2 border-zinc-300 transition-colors hover:border-accent dark:border-zinc-600"
      aria-label="Pendiente"
      title="Clic para completar · clic derecho para cambiar estado"
    />
  );
}
