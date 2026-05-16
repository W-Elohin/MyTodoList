import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Columns3 } from 'lucide-react';
import { Todo } from '../types';
import { storage } from '../utils/storage';
import { getLocalDateString } from '../utils/date';
import { cancelReminder } from '../utils/reminder';
import { BackgroundAnimation } from '../components/BackgroundAnimation';
import { BottomNav } from '../components/BottomNav';

type PriorityColumn = {
  key: Todo['priority'] | 'uncategorized';
  title: string;
  tone: string;
  badge: string;
};

const columns: PriorityColumn[] = [
  { key: 'uncategorized', title: '未分類', tone: 'bg-gray-100', badge: 'bg-gray-500' },
  { key: 'low', title: '低優先', tone: 'bg-green-50', badge: 'bg-green-500' },
  { key: 'medium', title: '中優先', tone: 'bg-yellow-50', badge: 'bg-yellow-500' },
  { key: 'high', title: '高優先', tone: 'bg-red-50', badge: 'bg-red-500' },
];

function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-2xl font-bold text-gray-800"
    >
      {value}
    </motion.span>
  );
}

export function KanbanPage() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const loadTodos = () => {
    setTodos(storage.getTodos());
  };

  useEffect(() => {
    loadTodos();

    const handleStorageChange = () => loadTodos();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  const summary = useMemo(() => {
    const today = getLocalDateString();

    return {
      total: todos.length,
      completed: todos.filter((todo) => todo.completed).length,
      active: todos.filter((todo) => !todo.completed).length,
      dueToday: todos.filter((todo) => !todo.completed && todo.date === today).length,
    };
  }, [todos]);

  const activeTodos = useMemo(() => todos.filter((todo) => !todo.completed), [todos]);

  const getColumnTodos = (key: PriorityColumn['key']) =>
    activeTodos.filter((todo) => {
      if (key === 'uncategorized') {
        return !todo.priority;
      }

      return todo.priority === key;
    });

  const handleToggleComplete = (id: string) => {
    const allTodos = storage.getTodos();
    const updated = allTodos.map((todo) =>
      todo.id === id
        ? { ...todo, completed: true, completedAt: Date.now() }
        : todo
    );

    storage.saveTodos(updated);
    cancelReminder(id);
    window.dispatchEvent(new Event('storage'));
    loadTodos();
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#F4F0ED' }}>
      <BackgroundAnimation />

      <div className="max-w-6xl mx-auto px-4 pt-8">
        <div className="flex items-center gap-3 mb-6">
          <Columns3 size={32} className="text-gray-700" />
          <h1 className="text-3xl font-bold text-gray-800">看板</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: '總任務數', value: summary.total },
            { label: '已完成', value: summary.completed },
            { label: '未完成', value: summary.active },
            { label: '今日到期', value: summary.dueToday },
          ].map((item) => (
            <motion.div
              key={item.label}
              layout
              className="bg-white/75 backdrop-blur-sm rounded-2xl p-4 shadow-lg"
            >
              <p className="text-xs font-medium text-gray-500 mb-2">{item.label}</p>
              <AnimatedNumber value={item.value} />
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {columns.map((column) => {
            const columnTodos = getColumnTodos(column.key);

            return (
              <section
                key={column.key}
                className={`${column.tone} rounded-2xl p-4 min-h-[360px] shadow-lg border border-white/70`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${column.badge}`} />
                    <h2 className="font-semibold text-gray-800">{column.title}</h2>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-white/80 text-xs font-semibold text-gray-700">
                    {columnTodos.length}
                  </span>
                </div>

                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {columnTodos.length === 0 ? (
                      <motion.div
                        key={`${column.key}-empty`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-sm text-gray-400 text-center py-10"
                      >
                        任務がありません
                      </motion.div>
                    ) : (
                      columnTodos.map((todo, index) => (
                        <motion.button
                          key={todo.id}
                          layout
                          initial={{ opacity: 0, y: 14 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.94, x: 24 }}
                          transition={{ delay: index * 0.03 }}
                          onClick={() => handleToggleComplete(todo.id)}
                          className="w-full text-left bg-white rounded-2xl p-4 shadow-md hover:shadow-lg transition-all"
                        >
                          <p className="text-sm font-medium text-gray-800 break-words mb-3">
                            {todo.content}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                            <span>{todo.date}</span>
                            <span>{todo.time}</span>
                            {todo.category && (
                              <span
                                className="px-2.5 py-1 rounded-xl font-medium"
                                style={{
                                  backgroundColor: todo.category.color,
                                  color: todo.category.color === '#F4F0ED' ? '#000' : '#fff',
                                }}
                              >
                                {todo.category.name}
                              </span>
                            )}
                            {todo.tags?.map((tag) => (
                              <span
                                key={`${todo.id}-${tag.id}`}
                                className="px-2 py-0.5 rounded-lg border border-gray-200 text-gray-500"
                              >
                                #{tag.name}
                              </span>
                            ))}
                          </div>
                        </motion.button>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
