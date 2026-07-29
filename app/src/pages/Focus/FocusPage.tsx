import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Play, Pause, RotateCcw, X, Check, Coffee, Timer } from 'lucide-react';
import { useStore } from '../../store/store';
import { Button, IconButton } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { useCountdown } from './useCountdown';

export function FocusPage() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const tasks = useStore((s) => s.tasks);
  const setTaskStatusForDate = useStore((s) => s.setTaskStatusForDate);
  const profile = useStore((s) => s.profile);

  const task = tasks.find((t) => t.id === taskId);
  const pendingTasks = tasks.filter((t) => t.status === 'pending');

  if (!taskId) {
    return (
      <div className="mx-auto max-w-md px-4 pt-10 text-center">
        <h1 className="mb-1 text-2xl font-bold text-zinc-900 dark:text-zinc-50">Modo foco</h1>
        <p className="mb-6 text-sm text-zinc-400">Elige una tarea para concentrarte en ella, sin distracciones.</p>
        {pendingTasks.length === 0 ? (
          <EmptyState icon={<Timer className="text-zinc-300" />} title="No tienes tareas pendientes" subtitle="Crea una tarea primero para poder enfocarte en ella." />
        ) : (
          <div className="space-y-2 text-left">
            {pendingTasks.slice(0, 8).map((t) => (
              <button
                key={t.id}
                onClick={() => navigate(`/foco/${t.id}`)}
                className="flex w-full items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-700 hover:border-accent dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
              >
                {t.title}
                <Play size={15} className="text-accent" />
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  if (!task) {
    return (
      <div className="mx-auto max-w-md px-4 pt-10 text-center">
        <EmptyState icon={<Timer className="text-zinc-300" />} title="Tarea no encontrada" subtitle="Puede que ya se haya eliminado." action={<Button onClick={() => navigate('/foco')} className="mt-2">Volver</Button>} />
      </div>
    );
  }

  return <FocusSession key={task.id} taskId={task.id} taskTitle={task.title} pomodoroWork={profile.pomodoroWork} pomodoroBreak={profile.pomodoroBreak} onComplete={() => { setTaskStatusForDate(task.id, task.date || new Date().toISOString().slice(0, 10), 'completed'); navigate('/'); }} />;
}

function FocusSession({ taskTitle, pomodoroWork, pomodoroBreak, onComplete }: { taskId: string; taskTitle: string; pomodoroWork: number; pomodoroBreak: number; onComplete: () => void }) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [cycles, setCycles] = useState(0);

  const totalSeconds = (mode === 'work' ? pomodoroWork : pomodoroBreak) * 60;
  const { secondsLeft, running, setRunning, reset } = useCountdown(totalSeconds, () => {
    if (mode === 'work') { setCycles((c) => c + 1); setMode('break'); }
    else setMode('work');
  });

  const pct = useMemo(() => 100 - (secondsLeft / totalSeconds) * 100, [secondsLeft, totalSeconds]);
  const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const seconds = String(secondsLeft % 60).padStart(2, '0');

  const size = 240;
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <button onClick={() => navigate(-1)} className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
        <X size={18} />
      </button>

      <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent">
        {mode === 'work' ? <><Timer size={13} /> Enfocado</> : <><Coffee size={13} /> Descanso</>}
      </p>
      <h1 className="mb-8 max-w-xs text-xl font-bold text-zinc-900 dark:text-zinc-50">{mode === 'work' ? taskTitle : 'Tómate un respiro'}</h1>

      <div className="relative mb-8" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="currentColor" strokeWidth={stroke} fill="none" className="text-zinc-100 dark:text-zinc-800" />
          <circle
            cx={size / 2} cy={size / 2} r={radius} stroke="var(--accent)" strokeWidth={stroke} fill="none" strokeLinecap="round"
            strokeDasharray={circumference} strokeDashoffset={circumference - (pct / 100) * circumference}
            className="transition-[stroke-dashoffset] duration-1000 ease-linear"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold tabular-nums text-zinc-900 dark:text-zinc-50">{minutes}:{seconds}</span>
          <span className="mt-1 text-xs text-zinc-400">{cycles} {cycles === 1 ? 'ciclo' : 'ciclos'} completados</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <IconButton size="lg" onClick={() => reset()} className="border border-zinc-200 dark:border-zinc-800"><RotateCcw size={18} /></IconButton>
        <button
          onClick={() => setRunning((r) => !r)}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-accent/30 transition-transform active:scale-95"
        >
          {running ? <Pause size={26} /> : <Play size={26} className="ml-0.5" />}
        </button>
        <IconButton size="lg" onClick={onComplete} className="border border-emerald-200 text-emerald-600 dark:border-emerald-900"><Check size={18} /></IconButton>
      </div>
      <p className="mt-6 text-xs text-zinc-400">Pomodoro: {pomodoroWork} min trabajo · {pomodoroBreak} min descanso</p>
    </div>
  );
}
