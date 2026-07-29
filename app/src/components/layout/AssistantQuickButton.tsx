import { Sparkles } from 'lucide-react';
import { useUiStore } from '../../store/uiStore';

export function AssistantQuickButton() {
  const setAssistantOpen = useUiStore((s) => s.setAssistantOpen);
  return (
    <button
      onClick={() => setAssistantOpen(true)}
      aria-label="Preguntar al asistente"
      className="fixed right-4 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-zinc-200/80 bg-white/90 text-accent shadow-sm backdrop-blur-lg transition-transform active:scale-95 dark:border-zinc-800 dark:bg-zinc-900/90 md:hidden"
      style={{ top: 'calc(0.75rem + env(safe-area-inset-top))' }}
    >
      <Sparkles size={19} />
    </button>
  );
}
