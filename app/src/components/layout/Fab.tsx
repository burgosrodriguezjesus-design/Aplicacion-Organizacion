import { Plus } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';

export function Fab() {
  const openQuickAdd = useUiStore((s) => s.openQuickAdd);
  return (
    <button
      onClick={() => openQuickAdd('menu')}
      aria-label="Añadir"
      className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-accent/30 transition-transform active:scale-95 md:bottom-8 md:right-8"
    >
      <Plus size={26} strokeWidth={2.5} />
    </button>
  );
}
