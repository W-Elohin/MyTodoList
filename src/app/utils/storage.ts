import { Todo, TodoCategory } from '../types';

const TODOS_KEY = 'todos';
const CATEGORIES_KEY = 'categories';

export const storage = {
  getTodos(): Todo[] {
    const data = localStorage.getItem(TODOS_KEY);
    return data ? JSON.parse(data) : [];
  },

  saveTodos(todos: Todo[]): void {
    localStorage.setItem(TODOS_KEY, JSON.stringify(todos));
  },

  getCategories(): TodoCategory[] {
    const data = localStorage.getItem(CATEGORIES_KEY);
    if (data) {
      return JSON.parse(data);
    }
    // 默认类别
    const defaultCategories: TodoCategory[] = [
      { id: '1', name: '仕事', color: '#F87556' },
      { id: '2', name: '個人', color: '#81DDE6' },
      { id: '3', name: '重要', color: '#2A89C6' },
    ];
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(defaultCategories));
    return defaultCategories;
  },

  saveCategories(categories: TodoCategory[]): void {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  },
};