export interface ParsedIntent {
  cleanedContent: string;
  date?: string;
  priority?: 'low' | 'medium' | 'high';
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function getNextWeekday(targetDay: number): Date {
  const today = new Date();
  const todayDay = today.getDay();
  // Days to the next Monday (1), always at least 1 day ahead
  const daysToNextMonday = ((1 - todayDay) + 7) % 7 || 7;
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + daysToNextMonday);
  // Offset from Monday (Mon=1→0, Tue=2→1, ..., Sun=0→6)
  const offset = targetDay === 0 ? 6 : targetDay - 1;
  const result = new Date(nextMonday);
  result.setDate(nextMonday.getDate() + offset);
  return result;
}

export function parseIntent(rawText: string): ParsedIntent {
  let text = rawText.trim();
  let date: string | undefined;
  let priority: 'low' | 'medium' | 'high' | undefined;

  const today = new Date();

  // --- Date parsing (longest/most-specific patterns first) ---

  if (/後天|あさって|明後日/.test(text)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 2);
    date = formatDate(d);
    text = text.replace(/後天|あさって|明後日/g, '');
  } else if (/明天|あした|明日/.test(text)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    date = formatDate(d);
    text = text.replace(/明天|あした|明日/g, '');
  } else if (/今天|今日|きょう/.test(text)) {
    date = formatDate(today);
    text = text.replace(/今天|今日|きょう/g, '');
  }

  // Next-week day patterns: 下週一~下週日 / 来週月曜日~来週日曜日 / 下周一~下周日
  const nextWeekPatterns: [RegExp, number][] = [
    [/下週日|来週日曜日?|下周日/, 0],
    [/下週一|来週月曜日?|下周一/, 1],
    [/下週二|来週火曜日?|下周二/, 2],
    [/下週三|来週水曜日?|下周三/, 3],
    [/下週四|来週木曜日?|下周四/, 4],
    [/下週五|来週金曜日?|下周五/, 5],
    [/下週六|来週土曜日?|下周六/, 6],
  ];

  if (!date) {
    for (const [pattern, dayIndex] of nextWeekPatterns) {
      if (pattern.test(text)) {
        date = formatDate(getNextWeekday(dayIndex));
        text = text.replace(pattern, '');
        break;
      }
    }
  }

  // --- Priority parsing ---

  if (/重要|高優先|高优先|緊急|urgent|important/i.test(text)) {
    priority = 'high';
    text = text.replace(/重要|高優先|高优先|緊急|urgent|important/gi, '');
  } else if (/中優先|優先度中|普通|normal|中等/i.test(text)) {
    priority = 'medium';
    text = text.replace(/中優先|優先度中|普通|normal|中等/gi, '');
  } else if (/低優先|優先度低/i.test(text)) {
    priority = 'low';
    text = text.replace(/低優先|優先度低/gi, '');
  }

  const cleanedContent = text.replace(/\s+/g, ' ').trim();

  return { cleanedContent: cleanedContent || rawText.trim(), date, priority };
}
