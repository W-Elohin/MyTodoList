export interface TodoCategory {
  id: string;
  name: string;
  color: string;
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
  completed: boolean;
  createdAt: number;
  completedAt?: number;
}