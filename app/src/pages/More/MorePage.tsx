import { useNavigate } from 'react-router-dom';
import { Repeat, StickyNote, Inbox, Bell, Sunrise, BarChart3, Settings, Timer, Sparkles, ChevronRight } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui/Card';
import { useStore } from '../../store/store';
import { useUiStore } from '../../store/uiStore';

const ITEMS = [
  { to: '/mas/habitos', label: 'Hábitos', desc: 'Rachas y cumplimiento', icon: Repeat, color: '#22c55e' },
  { to: '/mas/notas', label: 'Notas', desc: 'Ideas y apuntes', icon: StickyNote, color: '#eab308' },
  { to: '/mas/bandeja', label: 'Bandeja de entrada', desc: 'Captura rápida', icon: Inbox, color: '#6366f1' },
  { to: '/mas/recordatorios', label: 'Recordatorios', desc: 'Pagos, citas y avisos', icon: Bell, color: '#f97316' },
  { to: '/mas/rutinas', label: 'Rutinas', desc: 'Mañana y noche', icon: Sunrise, color: '#0ea5e9' },
  { to: '/mas/estadisticas', label: 'Estadísticas', desc: 'Tu progreso de un vistazo', icon: BarChart3, color: '#8b5cf6' },
  { to: '/foco', label: 'Modo foco', desc: 'Concentración y Pomodoro', icon: Timer, color: '#ec4899' },
  { to: 'assistant', label: 'Asistente', desc: 'Pídeme que organice tu día', icon: Sparkles, color: '#6366f1' },
  { to: '/mas/ajustes', label: 'Ajustes', desc: 'Perfil, tema y categorías', icon: Settings, color: '#64748b' },
] as const;

export function MorePage() {
  const navigate = useNavigate();
  const profile = useStore((s) => s.profile);
  const inboxCount = useStore((s) => s.inboxItems.length);
  const setAssistantOpen = useUiStore((s) => s.setAssistantOpen);

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6 md:pt-10">
      <PageHeader title="Más" subtitle="Todo lo demás, ordenado" />

      <Card className="mb-5 flex items-center gap-3 p-4">
        <span className="text-3xl">{profile.avatarEmoji}</span>
        <div className="flex-1">
          <p className="font-semibold text-zinc-900 dark:text-zinc-50">{profile.name}</p>
          <p className="text-xs text-zinc-400">Toca Ajustes para personalizar tu experiencia</p>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const badge = item.to === '/mas/bandeja' && inboxCount > 0 ? inboxCount : null;
          return (
            <button
              key={item.to}
              onClick={() => (item.to === 'assistant' ? setAssistantOpen(true) : navigate(item.to))}
              className="flex items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white p-3.5 text-left shadow-sm transition-colors hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `${item.color}1f`, color: item.color }}>
                <Icon size={19} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{item.label}</p>
                <p className="truncate text-xs text-zinc-400">{item.desc}</p>
              </div>
              {badge && <span className="rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">{badge}</span>}
              <ChevronRight size={16} className="shrink-0 text-zinc-300" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
