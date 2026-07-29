import { addDays } from 'date-fns';
import type { Task, CalendarEvent } from '../types';
import { PRIORITY_META } from '../types';
import { dateKey, WEEKDAY_LABELS_LONG } from './date';
import { tasksOnDate, eventsOnDate, taskStatusOnDate } from '../store/store';
import { parseQuickAdd } from './nlp';

export interface AssistantContext {
  tasks: Task[];
  events: CalendarEvent[];
  today: string;
}

export interface AssistantAction {
  label: string;
  run: () => void;
}

export interface AssistantReply {
  text: string;
  action?: AssistantAction;
}

function stripAccents(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

const WEEKDAYS: Record<string, number> = {
  domingo: 0, lunes: 1, martes: 2, miercoles: 3, jueves: 4, viernes: 5, sabado: 6,
};

/**
 * Rule-based interpreter for the assistant command bar. It recognizes a
 * fixed set of Spanish intents (query today, list pending, move an item,
 * plan the day, quick-create) and always returns a confirmable action for
 * anything that mutates data — nothing changes without the user pressing
 * the action button.
 */
export function interpretCommand(
  raw: string,
  ctx: AssistantContext,
  helpers: {
    goToPlanner: () => void;
    findEventByName: (name: string) => CalendarEvent | undefined;
    findTaskByName: (name: string) => Task | undefined;
    moveEventDate: (id: string, date: string) => void;
    moveTaskDate: (id: string, date: string) => void;
    addTask: (t: Partial<Task> & { title: string }) => void;
  },
): AssistantReply {
  const text = raw.trim();
  const lower = stripAccents(text.toLowerCase());

  // ¿Qué tengo que hacer hoy? / mañana
  if (/que tengo (que hacer|hoy|pendiente)/.test(lower) || /^que hay hoy/.test(lower)) {
    const targetDate = /manana/.test(lower) ? dateKey(addDays(new Date(), 1)) : ctx.today;
    const tks = tasksOnDate(ctx.tasks, targetDate).filter((t) => taskStatusOnDate(t, targetDate) !== 'completed');
    const evs = eventsOnDate(ctx.events, targetDate);
    if (!tks.length && !evs.length) return { text: 'No tienes nada planeado para ese día. 🎉' };
    const lines = [
      ...evs.map((e) => `• ${e.startTime} ${e.title}`),
      ...tks.map((t) => `• ${t.time ? t.time + ' ' : ''}${PRIORITY_META[t.priority].emoji} ${t.title}`),
    ];
    return { text: `Esto es lo que tienes:\n${lines.join('\n')}` };
  }

  // ¿Qué tareas tengo pendientes?
  if (/tareas.*pendientes/.test(lower)) {
    const pending = ctx.tasks.filter((t) => taskStatusOnDate(t, ctx.today) === 'pending');
    if (!pending.length) return { text: 'No tienes tareas pendientes. ¡Vas al día! ✅' };
    return { text: pending.map((t) => `• ${PRIORITY_META[t.priority].emoji} ${t.title}`).join('\n') };
  }

  // Organízame / planifica mi día / reorganízame
  if (/organiza(me)?|planifica|reorganiza(me)?/.test(lower) && !/semana/.test(lower)) {
    return {
      text: 'Puedo proponerte un horario para hoy según tus tareas, eventos y prioridades.',
      action: { label: 'Abrir planificador', run: helpers.goToPlanner },
    };
  }

  // Planifica mi semana
  if (/planifica.*semana/.test(lower)) {
    return {
      text: 'De momento puedo planificar día a día — abre el planificador para cada jornada de la semana desde Calendario.',
      action: { label: 'Ir al calendario', run: helpers.goToPlanner },
    };
  }

  // Muéveme <cosa> a/al <día>
  const moveMatch = lower.match(/mueve(me)?\s+(?:el|la|los|las)?\s*(.+?)\s+(?:al?|a el)\s+(\w+)/);
  if (moveMatch) {
    const name = moveMatch[2].trim();
    const dayWord = moveMatch[3].trim();
    let targetDate: string | undefined;
    if (dayWord === 'hoy') targetDate = ctx.today;
    else if (dayWord === 'manana' || dayWord === 'mañana') targetDate = dateKey(addDays(new Date(), 1));
    else if (dayWord in WEEKDAYS) {
      const target = WEEKDAYS[dayWord];
      let d = new Date();
      for (let i = 1; i <= 7; i++) {
        d = addDays(new Date(), i);
        if (d.getDay() === target) break;
      }
      targetDate = dateKey(d);
    }
    if (!targetDate) return { text: `No he entendido a qué día moverlo. Prueba con "muéveme X al jueves".` };

    const event = helpers.findEventByName(name);
    if (event) {
      const dayLabel = WEEKDAY_LABELS_LONG[new Date(targetDate + 'T00:00:00').getDay()];
      return {
        text: `¿Muevo "${event.title}" al ${dayLabel}?`,
        action: { label: `Mover a ${dayLabel}`, run: () => helpers.moveEventDate(event.id, targetDate!) },
      };
    }
    const task = helpers.findTaskByName(name);
    if (task) {
      const dayLabel = WEEKDAY_LABELS_LONG[new Date(targetDate + 'T00:00:00').getDay()];
      return {
        text: `¿Muevo la tarea "${task.title}" al ${dayLabel}?`,
        action: { label: `Mover a ${dayLabel}`, run: () => helpers.moveTaskDate(task.id, targetDate!) },
      };
    }
    return { text: `No he encontrado nada llamado "${name}".` };
  }

  // Quiero <hacer algo> — free-form quick creation via the same NLP parser as quick add
  if (/^quiero\s+/.test(lower) || /^necesito\s+/.test(lower)) {
    const stripped = text.replace(/^\s*(quiero|necesito)\s+/i, '');
    const parsed = parseQuickAdd(stripped);
    return {
      text: `Puedo crear la tarea "${parsed.title}"${parsed.date ? ` para el ${parsed.date}` : ''}${parsed.time ? ` a las ${parsed.time}` : ''}.`,
      action: {
        label: 'Crear tarea',
        run: () => helpers.addTask({ title: parsed.title, date: parsed.date || ctx.today, time: parsed.time, duration: parsed.duration, priority: parsed.priority }),
      },
    };
  }

  return {
    text: 'Puedo ayudarte con: "¿qué tengo que hacer hoy?", "organízame el día", "muéveme X al jueves" o "quiero estudiar 2 horas esta tarde".',
  };
}
