export interface TodoCategory {
  id: string;
  name: string;
  color: string;
}

export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'weekdays' | 'custom';

export interface TodoRecurrence {
  type: RecurrenceType;
  interval?: number;
  daysOfWeek?: number[];
}

export interface Todo {
  id: string;
  content: string;
  date: string;
  time: string;
  duration?: number; // 持続時間（分単位）
  category?: TodoCategory;
  priority?: 'low' | 'medium' | 'high'; // 優先度
  tags?: TodoCategory[]; // 複数タグ
  recurrence?: TodoRecurrence;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
}