import { useMemo, useState } from 'react';
import { Plus, Target } from 'lucide-react';
import { useStore } from '../../store/store';
import { useUiStore } from '../../store/uiStore';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { CategoryChip } from '../../components/ui/Meta';
import { GOAL_PERIOD_META, type GoalPeriod } from '../../types';
import { goalProgress } from '../../lib/goals';

const PERIODS: GoalPeriod[] = ['daily', 'weekly', 'monthly', 'yearly'];

const PERIOD_PLURAL: Record<GoalPeriod, string> = {
  daily: 'diarios', weekly: 'semanales', monthly: 'mensuales', yearly: 'anuales',
};

export function GoalsPage() {
  const allGoals = useStore((s) => s.goals);
  const goals = useMemo(() => allGoals.filter((g) => !g.archived), [allGoals]);
  const cycleGoalStep = useStore((s) => s.cycleGoalStep);
  const setEditingGoalId = useUiStore((s) => s.setEditingGoalId);
  const [period, setPeriod] = useState<GoalPeriod>('weekly');

  const filtered = useMemo(() => goals.filter((g) => g.period === period), [goals, period]);

  return (
    <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6 md:pt-10">
      <PageHeader
        title="Objetivos"
        subtitle="Divide lo grande en pasos pequeños"
        action={<Button variant="primary" size="sm" onClick={() => setEditingGoalId('new')}><Plus size={16} /> Nuevo</Button>}
      />

      <div className="mb-5 flex gap-1.5 overflow-x-auto">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              period === p ? 'border-accent bg-accent/10 text-accent' : 'border-zinc-200 text-zinc-500 dark:border-zinc-700'
            }`}
          >
            {GOAL_PERIOD_META[p]}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Target className="text-zinc-300" />}
          title={`Sin objetivos ${PERIOD_PLURAL[period]}`}
          subtitle="Define un objetivo y divídelo en pasos pequeños para avanzar cada día."
          action={<Button variant="secondary" size="sm" onClick={() => setEditingGoalId('new')} className="mt-1">Crear objetivo</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {filtered.map((g) => {
            const pct = goalProgress(g);
            return (
              <Card key={g.id} className="p-4">
                <button onClick={() => setEditingGoalId(g.id)} className="mb-2 flex w-full items-start justify-between gap-2 text-left">
                  <div>
                    <p className="font-semibold text-zinc-900 dark:text-zinc-50">🎯 {g.title}</p>
                    {g.categoryId && <div className="mt-1"><CategoryChip categoryId={g.categoryId} /></div>}
                  </div>
                  <span className="shrink-0 text-sm font-bold text-accent">{pct}%</span>
                </button>
                <ProgressBar value={pct} className="mb-3" />
                <div className="space-y-1">
                  {g.steps.slice(0, 5).map((st) => (
                    <button
                      key={st.id}
                      onClick={() => cycleGoalStep(g.id, st.id)}
                      className="flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                    >
                      <span>{st.status === 'done' ? '✅' : st.status === 'in_progress' ? '⏳' : '❌'}</span>
                      <span className={st.status === 'done' ? 'text-zinc-400 line-through' : 'text-zinc-600 dark:text-zinc-300'}>{st.title}</span>
                    </button>
                  ))}
                  {g.steps.length > 5 && (
                    <button onClick={() => setEditingGoalId(g.id)} className="pl-1 text-xs text-accent">
                      +{g.steps.length - 5} pasos más
                    </button>
                  )}
                  {g.steps.length === 0 && (
                    <button onClick={() => setEditingGoalId(g.id)} className="pl-1 text-xs text-zinc-400">Añadir pasos...</button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
