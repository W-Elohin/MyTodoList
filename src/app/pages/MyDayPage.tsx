import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Pencil, Folder, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Todo, TodoCategory } from '../types';
import { storage } from '../utils/storage';
import { getLocalDateString } from '../utils/date';
import { getGreeting } from '../utils/greeting';
import { GreetingEmoji } from '../components/GreetingEmoji';
import { EmptyStateWrapper } from '../components/illustrations/EmptyStateWrapper';
import { TurtleIllustration } from '../components/illustrations/TurtleIllustration';
import { AddTodoDialog } from '../components/AddTodoDialog';
import { BackgroundAnimation } from '../components/BackgroundAnimation';
import { BottomNav } from '../components/BottomNav';

export function MyDayPage() {
  const navigate = useNavigate();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [overdueTodos, setOverdueTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<TodoCategory[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  const loadTodos = () => {
    const today = getLocalDateString();
    const all = storage.getTodos();
    setTodos(all.filter((t) => !t.completed && t.date === today));
    // 逾期：未完成且日期早於今日。My Day 必須讓使用者一眼看見被遺漏的事，
    // 而非讓它們無聲消失（北極星：打開三秒內知道該做什麼）。
    setOverdueTodos(
      all
        .filter((t) => !t.completed && t.date < today)
        .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0))
    );
    setCategories(storage.getCategories());
  };

  useEffect(() => {
    loadTodos();

    const handleStorageChange = () => {
      loadTodos();
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  const handleAddTodo = (todoData: {
    content: string;
    date: string;
    time: string;
    duration?: number;
    category?: TodoCategory;
  }) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      content: todoData.content,
      date: todoData.date,
      time: todoData.time,
      duration: todoData.duration,
      category: todoData.category,
      completed: false,
      createdAt: Date.now(),
    };

    const allTodos = storage.getTodos();
    const updated = [newTodo, ...allTodos];
    storage.saveTodos(updated);
    window.dispatchEvent(new Event('storage'));
    loadTodos();
  };

  const handleToggleComplete = (id: string) => {
    const allTodos = storage.getTodos();
    const updated = allTodos.map((t) =>
      t.id === id
        ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : undefined }
        : t
    );
    storage.saveTodos(updated);
    window.dispatchEvent(new Event('storage'));
    loadTodos();
  };

  const handleAddCategory = (category: TodoCategory) => {
    const updatedCategories = [...categories, category];
    setCategories(updatedCategories);
    storage.saveCategories(updatedCategories);
  };

  const todayStr = getLocalDateString();
  const todayAll = storage.getTodos().filter((t) => t.date === todayStr);
  const todayCompleted = todayAll.filter((t) => t.completed).length;
  const todayTotal = todayAll.length;
  const progress = todayTotal > 0 ? (todayCompleted / todayTotal) * 100 : 0;
  const greeting = getGreeting();

  const handleEditTodo = (updatedTodo: Todo) => {
    const allTodos = storage.getTodos();
    const updated = allTodos.map((t) => (t.id === updatedTodo.id ? updatedTodo : t));
    storage.saveTodos(updated);
    setEditingTodo(null);
    window.dispatchEvent(new Event('storage'));
    loadTodos();
  };

  return (
    <motion.div
      className="min-h-screen pb-24"
      style={{ background: 'var(--ocean-gradient)' }}
    >
      <BackgroundAnimation />

      <motion.div className="max-w-md mx-auto px-4 pt-8">
        <motion.div className="flex items-start justify-between mb-6">
          <motion.div>
            <motion.div className="flex items-center gap-3 mb-1">
              <GreetingEmoji emoji={greeting.emoji} />
              <h1 className="text-2xl font-bold text-sky-50">{greeting.text}</h1>
            </motion.div>
            <p className="text-sm text-sky-300 ml-1">{greeting.sub}</p>
          </motion.div>
          <button
            type="button"
            onClick={() => navigate('/archive')}
            className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/15 hover:bg-white/15 transition-all text-sky-200"
          >
            <Folder size={24} />
          </button>
        </motion.div>

        {todayTotal > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-white/[0.08] border border-white/15 backdrop-blur-md"
          >
            <motion.div className="flex items-center justify-between mb-2">
              <span className="text-sm text-sky-200">
                今日の進捗 {todayCompleted}/{todayTotal}
              </span>
              <span className="text-sm font-medium text-sky-100">{Math.round(progress)}%</span>
            </motion.div>
            <motion.div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </motion.div>
          </motion.div>
        ) : (
          <p className="text-sm text-sky-400 mb-6">まだ予定がありません</p>
        )}

        {overdueTodos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center gap-2 mb-3 ml-1">
              <AlertCircle size={16} className="text-orange-400" />
              <span className="text-sm font-medium text-orange-300">
                期限切れ {overdueTodos.length}
              </span>
            </div>
            <motion.div className="space-y-3">
              {overdueTodos.map((todo) => (
                <motion.div
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  className="bg-orange-500/[0.07] backdrop-blur-sm rounded-2xl p-4 border border-orange-400/25"
                >
                  <div className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(todo.id)}
                      aria-label="完了にする"
                      className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-orange-400/50 hover:border-orange-300 transition-all mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-base mb-1 break-words text-sky-50">{todo.content}</p>
                      <span className="text-xs text-orange-300/90">{todo.date} {todo.time}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingTodo(todo)}
                      aria-label="編集"
                      className="flex-shrink-0 text-orange-300/70 hover:text-orange-200 transition-colors p-1"
                    >
                      <Pencil size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}

        <motion.div className="space-y-4 mb-6">
          <AnimatePresence mode="popLayout">
            {todos.length === 0 ? (
              <EmptyStateWrapper
                illustration={<TurtleIllustration />}
                title="今日のタスクはありません"
                subtitle="のんびりしましょう！"
              />
            ) : (
              todos.map((todo, index) => (
                <motion.div
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 shadow-lg border border-white/15 hover:border-white/25 transition-colors"
                >
                  <motion.div className="flex items-start gap-4">
                    <button
                      type="button"
                      onClick={() => handleToggleComplete(todo.id)}
                      className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-white/30 hover:border-sky-400 transition-all mt-1"
                    />
                    <motion.div className="flex-1 min-w-0">
                      <p className="text-base mb-2 break-words text-sky-50">{todo.content}</p>
                      <motion.div className="flex flex-wrap items-center gap-2 text-sm text-sky-300">
                        <span>{todo.time}</span>
                        {todo.category && (
                          <span
                            className="px-3 py-1 rounded-xl text-xs font-medium"
                            style={{
                              backgroundColor: todo.category.color,
                              color: todo.category.color === '#F4F0ED' ? '#000' : '#fff',
                            }}
                          >
                            {todo.category.name}
                          </span>
                        )}
                      </motion.div>
                    </motion.div>
                    <button
                      type="button"
                      onClick={() => setEditingTodo(todo)}
                      className="flex-shrink-0 text-sky-400 hover:text-sky-200 transition-colors p-1"
                    >
                      <Pencil size={18} />
                    </button>
                  </motion.div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setEditingTodo(null);
          setShowAddDialog(true);
        }}
        className="fixed bottom-24 right-6 w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center bg-white/10 border border-white/15"
      >
        <Plus size={32} className="text-sky-300" />
      </motion.button>

      <AddTodoDialog
        open={showAddDialog || !!editingTodo}
        onClose={() => {
          setShowAddDialog(false);
          setEditingTodo(null);
        }}
        onAdd={handleAddTodo}
        onEdit={handleEditTodo}
        editingTodo={editingTodo}
        categories={categories}
        onAddCategory={handleAddCategory}
      />

      <BottomNav />
    </motion.div>
  );
}
