import { useState } from 'react';
import { Plus, Trash2, Sunrise } from 'lucide-react';
import { useStore } from '../../store/store';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button, IconButton } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Field';
import { EmptyState } from '../../components/ui/EmptyState';
import { WEEKDAY_LABELS_SHORT } from '../../lib/date';

export function RoutinesPage() {
  const routines = useStore((s) => s.routines);
  const addRoutine = useStore((s) => s.addRoutine);
  const updateRoutine = useStore((s) => s.updateRoutine);
  const deleteRoutine = useStore((s) => s.deleteRoutine);
  const addRoutineStep = useStore((s) => s.addRoutineStep);
  const deleteRoutineStep = useStore((s) => s.deleteRoutineStep);

  const createRoutine = () => addRoutine({ name: 'Nueva rutina', type: 'custom', icon: '⭐' });

  return (
    <div className="mx-auto max-w-2xl px-4 pt-6 sm:px-6 md:pt-10">
      <PageHeader
        title="Rutinas"
        back
        subtitle="Estructura tus mañanas y noches"
        action={<Button variant="primary" size="sm" onClick={createRoutine}><Plus size={16} /> Nueva</Button>}
      />

      {routines.length === 0 ? (
        <EmptyState icon={<Sunrise className="text-zinc-300" />} title="Sin rutinas" subtitle="Crea una rutina de mañana o de noche con sus pasos y días activos." />
      ) : (
        <div className="space-y-4">
          {routines.map((r) => (
            <Card key={r.id} className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xl">{r.icon}</span>
                <input
                  value={r.name}
                  onChange={(e) => updateRoutine(r.id, { name: e.target.value })}
                  className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 outline-none dark:text-zinc-50"
                />
                <button
                  onClick={() => updateRoutine(r.id, { enabled: !r.enabled })}
                  className={`h-6 w-11 shrink-0 rounded-full transition-colors ${r.enabled ? 'bg-accent' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                >
                  <span className={`block h-5 w-5 translate-x-0.5 rounded-full bg-white shadow transition-transform ${r.enabled ? 'translate-x-[22px]' : ''}`} />
                </button>
                <IconButton size="sm" onClick={() => deleteRoutine(r.id)} className="text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"><Trash2 size={14} /></IconButton>
              </div>

              <div className="mb-3 flex gap-1.5">
                {WEEKDAY_LABELS_SHORT.map((label, i) => {
                  const active = r.activeDays.includes(i);
                  return (
                    <button
                      key={i}
                      onClick={() => updateRoutine(r.id, { activeDays: active ? r.activeDays.filter((d) => d !== i) : [...r.activeDays, i].sort() })}
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                        active ? 'bg-accent text-white' : 'bg-zinc-100 text-zinc-400 dark:bg-zinc-800'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-1.5">
                {r.steps.map((step) => (
                  <div key={step.id} className="flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
                    <span className="w-14 shrink-0 text-xs font-semibold tabular-nums text-zinc-400">{step.time}</span>
                    <span className="flex-1 text-sm text-zinc-700 dark:text-zinc-200">{step.title}</span>
                    <IconButton size="sm" onClick={() => deleteRoutineStep(r.id, step.id)}><Trash2 size={13} /></IconButton>
                  </div>
                ))}
                <StepAdder onAdd={(time, title) => addRoutineStep(r.id, time, title)} />
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StepAdder({ onAdd }: { onAdd: (time: string, title: string) => void }) {
  const [time, setTime] = useState('08:00');
  const [title, setTitle] = useState('');
  return (
    <div className="flex gap-1.5 pt-1">
      <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} className="w-28 shrink-0" />
      <Input
        placeholder="Añadir paso..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && title.trim()) { onAdd(time, title.trim()); setTitle(''); } }}
      />
      <IconButton onClick={() => { if (title.trim()) { onAdd(time, title.trim()); setTitle(''); } }}><Plus size={16} /></IconButton>
    </div>
  );
}
