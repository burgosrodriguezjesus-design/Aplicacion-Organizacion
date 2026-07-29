import { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Sheet } from '../ui/Sheet';
import { Button, IconButton } from '../ui/Button';
import { Input, Textarea, Select, Label } from '../ui/Field';
import { useStore } from '../../store/store';
import { useUiStore } from '../../store/uiStore';
import { GOAL_PERIOD_META, type GoalPeriod } from '../../types';
import { todayKey } from '../../lib/date';

export function GoalEditorSheet() {
  const editingId = useUiStore((s) => s.editingGoalId);
  const setEditingId = useUiStore((s) => s.setEditingGoalId);
  const goal = useStore((s) => s.goals.find((g) => g.id === editingId));
  const categories = useStore((s) => s.categories);
  const addGoal = useStore((s) => s.addGoal);
  const updateGoal = useStore((s) => s.updateGoal);
  const deleteGoal = useStore((s) => s.deleteGoal);
  const addGoalStep = useStore((s) => s.addGoalStep);
  const deleteGoalStep = useStore((s) => s.deleteGoalStep);
  const updateGoalStep = useStore((s) => s.updateGoalStep);

  const isNew = editingId === 'new';
  const open = editingId !== null;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [period, setPeriod] = useState<GoalPeriod>('weekly');
  const [date, setDate] = useState(todayKey());
  const [categoryId, setCategoryId] = useState<string | undefined>();
  const [stepsText, setStepsText] = useState('');
  const [newStep, setNewStep] = useState('');

  useEffect(() => {
    if (isNew) {
      setTitle(''); setDescription(''); setPeriod('weekly'); setDate(todayKey()); setCategoryId(undefined); setStepsText('');
    } else if (goal) {
      setTitle(goal.title); setDescription(goal.description || ''); setPeriod(goal.period);
      setDate(goal.date); setCategoryId(goal.categoryId);
    }
  }, [editingId, isNew, goal]);

  if (!open || (!isNew && !goal)) return null;

  const close = () => setEditingId(null);

  const save = () => {
    if (!title.trim()) return;
    if (isNew) {
      const steps = stepsText.split('\n').map((s) => s.trim()).filter(Boolean).map((s) => ({ id: crypto.randomUUID(), title: s, status: 'pending' as const }));
      addGoal({ title: title.trim(), description, period, date, categoryId, steps });
    } else if (goal) {
      updateGoal(goal.id, { title: title.trim(), description, period, date, categoryId });
    }
    close();
  };

  const remove = () => {
    if (goal) deleteGoal(goal.id);
    close();
  };

  return (
    <Sheet
      open
      onClose={close}
      title={isNew ? 'Nuevo objetivo' : 'Editar objetivo'}
      footer={
        <div className="flex gap-2">
          {!isNew && <IconButton onClick={remove} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"><Trash2 size={18} /></IconButton>}
          <Button variant="primary" fullWidth onClick={save} disabled={!title.trim()}>Guardar</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Input autoFocus placeholder="Ej: Aprender electricidad" value={title} onChange={(e) => setTitle(e.target.value)} />
        <Textarea placeholder="Descripción (opcional)" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />

        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Periodo</Label>
            <Select value={period} onChange={(e) => setPeriod(e.target.value as GoalPeriod)}>
              {(Object.keys(GOAL_PERIOD_META) as GoalPeriod[]).map((p) => <option key={p} value={p}>{GOAL_PERIOD_META[p]}</option>)}
            </Select>
          </div>
          <div>
            <Label>Fecha de referencia</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div>
          <Label>Categoría</Label>
          <Select value={categoryId || ''} onChange={(e) => setCategoryId(e.target.value || undefined)}>
            <option value="">Sin categoría</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </Select>
        </div>

        {isNew ? (
          <div>
            <Label>Pasos (uno por línea)</Label>
            <Textarea rows={4} placeholder={'Terminar tema 1\nTerminar tema 2\nHacer ejercicios'} value={stepsText} onChange={(e) => setStepsText(e.target.value)} />
          </div>
        ) : goal && (
          <div>
            <Label>Pasos</Label>
            <div className="space-y-1.5">
              {goal.steps.map((st) => (
                <div key={st.id} className="flex items-center gap-2 rounded-lg px-1 py-1 hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
                  <input
                    type="checkbox"
                    checked={st.status === 'done'}
                    onChange={(e) => updateGoalStep(goal.id, st.id, { status: e.target.checked ? 'done' : 'pending' })}
                    className="h-4 w-4 accent-[var(--accent)]"
                  />
                  <span className={`flex-1 text-sm ${st.status === 'done' ? 'text-zinc-400 line-through' : 'text-zinc-700 dark:text-zinc-200'}`}>{st.title}</span>
                  <IconButton size="sm" onClick={() => deleteGoalStep(goal.id, st.id)}><Trash2 size={14} /></IconButton>
                </div>
              ))}
              <div className="flex gap-1.5">
                <Input
                  placeholder="Añadir paso..."
                  value={newStep}
                  onChange={(e) => setNewStep(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && newStep.trim()) { addGoalStep(goal.id, newStep.trim()); setNewStep(''); } }}
                />
                <IconButton onClick={() => { if (newStep.trim()) { addGoalStep(goal.id, newStep.trim()); setNewStep(''); } }}>
                  <Plus size={16} />
                </IconButton>
              </div>
            </div>
          </div>
        )}
      </div>
    </Sheet>
  );
}
