import { Todo } from '../types';
import { storage } from './storage';

const reminderTimers = new Map<string, number>();

const canUseNotifications = () => typeof window !== 'undefined' && 'Notification' in window;

const getReminderTime = (todo: Todo) => {
  if (!todo.date || !todo.time) {
    return null;
  }

  const dueAt = new Date(`${todo.date}T${todo.time}`);

  if (Number.isNaN(dueAt.getTime())) {
    return null;
  }

  return dueAt.getTime();
};

const showReminder = (todo: Todo) => {
  if (!canUseNotifications() || Notification.permission !== 'granted') {
    return;
  }

  new Notification(todo.content, {
    body: 'タスクの期限です',
    icon: '/icon-192x192.png',
  });
};

export async function requestNotificationPermission(): Promise<boolean> {
  if (!canUseNotifications()) {
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission === 'denied') {
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === 'granted';
}

export function cancelReminder(todoId: string): void {
  const timerId = reminderTimers.get(todoId);

  if (timerId) {
    window.clearTimeout(timerId);
    reminderTimers.delete(todoId);
  }
}

export function scheduleReminder(todo: Todo): void {
  if (typeof window === 'undefined' || todo.completed) {
    return;
  }

  cancelReminder(todo.id);

  const reminderTime = getReminderTime(todo);

  if (!reminderTime) {
    return;
  }

  const delay = reminderTime - Date.now();

  if (delay <= 0) {
    return;
  }

  const createTimer = () => {
    const timerId = window.setTimeout(() => {
      showReminder(todo);
      reminderTimers.delete(todo.id);
    }, delay);

    reminderTimers.set(todo.id, timerId);
  };

  if (!canUseNotifications()) {
    return;
  }

  if (Notification.permission === 'granted') {
    createTimer();
    return;
  }

  if (Notification.permission === 'default') {
    requestNotificationPermission().then((granted) => {
      if (granted) {
        createTimer();
      }
    });
  }
}

export function initReminderService(): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (!canUseNotifications() || Notification.permission !== 'granted') {
    return;
  }

  reminderTimers.forEach((timerId) => window.clearTimeout(timerId));
  reminderTimers.clear();

  storage
    .getTodos()
    .filter((todo) => !todo.completed)
    .filter((todo) => {
      const reminderTime = getReminderTime(todo);
      return reminderTime !== null && reminderTime > Date.now();
    })
    .forEach(scheduleReminder);
}
