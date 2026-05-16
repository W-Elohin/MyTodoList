import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Folder, Pencil, Repeat, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Todo, TodoCategory, SubTask } from '../types';
import { storage } from '../utils/storage';
import { getNextOccurrence, getRecurrenceLabel } from '../utils/recurrence';
import { AddTodoDialog } from '../components/AddTodoDialog';
import { BackgroundAnimation } from '../components/BackgroundAnimation';
import { BottomNav } from '../components/BottomNav';
import { SearchBar, highlightText } from '../components/SearchBar';
import { FilterChips, FilterValue } from '../components/FilterChips';
import { SubTaskList } from '../components/SubTaskList';

export function TodoList() {
  const navigate = useNavigate();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<TodoCategory[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    setTodos(storage.getTodos().filter((t) => !t.completed));
    setCategories(storage.getCategories());
  }, []);

  const filteredTodos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return todos.filter((todo) => {
      if (activeFilter !== 'all') {
        if (activeFilter === 'high' || activeFilter === 'medium' || activeFilter === 'low') {
          if (todo.priority !== activeFilter) return false;
        } else if (activeFilter.startsWith('cat-')) {
          const catId = activeFilter.slice(4);
          if (todo.category?.id !== catId) return false;
        }
      }

      if (!q) return true;

      const haystack = [
        todo.content,
        todo.category?.name,
        ...(todo.tags?.map((t) => t.name) ?? []),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [todos, searchQuery, activeFilter]);

  const handleSubtaskToggle = (todoId: string, subtaskId: string) => {
    const allTodos = storage.getTodos();
    const updated = allTodos.map((t) => {
      if (t.id !== todoId) return t;
      return {
        ...t,
        subtasks: (t.subtasks ?? []).map((s) =>
          s.id === subtaskId ? { ...s, completed: !s.completed } : s
        ),
      };
    });
    storage.saveTodos(updated);
    setTodos(updated.filter((t) => !t.completed));
    window.dispatchEvent(new Event('storage'));
  };

  const handleSubtaskAdd = (todoId: string, content: string) => {
    const allTodos = storage.getTodos();
    const newSubtask: SubTask = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      content,
      completed: false,
    };
    const updated = allTodos.map((t) =>
      t.id === todoId ? { ...t, subtasks: [...(t.subtasks ?? []), newSubtask] } : t
    );
    storage.saveTodos(updated);
    setTodos(updated.filter((t) => !t.completed));
    window.dispatchEvent(new Event('storage'));
  };

  const handleSubtaskDelete = (todoId: string, subtaskId: string) => {
    const allTodos = storage.getTodos();
    const updated = allTodos.map((t) =>
      t.id === todoId ? { ...t, subtasks: (t.subtasks ?? []).filter((s) => s.id !== subtaskId) } : t
    );
    storage.saveTodos(updated);
    setTodos(updated.filter((t) => !t.completed));
    window.dispatchEvent(new Event('storage'));
  };

  const handleAddTodo = (todoData: {
    content: string;
    date: string;
    time: string;
    duration?: number;
    category?: TodoCategory;
    priority?: 'low' | 'medium' | 'high';
    tags?: TodoCategory[];
    recurrence?: Todo['recurrence'];
    subtasks?: SubTask[];
  }) => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      content: todoData.content,
      date: todoData.date,
      time: todoData.time,
      duration: todoData.duration,
      category: todoData.category,
      priority: todoData.priority,
      tags: todoData.tags,
      recurrence: todoData.recurrence,
      subtasks: todoData.subtasks,
      completed: false,
      createdAt: Date.now(),
    };

    const allTodos = storage.getTodos();
    const updated = [newTodo, ...allTodos];
    storage.saveTodos(updated);
    setTodos(updated.filter((t) => !t.completed));
    window.dispatchEvent(new Event('storage'));
  };

  const handleToggleComplete = (id: string) => {
    const allTodos = storage.getTodos();
    const target = allTodos.find((t) => t.id === id);
    if (!target || target.completed) return;

    let updated = allTodos.map((t) =>
      t.id === id ? { ...t, completed: true, completedAt: Date.now() } : t
    );

    if (target.recurrence) {
      const nextDate = getNextOccurrence(target);
      if (nextDate) {
        const nextTodo: Todo = {
          ...target,
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          date: nextDate,
          completed: false,
          completedAt: undefined,
          createdAt: Date.now(),
        };
        updated = [nextTodo, ...updated];
      }
    }

    storage.saveTodos(updated);
    setTodos(updated.filter((t) => !t.completed));
    window.dispatchEvent(new Event('storage'));
  };

  const handleDeleteTodo = (id: string) => {
    const allTodos = storage.getTodos();
    const updated = allTodos.filter((t) => t.id !== id);
    storage.saveTodos(updated);
    setTodos(updated.filter((t) => !t.completed));
    window.dispatchEvent(new Event('storage'));
  };

  const handleAddCategory = (category: TodoCategory) => {
    const updatedCategories = [...categories, category];
    setCategories(updatedCategories);
    storage.saveCategories(updatedCategories);
  };

  const handleEditTodo = (updatedTodo: Todo) => {
    const allTodos = storage.getTodos();
    const updated = allTodos.map((t) => (t.id === updatedTodo.id ? updatedTodo : t));
    storage.saveTodos(updated);
    setTodos(updated.filter((t) => !t.completed));
    setEditingTodo(null);
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#F4F0ED' }}>
      <BackgroundAnimation />

      <div className="max-w-md mx-auto px-4 pt-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-800">ToDoリスト</h1>
          <button
            onClick={() => navigate('/archive')}
            className="p-3 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            <Folder size={24} />
          </button>
        </div>

        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <FilterChips
          categories={categories}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
        />

        <div className="space-y-4 mb-6 mt-2">
          <AnimatePresence mode="popLayout">
            {filteredTodos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 text-gray-400"
              >
                <p className="text-lg">
                  {todos.length === 0 ? 'ToDoがありません' : '該当するToDoがありません'}
                </p>
                <p className="text-sm mt-2">
                  {todos.length === 0
                    ? '右下のボタンから追加してください'
                    : '検索またはフィルターを変更してください'}
                </p>
              </motion.div>
            ) : (
              filteredTodos.map((todo, index) => (
                <motion.div
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all"
                >
                  <motion.div layout className="flex items-start gap-4">
                    <button
                      onClick={() => handleToggleComplete(todo.id)}
                      className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-gray-300 hover:border-blue-400 transition-all mt-1"
                    />

                    <div className="flex-1 min-w-0">
                      <p className="text-base mb-2 break-words text-gray-800">
                        {highlightText(todo.content, searchQuery)}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
                        <span>{todo.date}</span>
                        <span>{todo.time}</span>
                        {todo.recurrence && (
                          <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-600 text-xs"
                            title={getRecurrenceLabel(todo.recurrence)}
                          >
                            <Repeat size={12} />
                            {getRecurrenceLabel(todo.recurrence)}
                          </span>
                        )}
                        {todo.category && (
                          <span
                            className="px-3 py-1 rounded-xl text-xs font-medium"
                            style={{
                              backgroundColor: todo.category.color,
                              color: todo.category.color === '#F4F0ED' ? '#000' : '#fff',
                            }}
                          >
                            {highlightText(todo.category.name, searchQuery)}
                          </span>
                        )}
                        {todo.priority && (
                          <span
                            className={`px-3 py-1 rounded-xl text-xs font-medium text-white ${
                              todo.priority === 'high'
                                ? 'bg-red-500'
                                : todo.priority === 'medium'
                                ? 'bg-yellow-500'
                                : 'bg-green-500'
                            }`}
                          >
                            優先度: {todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低'}
                          </span>
                        )}
                        {todo.tags && todo.tags.length > 0 && (
                          <div className="flex gap-1 flex-wrap">
                            {todo.tags.map((tag) => (
                              <span
                                key={`list-tag-${tag.id}`}
                                className="px-2 py-0.5 rounded-md text-[10px] font-medium border border-gray-200 text-gray-500"
                              >
                                #{highlightText(tag.name, searchQuery)}
                              </span>
                            ))}
                          </div>
                        )}
                        {todo.subtasks && todo.subtasks.length > 0 && (
                          <button
                            onClick={() => setExpandedId(expandedId === todo.id ? null : todo.id)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-100 text-gray-600 text-xs hover:bg-gray-200 transition-colors"
                          >
                            {todo.subtasks.filter((s) => s.completed).length}/{todo.subtasks.length} 完成
                            {expandedId === todo.id ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingTodo(todo)}
                        className="flex-shrink-0 text-gray-500 hover:text-gray-700 transition-colors p-1"
                      >
                        <Pencil size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors p-1"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {expandedId === todo.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden mt-3 pt-3 border-t border-gray-100"
                      >
                        <SubTaskList
                          subtasks={todo.subtasks ?? []}
                          onToggle={(sid) => handleSubtaskToggle(todo.id, sid)}
                          onAdd={(content) => handleSubtaskAdd(todo.id, content)}
                          onDelete={(sid) => handleSubtaskDelete(todo.id, sid)}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setEditingTodo(null);
          setShowAddDialog(true);
        }}
        className="fixed bottom-24 right-6 w-16 h-16 rounded-2xl shadow-2xl flex items-center justify-center bg-white"
      >
        <Plus size={32} style={{ color: '#B5A89E' }} />
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
    </div>
  );
}