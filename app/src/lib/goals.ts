import type { Goal } from '../types';

export function goalProgress(goal: Goal): number {
  if (!goal.steps.length) return 0;
  const doneCount = goal.steps.filter((s) => s.status === 'done').length;
  return Math.round((doneCount / goal.steps.length) * 100);
}
