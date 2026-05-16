import { Todo } from '../types';
import { getLocalDateString } from './date';

function parseDate(ymd: string): Date {
  const [y, m, d] = ymd.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(d: Date): string {
  return getLocalDateString(d);
}

function addDays(d: Date, days: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(d: Date, months: number): Date {
  const next = new Date(d);
  next.setMonth(next.getMonth() + months);
  return next;
}

function nextWeekday(from: Date): Date {
  let next = addDays(from, 1);
  while (next.getDay() === 0 || next.getDay() === 6) {
    next = addDays(next, 1);
  }
  return next;
}

function nextWeeklyDay(from: Date, daysOfWeek: number[], interval: number): Date {
  const sorted = [...daysOfWeek].sort((a, b) => a - b);
  const fromDay = from.getDay();

  for (const day of sorted) {
    if (day > fromDay) {
      return addDays(from, day - fromDay);
    }
  }

  const daysUntilNextWeek = 7 - fromDay + sorted[0] + (interval - 1) * 7;
  return addDays(from, daysUntilNextWeek);
}

export function getNextOccurrence(todo: Todo): string | null {
  const { recurrence, date } = todo;
  if (!recurrence) return null;

  const current = parseDate(date);
  const interval = Math.max(1, recurrence.interval ?? 1);

  switch (recurrence.type) {
    case 'daily':
      return formatDate(addDays(current, interval));
    case 'weekdays':
      return formatDate(nextWeekday(current));
    case 'weekly': {
      const days = recurrence.daysOfWeek?.length
        ? recurrence.daysOfWeek
        : [current.getDay()];
      return formatDate(nextWeeklyDay(current, days, interval));
    }
    case 'monthly':
      return formatDate(addMonths(current, interval));
    case 'custom': {
      if (recurrence.daysOfWeek?.length) {
        return formatDate(nextWeeklyDay(current, recurrence.daysOfWeek, interval));
      }
      return formatDate(addDays(current, interval));
    }
    default:
      return null;
  }
}

export function getRecurrenceLabel(recurrence: Todo['recurrence']): string {
  if (!recurrence) return '';
  switch (recurrence.type) {
    case 'daily':
      return recurrence.interval && recurrence.interval > 1
        ? `${recurrence.interval}日ごと`
        : '毎日';
    case 'weekly':
      return recurrence.interval && recurrence.interval > 1
        ? `${recurrence.interval}週ごと`
        : '毎週';
    case 'monthly':
      return recurrence.interval && recurrence.interval > 1
        ? `${recurrence.interval}ヶ月ごと`
        : '毎月';
    case 'weekdays':
      return '平日のみ';
    case 'custom':
      return 'カスタム';
    default:
      return '';
  }
}
