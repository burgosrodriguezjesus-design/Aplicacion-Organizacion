import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { X } from 'lucide-react';
import { IconButton } from './Button';

export function Sheet({
  open, onClose, title, children, footer, maxWidth = 'max-w-lg',
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-black/40 animate-fade-in" onClick={onClose} />
      <div
        className={`relative z-10 flex max-h-[88vh] w-full ${maxWidth} flex-col rounded-t-3xl bg-white shadow-xl animate-slide-up dark:bg-zinc-900 sm:rounded-3xl sm:animate-pop-in`}
      >
        <div className="mx-auto mt-2 h-1.5 w-10 shrink-0 rounded-full bg-zinc-200 dark:bg-zinc-700 sm:hidden" />
        {title !== undefined && (
          <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-3">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
            <IconButton onClick={onClose} aria-label="Cerrar">
              <X size={18} />
            </IconButton>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 pb-4">{children}</div>
        {footer && <div className="shrink-0 border-t border-zinc-100 px-5 py-3 dark:border-zinc-800 safe-bottom">{footer}</div>}
      </div>
    </div>
  );
}
