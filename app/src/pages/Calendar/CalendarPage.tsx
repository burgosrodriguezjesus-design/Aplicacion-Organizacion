import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { addDays, addMonths, addWeeks, format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { DayView } from './DayView';
import { WeekView } from './WeekView';
import { MonthView } from './MonthView';
import { PlannerSheet } from './PlannerSheet';
import { todayKey } from '../../lib/date';

type ViewMode = 'day' | 'week' | 'month';

export function CalendarPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [view, setView] = useState<ViewMode>('week');
  const [anchor, setAnchor] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(todayKey());
  const [plannerOpen, setPlannerOpen] = useState(false);

  useEffect(() => {
    if (searchParams.get('plan') === '1') {
      setPlannerOpen(true);
      setSearchParams({}, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const navigate = (dir: 1 | -1) => {
    if (view === 'day') { const d = addDays(new Date(selectedDate + 'T00:00:00'), dir); setSelectedDate(format(d, 'yyyy-MM-dd')); setAnchor(d); }
    if (view === 'week') setAnchor((a) => addWeeks(a, dir));
    if (view === 'month') setAnchor((a) => addMonths(a, dir));
  };

  const goToday = () => { const t = new Date(); setAnchor(t); setSelectedDate(todayKey()); };

  const title = view === 'month'
    ? format(anchor, 'MMMM yyyy', { locale: es })
    : view === 'day'
      ? format(new Date(selectedDate + 'T00:00:00'), "EEEE, d 'de' MMMM", { locale: es })
      : `Semana del ${format(anchor, 'd MMM', { locale: es })}`;

  return (
    <div className="mx-auto max-w-4xl px-4 pt-6 sm:px-6 md:pt-10">
      <PageHeader
        title="Calendario"
        action={
          <Button variant="secondary" size="sm" onClick={() => setPlannerOpen(true)}>
            <Sparkles size={15} /> Organizar mi día
          </Button>
        }
      />

      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="!px-2"><ChevronLeft size={18} /></Button>
          <Button variant="ghost" size="sm" onClick={() => navigate(1)} className="!px-2"><ChevronRight size={18} /></Button>
          <button onClick={goToday} className="rounded-lg px-2 py-1 text-xs font-medium text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">Hoy</button>
        </div>
        <h2 className="flex-1 truncate text-center text-sm font-semibold capitalize text-zinc-700 dark:text-zinc-200 sm:text-base">{title}</h2>
        <div className="flex shrink-0 rounded-full bg-zinc-100 p-0.5 text-xs font-medium dark:bg-zinc-800">
          {(['day', 'week', 'month'] as ViewMode[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`rounded-full px-2.5 py-1 transition-colors ${view === v ? 'bg-white text-zinc-900 shadow-sm dark:bg-zinc-700 dark:text-zinc-50' : 'text-zinc-400'}`}
            >
              {v === 'day' ? 'Día' : v === 'week' ? 'Semana' : 'Mes'}
            </button>
          ))}
        </div>
      </div>

      {view === 'day' && <DayView date={selectedDate} />}
      {view === 'week' && <WeekView anchor={anchor} onSelectDay={(d) => { setSelectedDate(d); setView('day'); }} />}
      {view === 'month' && <MonthView anchor={anchor} onSelectDay={(d) => { setSelectedDate(d); setAnchor(new Date(d + 'T00:00:00')); setView('day'); }} />}

      <PlannerSheet open={plannerOpen} onClose={() => setPlannerOpen(false)} date={selectedDate} />
    </div>
  );
}
