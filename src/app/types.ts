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
  category?: TodoCategory;
  completed: boolean;
  createdAt: number;
  completedAt?: number;
}
