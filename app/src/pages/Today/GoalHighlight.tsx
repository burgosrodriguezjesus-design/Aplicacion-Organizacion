import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store/store';
import { Card } from '../../components/ui/Card';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { goalProgress } from '../../lib/goals';

export function GoalHighlight() {
  const allGoals = useStore((s) => s.goals);
  const goals = useMemo(() => allGoals.filter((g) => !g.archived), [allGoals]);
  const navigate = useNavigate();

  if (!goals.length) return null;

  const withProgress = goals.map((g) => ({ goal: g, pct: goalProgress(g) })).filter((g) => g.pct < 100);
  const highlight = withProgress.sort((a, b) => b.pct - a.pct)[0] || { goal: goals[0], pct: goalProgress(goals[0]) };

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Objetivo destacado</h3>
        <button onClick={() => navigate('/objetivos')} className="text-xs font-medium text-accent">Ver todos</button>
      </div>
      <p className="mb-2 text-sm text-zinc-700 dark:text-zinc-200">🎯 {highlight.goal.title}</p>
      <div className="flex items-center gap-2">
        <ProgressBar value={highlight.pct} />
        <span className="w-9 shrink-0 text-right text-xs font-semibold text-zinc-500">{highlight.pct}%</span>
      </div>
    </Card>
  );
}
