import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Columns3 } from 'lucide-react';
import { Todo } from '../types';
import { storage } from '../utils/storage';
import { getLocalDateString } from '../utils/date';
import { cancelReminder } from '../utils/reminder';
import { PRIORITY_META } from '../utils/priority';
import { useConfetti } from '../hooks/useConfetti';

type PriorityColumn = {
  key: Todo['priority'] | 'uncategorized';
  title: string;
  bg: string;
  badge: string;
};

// 優先度欄位的色彩派生自單一真實來源 PRIORITY_META，避免與其他畫面 drift
const columns: PriorityColumn[] = [
  { key: 'uncategorized', title: '未分類', bg: 'rgba(255,255,255,0.05)', badge: 'bg-slate-400' },
  { key: 'low', title: PRIORITY_META.low.label, bg: PRIORITY_META.low.columnBg, badge: PRIORITY_META.low.badgeClass },
  { key: 'medium', title: PRIORITY_META.medium.label, bg: PRIORITY_META.medium.columnBg, badge: PRIORITY_META.medium.badgeClass },
  { key: 'high', title: PRIORITY_META.high.label, bg: PRIORITY_META.high.columnBg, badge: PRIORITY_META.high.badgeClass },
];

function AnimatedNumber({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-2xl font-bold text-sky-50"
    >
      {value}
    </motion.span>
  );
}

export function KanbanPage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const confetti = useConfetti();

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
    activeTodos.filter((todo) => (key === 'uncategorized' ? !todo.priority : todo.priority === key));

  const handleToggleComplete = (id: string, e?: React.MouseEvent) => {
    // 完成獎勵：與 My Day / list 一致（confetti + 觸覺），統一各頁完成體驗
    if (e) confetti.fire(e.clientX, e.clientY);
    else confetti.fire();
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(15);
    }

    const allTodos = storage.getTodos();
    const updated = allTodos.map((todo) =>
      todo.id === id ? { ...todo, completed: true, completedAt: Date.now() } : todo
    );
    storage.saveTodos(updated);
    cancelReminder(id);
    window.dispatchEvent(new Event('storage'));
    loadTodos();
  };

  const glassPanel = {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.1)',
  } as const;

  return (
    <>
      <div>
        <div className="flex items-center gap-3 mb-6">
          <Columns3 size={32} className="text-sky-400" />
          <h1 className="text-2xl md:text-3xl font-bold text-sky-50">看板</h1>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: '全タスク', value: summary.total },
            { label: '完了', value: summary.completed },
            { label: '未完了', value: summary.active },
            { label: '今日期限', value: summary.dueToday },
          ].map((item) => (
            <motion.div key={item.label} layout className="rounded-2xl p-4 shadow-lg shadow-black/20" style={glassPanel}>
              <p className="text-xs font-medium text-sky-400 mb-2">{item.label}</p>
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
                className="rounded-2xl p-4 min-h-[360px] shadow-lg shadow-black/20"
                style={{ background: column.bg, border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${column.badge}`} />
                    <h2 className="font-semibold text-sky-100">{column.title}</h2>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-white/10 text-xs font-semibold text-sky-300">
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
                        className="text-sm text-sky-500 text-center py-10"
                      >
                        タスクがありません
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
                          onClick={(e) => handleToggleComplete(todo.id, e)}
                          className="w-full text-left rounded-2xl p-4 shadow-md hover:shadow-lg transition-all"
                          style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
                        >
                          <p className="text-sm font-medium text-sky-50 break-words mb-3">{todo.content}</p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-sky-400">
                            <span>{todo.date}</span>
                            <span>{todo.time}</span>
                            {todo.category && (
                              <span className="px-2.5 py-1 rounded-xl font-medium" style={{ backgroundColor: todo.category.color, color: '#fff' }}>
                                {todo.category.name}
                              </span>
                            )}
                            {todo.tags?.map((tag) => (
                              <span key={`${todo.id}-${tag.id}`} className="px-2 py-0.5 rounded-lg border border-white/15 text-sky-400">
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

    </>
  );
}
