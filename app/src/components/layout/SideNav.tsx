import { NavLink } from 'react-router-dom';
import { Plus, Search, Sparkles } from 'lucide-react';
import { NAV_ITEMS } from './nav';
import { useUiStore } from '../../store/uiStore';
import { useStore } from '../../store/store';

export function SideNav() {
  const openQuickAdd = useUiStore((s) => s.openQuickAdd);
  const setSearchOpen = useUiStore((s) => s.setSearchOpen);
  const setAssistantOpen = useUiStore((s) => s.setAssistantOpen);
  const profile = useStore((s) => s.profile);

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-zinc-200 bg-white/70 px-4 py-6 backdrop-blur-lg dark:border-zinc-800 dark:bg-zinc-950/70 md:flex">
      <div className="mb-6 flex items-center gap-2 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-white font-bold">C</div>
        <span className="font-semibold text-zinc-900 dark:text-zinc-50">Centro</span>
      </div>

      <button
        onClick={() => openQuickAdd('menu')}
        className="mb-2 flex items-center gap-2 rounded-xl bg-accent px-3 py-2.5 text-sm font-medium text-white shadow-sm transition-transform active:scale-[0.98]"
      >
        <Plus size={18} /> Añadir
      </button>
      <button
        onClick={() => setSearchOpen(true)}
        className="mb-2 flex items-center justify-between rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-400 dark:border-zinc-800"
      >
        <span className="flex items-center gap-2"><Search size={16} /> Buscar</span>
        <kbd className="rounded border border-zinc-200 px-1.5 py-0.5 text-[10px] dark:border-zinc-700">⌘K</kbd>
      </button>
      <button
        onClick={() => setAssistantOpen(true)}
        className="mb-6 flex items-center gap-2 rounded-xl border border-zinc-200 px-3 py-2.5 text-sm text-zinc-400 dark:border-zinc-800"
      >
        <Sparkles size={16} /> Asistente
      </button>

      <nav className="flex flex-1 flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-accent/10 text-accent'
                    : 'text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-900'
                }`
              }
            >
              <Icon size={19} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="flex items-center gap-2 rounded-xl px-2 py-2 text-sm text-zinc-500 dark:text-zinc-400">
        <span className="text-lg">{profile.avatarEmoji}</span>
        <span className="truncate">{profile.name}</span>
      </div>
    </aside>
  );
}
