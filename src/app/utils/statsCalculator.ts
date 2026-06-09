import { Todo } from '../types';
import { getLocalDateString } from './date';

type WeeklyDatum = { date: string; count: number };
type CategoryDatum = { name: string; color: string; count: number };

const getCompletedDate = (todo: Todo) => {
  if (!todo.completedAt) {
    return null;
  }

  return getLocalDateString(new Date(todo.completedAt));
};

const getPastDateStrings = (days: number) => {
  const dates: string[] = [];
  const today = new Date();

  for (let index = days - 1; index >= 0; index -= 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    dates.push(getLocalDateString(date));
  }

  return dates;
};

export function calculateStats(todos: Todo[]): {
  todayTotal: number;
  todayCompleted: number;
  todayCompletionRate: number;
  weeklyData: WeeklyDatum[];
  streak: number;
  categoryBreakdown: CategoryDatum[];
  totalCompleted: number;
} {
  const today = getLocalDateString();
  const todayTotal = todos.filter((todo) => todo.date === today).length;
  const todayCompleted = todos.filter((todo) => getCompletedDate(todo) === today).length;
  const todayCompletionRate = todayTotal === 0 ? 0 : Math.round((todayCompleted / todayTotal) * 100);
  const totalCompleted = todos.filter((todo) => todo.completed).length;

  const weeklyData = getPastDateStrings(7).map((date) => ({
    date,
    count: todos.filter((todo) => getCompletedDate(todo) === date).length,
  }));

  let streak = 0;
  const cursor = new Date();

  while (true) {
    const date = getLocalDateString(cursor);
    const completedOnDate = todos.some((todo) => getCompletedDate(todo) === date);

    if (!completedOnDate) {
      break;
    }

    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  const categoryMap = new Map<string, CategoryDatum>();

  todos
    .filter((todo) => !todo.completed)
    .forEach((todo) => {
      const key = todo.category?.id ?? 'uncategorized';
      const current = categoryMap.get(key);

      if (current) {
        current.count += 1;
        return;
      }

      categoryMap.set(key, {
        name: todo.category?.name ?? '未分類',
        color: todo.category?.color ?? '#B5A89E',
        count: 1,
      });
    });

  return {
    todayTotal,
    todayCompleted,
    todayCompletionRate,
    weeklyData,
    streak,
    categoryBreakdown: Array.from(categoryMap.values()).sort((a, b) => b.count - a.count),
    totalCompleted,
  };
}
