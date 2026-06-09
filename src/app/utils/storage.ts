import { Todo, TodoCategory } from '../types';

const TODOS_KEY = 'todos';
const CATEGORIES_KEY = 'categories';

// 預設類別（localStorage 無資料時的初始值）
const DEFAULT_CATEGORIES: TodoCategory[] = [
  { id: '1', name: '仕事', color: '#F87556' },
  { id: '2', name: '個人', color: '#81DDE6' },
  { id: '3', name: '重要', color: '#2A89C6' },
];

/**
 * 安全讀取並解析 localStorage。
 * 任何失敗（JSON 損毀、值不是預期結構、瀏覽器封鎖儲存）都回退到 fallback，
 * 避免單一損壞的鍵值讓整個 App 崩潰白屏。
 */
function safeRead<T>(key: string, fallback: T, validate: (data: unknown) => data is T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (!validate(parsed)) {
      console.warn(`[storage] "${key}" 資料格式不符，已回退至預設值`);
      return fallback;
    }
    return parsed;
  } catch (err) {
    console.error(`[storage] 讀取 "${key}" 失敗，已回退至預設值`, err);
    return fallback;
  }
}

/**
 * 安全寫入 localStorage。
 * 捕捉配額用盡（QuotaExceededError）與隱私模式封鎖等例外，回傳是否成功，
 * 讓呼叫端有機會反應而非無聲失敗。
 */
function safeWrite(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`[storage] 寫入 "${key}" 失敗（可能是配額用盡或瀏覽器封鎖）`, err);
    return false;
  }
}

// --- 型別守衛：過濾掉結構不完整的資料，保護下游渲染 ---

function isTodo(value: unknown): value is Todo {
  if (typeof value !== 'object' || value === null) return false;
  const t = value as Record<string, unknown>;
  return (
    typeof t.id === 'string' &&
    typeof t.content === 'string' &&
    typeof t.date === 'string' &&
    typeof t.time === 'string' &&
    typeof t.completed === 'boolean' &&
    typeof t.createdAt === 'number'
  );
}

function isTodoArray(value: unknown): value is Todo[] {
  return Array.isArray(value) && value.every(isTodo);
}

function isCategory(value: unknown): value is TodoCategory {
  if (typeof value !== 'object' || value === null) return false;
  const c = value as Record<string, unknown>;
  return typeof c.id === 'string' && typeof c.name === 'string' && typeof c.color === 'string';
}

function isCategoryArray(value: unknown): value is TodoCategory[] {
  return Array.isArray(value) && value.every(isCategory);
}

export const storage = {
  getTodos(): Todo[] {
    return safeRead<Todo[]>(TODOS_KEY, [], isTodoArray);
  },

  saveTodos(todos: Todo[]): void {
    safeWrite(TODOS_KEY, todos);
  },

  getCategories(): TodoCategory[] {
    const stored = safeRead<TodoCategory[] | null>(
      CATEGORIES_KEY,
      null,
      (d): d is TodoCategory[] | null => d === null || isCategoryArray(d)
    );
    if (stored && stored.length > 0) return stored;
    // 初次使用或資料損毀：寫入並回傳預設類別
    safeWrite(CATEGORIES_KEY, DEFAULT_CATEGORIES);
    return DEFAULT_CATEGORIES;
  },

  saveCategories(categories: TodoCategory[]): void {
    safeWrite(CATEGORIES_KEY, categories);
  },
};
