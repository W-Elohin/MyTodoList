export interface ParsedIntent {
  cleanedContent: string;
  date?: string;
  priority?: 'low' | 'medium' | 'high';
}

/** Stub — Claude Pro 將提供完整 NLP 解析 */
export function parseIntent(text: string): ParsedIntent {
  const trimmed = text.trim();
  let cleanedContent = trimmed;
  let date: string | undefined;
  let priority: ParsedIntent['priority'];

  const today = new Date();
  const toYmd = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

  if (/明天|明日/.test(trimmed)) {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    date = toYmd(d);
    cleanedContent = cleanedContent.replace(/明天|明日/g, '').trim();
  } else if (/今天|今日/.test(trimmed)) {
    date = toYmd(today);
    cleanedContent = cleanedContent.replace(/今天|今日/g, '').trim();
  }

  if (/高優先|優先度高|重要/.test(trimmed)) {
    priority = 'high';
    cleanedContent = cleanedContent.replace(/高優先|優先度高|重要/g, '').trim();
  } else if (/中優先|優先度中/.test(trimmed)) {
    priority = 'medium';
    cleanedContent = cleanedContent.replace(/中優先|優先度中/g, '').trim();
  } else if (/低優先|優先度低/.test(trimmed)) {
    priority = 'low';
    cleanedContent = cleanedContent.replace(/低優先|優先度低/g, '').trim();
  }

  return { cleanedContent: cleanedContent || trimmed, date, priority };
}
