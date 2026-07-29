import { addDays, format, nextDay, type Day } from 'date-fns';
import { es } from 'date-fns/locale';
import { dateKey } from './date';

export interface ParsedQuickAdd {
  title: string;
  date?: string;
  time?: string;
  duration?: number;
  priority?: 'urgent' | 'important' | 'normal' | 'low';
}

const WEEKDAYS: Record<string, number> = {
  domingo: 0, lunes: 1, martes: 2, miercoles: 3, 'miércoles': 3, jueves: 4, viernes: 5, sabado: 6, 'sábado': 6,
};

function stripAccents(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/**
 * Lightweight rule-based parser for Spanish quick-add phrases like
 * "Estudiar electricidad mañana de 10 a 12" or "Llamar al banco el viernes a las 9 urgente".
 * Not a full NLP engine — covers the common day/time/duration/priority patterns.
 */
export function parseQuickAdd(raw: string, now: Date = new Date()): ParsedQuickAdd {
  let text = raw.trim();
  const result: ParsedQuickAdd = { title: text };
  const lower = stripAccents(text.toLowerCase());

  // Priority keywords
  if (/\burgente\b/.test(lower)) result.priority = 'urgent';
  else if (/\bimportante\b/.test(lower)) result.priority = 'important';
  else if (/\bbaja prioridad\b|\bcuando pueda\b/.test(lower)) result.priority = 'low';

  // Date: hoy / mañana / pasado mañana / weekday name
  let dateMatch: string | undefined;
  let consumeRanges: [number, number][] = [];

  const findAndMark = (re: RegExp, apply: () => void) => {
    const m = lower.match(re);
    if (m && m.index !== undefined) {
      apply();
      consumeRanges.push([m.index, m.index + m[0].length]);
      return true;
    }
    return false;
  };

  if (findAndMark(/\bpasado ma[nñ]ana\b/, () => { dateMatch = dateKey(addDays(now, 2)); })) {
    // handled
  } else if (findAndMark(/\bma[nñ]ana\b/, () => { dateMatch = dateKey(addDays(now, 1)); })) {
    // handled
  } else if (findAndMark(/\bhoy\b/, () => { dateMatch = dateKey(now); })) {
    // handled
  } else {
    for (const [name, dayNum] of Object.entries(WEEKDAYS)) {
      const re = new RegExp(`\\bel ${name}\\b|\\b${name}\\b`);
      const m = lower.match(re);
      if (m && m.index !== undefined) {
        dateMatch = dateKey(nextDay(now, dayNum as Day));
        consumeRanges.push([m.index, m.index + m[0].length]);
        break;
      }
    }
  }
  if (dateMatch) result.date = dateMatch;

  // Time range: "de 10 a 12", "de 10:30 a 12:00", "10-12h"
  const rangeRe = /\bde\s+(\d{1,2})(?::(\d{2}))?\s*(?:h|hrs|horas)?\s*a\s*(?:las\s+)?(\d{1,2})(?::(\d{2}))?\s*(?:h|hrs|horas)?\b/;
  const rangeMatch = lower.match(rangeRe);
  if (rangeMatch && rangeMatch.index !== undefined) {
    const h1 = Number(rangeMatch[1]);
    const m1 = Number(rangeMatch[2] || 0);
    const h2 = Number(rangeMatch[3]);
    const m2 = Number(rangeMatch[4] || 0);
    result.time = `${String(h1).padStart(2, '0')}:${String(m1).padStart(2, '0')}`;
    const start = h1 * 60 + m1;
    let end = h2 * 60 + m2;
    if (end <= start) end += 12 * 60; // handle "10 a 12" meaning 10:00-12:00 not crossing midnight typically fine already
    result.duration = end - start;
    consumeRanges.push([rangeMatch.index, rangeMatch.index + rangeMatch[0].length]);
  } else {
    // Single time: "a las 10", "a las 10:30", "a las 9h"
    const timeRe = /\ba las\s+(\d{1,2})(?::(\d{2}))?\s*(?:h|hrs|horas)?\b/;
    const timeMatch = lower.match(timeRe);
    if (timeMatch && timeMatch.index !== undefined) {
      const h = Number(timeMatch[1]);
      const m = Number(timeMatch[2] || 0);
      result.time = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
      consumeRanges.push([timeMatch.index, timeMatch.index + timeMatch[0].length]);
    }
  }

  // Duration: "durante 1 hora", "por 30 minutos"
  const durRe = /\b(?:durante|por)\s+(\d+)\s*(min|minutos|h|hora|horas)\b/;
  const durMatch = lower.match(durRe);
  if (durMatch && durMatch.index !== undefined && !result.duration) {
    const n = Number(durMatch[1]);
    result.duration = durMatch[2].startsWith('h') ? n * 60 : n;
    consumeRanges.push([durMatch.index, durMatch.index + durMatch[0].length]);
  }

  // Strip priority keyword occurrences too
  const priorityRe = /\burgente\b|\bimportante\b|\bbaja prioridad\b|\bcuando pueda\b/;
  const prMatch = lower.match(priorityRe);
  if (prMatch && prMatch.index !== undefined) {
    consumeRanges.push([prMatch.index, prMatch.index + prMatch[0].length]);
  }

  if (consumeRanges.length) {
    // Remove matched ranges from the ORIGINAL text (case preserved), by mapping same offsets
    // since stripAccents/toLowerCase preserve length & indices 1:1.
    consumeRanges.sort((a, b) => b[0] - a[0]);
    let chars = text.split('');
    for (const [s, e] of consumeRanges) chars.splice(s, e - s);
    text = chars.join('').replace(/\s+/g, ' ').trim();
    text = text.replace(/^(el|los|las|del|,|-)\s+/i, '').replace(/\s+(el|los|las|del)$/i, '');
    text = text.replace(/\s+,/g, ',').trim();
  }

  result.title = text.charAt(0).toUpperCase() + text.slice(1);
  if (!result.title) result.title = raw.trim();
  return result;
}

export function formatParsedSummary(p: ParsedQuickAdd): string {
  const parts: string[] = [];
  if (p.date) parts.push(format(new Date(p.date + 'T00:00:00'), "EEEE d 'de' MMMM", { locale: es }));
  if (p.time) parts.push(`a las ${p.time}`);
  if (p.duration) parts.push(`(${p.duration >= 60 ? `${Math.round(p.duration / 60)} h` : `${p.duration} min`})`);
  if (p.priority) parts.push(`· ${p.priority}`);
  return parts.join(' ');
}
