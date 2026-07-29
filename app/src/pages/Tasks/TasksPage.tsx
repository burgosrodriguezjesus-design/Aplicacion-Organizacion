import { useMemo, useState } from 'react';
import { Plus, ChevronDown, CheckSquare } from 'lucide-react';
import { useStore } from '../../store/store';
import { useUiStore } from '../../store/uiStore';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Field';
import { EmptyState } from '../../components/ui/EmptyState';
import { TaskRow } from './TaskRow';
import { groupTasks } from '../../lib/taskGroups';
import { parseQuickAdd, formatParsedSummary } from '../../lib/nlp';
import { todayKey } from '../../lib/date';

const SECTIONS: { key: keyof ReturnType<typeof groupTasks>; title: string; icon: string }[] = [
  { key: 'today', title: 'Hoy', icon: '🔥' },
  { key: 'important', title: 'Importantes', icon: '⭐' },
  { key: 'upcoming', title: 'Con fecha', icon: '⏰' },
  { key: 'whenever', title: 'Cuando tengas tiempo', icon: '💡' },
];

export function TasksPage() {
  const tasks = useStore((s) => s.tasks);
  const categories = useStore((s) => s.categories);
  const addTask = useStore((s) => s.addTask);
  const setEditingTaskId = useUiStore((s) => s.setEditingTaskId);
  const [quickText, setQuickText] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const today = todayKey();
  const groups = useMemo(() => groupTasks(tasks, today), [tasks, today]);

  const filterFn = (t: (typeof tasks)[number]) => !categoryFilter || t.categoryId === categoryFilter;

  const parsed = quickText ? parseQuickAdd(quickText) : null;

  const submitQuick = () => {
    if (!quickText.trim()) return;
    const p = parseQuickAdd(quickText);
    addTask({ title: p.title, date: p.date, time: p.time, duration: p.duration, priority: p.priority });
    setQuickText('');
  };

  const totalVisible = SECTIONS.reduce((sum, s) => sum + groups[s.key].filter(filterFn).length, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6 md:pt-10">
      <PageHeader
        title="Tareas"
        subtitle={`${tasks.filter((t) => t.status !== 'completed').length} en total`}
        action={<Button variant="primary" size="sm" onClick={() => setEditingTaskId('new')}><Plus size={16} /> Nueva</Button>}
      />

      <div className="mb-4">
        <Input
          placeholder='Escribe y pulsa Enter: "Estudiar electricidad mañana de 10 a 12"'
          value={quickText}
          onChange={(e) => setQuickText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submitQuick()}
        />
        {parsed && quickText && <p className="mt-1.5 pl-1 text-xs text-accent">✓ {formatParsedSummary(parsed) || 'se creará sin fecha ni hora'}</p>}
      </div>

      {categories.length > 0 && (
        <div className="mb-5 flex flex-wrap gap-1.5">
          <button
            onClick={() => setCategoryFilter(null)}
            className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${!categoryFilter ? 'border-accent bg-accent/10 text-accent' : 'border-zinc-200 text-zinc-500 dark:border-zinc-700'}`}
          >
            Todas
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(categoryFilter === c.id ? null : c.id)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${categoryFilter === c.id ? 'border-accent bg-accent/10 text-accent' : 'border-zinc-200 text-zinc-500 dark:border-zinc-700'}`}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>
      )}

      {totalVisible === 0 && groups.completed.length === 0 ? (
        <EmptyState
          icon={<CheckSquare className="text-zinc-300" />}
          title="No tienes tareas todavía"
          subtitle="Crea tu primera tarea escribiendo arriba o con el botón Nueva."
        />
      ) : (
        <div className="space-y-6">
          {SECTIONS.map((section) => {
            const items = groups[section.key].filter(filterFn);
            if (!items.length) return null;
            return (
              <div key={section.key}>
                <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                  <span>{section.icon}</span> {section.title} <span className="text-xs font-normal text-zinc-400">({items.length})</span>
                </h2>
                <div className="space-y-2">
                  {items.map((t) => <TaskRow key={t.id} task={t} />)}
                </div>
              </div>
            );
          })}

          {groups.completed.length > 0 && (
            <div>
              <button onClick={() => setShowCompleted((v) => !v)} className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-zinc-400">
                <ChevronDown size={15} className={`transition-transform ${showCompleted ? '' : '-rotate-90'}`} />
                Completadas ({groups.completed.length})
              </button>
              {showCompleted && (
                <div className="space-y-2 opacity-70">
                  {groups.completed.filter(filterFn).map((t) => <TaskRow key={t.id} task={t} />)}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
