import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Plus, Folder, Pencil } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Todo, TodoCategory } from '../types';
import { storage } from '../utils/storage';
import { AddTodoDialog } from '../components/AddTodoDialog';
import { BackgroundAnimation } from '../components/BackgroundAnimation';
import { BottomNav } from '../components/BottomNav';

export function TodoList() {
  const navigate = useNavigate();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<TodoCategory[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);

  useEffect(() => {
    setTodos(storage.getTodos().filter((t) => !t.completed));
    setCategories(storage.getCategories());
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
    setTodos(updated.filter((t) => !t.completed));
    
    // storageイベントを発火して他のタブに通知
    window.dispatchEvent(new Event('storage'));
  };

  const handleToggleComplete = (id: string) => {
    const allTodos = storage.getTodos();
    const updated = allTodos.map((t) =>
      t.id === id
        ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : undefined }
        : t
    );
    storage.saveTodos(updated);
    setTodos(updated.filter((t) => !t.completed));
    
    // storageイベントを発火して他のタブに通知
    window.dispatchEvent(new Event('storage'));
  };

  const handleDeleteTodo = (id: string) => {
    const allTodos = storage.getTodos();
    const updated = allTodos.filter((t) => t.id !== id);
    storage.saveTodos(updated);
    setTodos(updated.filter((t) => !t.completed));
    
    // storageイベントを発火して他のタブに通知
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800">ToDoリスト</h1>
          <button
            onClick={() => navigate('/archive')}
            className="p-3 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all"
          >
            <Folder size={24} />
          </button>
        </div>

        {/* Todo List */}
        <div className="space-y-4 mb-6">
          <AnimatePresence mode="popLayout">
            {todos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 text-gray-400"
              >
                <p className="text-lg">ToDoがありません</p>
                <p className="text-sm mt-2">右下のボタンから追加してください</p>
              </motion.div>
            ) : (
              todos.map((todo, index) => (
                <motion.div
                  key={todo.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white backdrop-blur-sm rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all"
                  style={{
                    background: '#FFFFFF',
                  }}
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleToggleComplete(todo.id)}
                      className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-all mt-1 ${
                        todo.completed
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-gray-300 hover:border-blue-400'
                      }`}
                    >
                      {todo.completed && (
                        <svg
                          className="w-full h-full text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <p className="text-base mb-2 break-words text-gray-800">{todo.content}</p>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
                        <span>{todo.date}</span>
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
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Button */}
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