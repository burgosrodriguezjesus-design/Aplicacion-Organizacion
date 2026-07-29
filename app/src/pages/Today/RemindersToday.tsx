import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useStore } from '../../store/store';
import { Card } from '../../components/ui/Card';

export function RemindersToday({ date }: { date: string }) {
  const allReminders = useStore((s) => s.reminders);
  const reminders = useMemo(() => allReminders.filter((r) => r.date === date && !r.done), [allReminders, date]);
  const toggleReminderDone = useStore((s) => s.toggleReminderDone);
  const navigate = useNavigate();

  if (!reminders.length) return null;

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Recordatorios</h3>
        <button onClick={() => navigate('/mas/recordatorios')} className="text-xs font-medium text-accent">Ver todos</button>
      </div>
      <div className="space-y-1.5">
        {reminders.map((r) => (
          <label key={r.id} className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
            <input type="checkbox" checked={r.done} onChange={() => toggleReminderDone(r.id)} className="h-4 w-4 accent-[var(--accent)]" />
            <Bell size={14} className="shrink-0 text-orange-400" />
            <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-200">{r.title}</span>
            <span className="text-xs text-zinc-400">{r.time}</span>
          </label>
        ))}
      </div>
    </Card>
  );
}
