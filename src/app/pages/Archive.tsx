import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, X, ArrowLeft, Download, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Todo, TodoCategory } from '../types';
import { storage } from '../utils/storage';
import { BackgroundAnimation } from '../components/BackgroundAnimation';

export function Archive() {
  const navigate = useNavigate();
  const [completedTodos, setCompletedTodos] = useState<Todo[]>([]);
  const [categories, setCategories] = useState<TodoCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const allTodos = storage.getTodos();
    const completed = allTodos
      .filter((t) => t.completed)
      .sort((a, b) => (b.completedAt || 0) - (a.completedAt || 0));
    setCompletedTodos(completed);
    setCategories(storage.getCategories());
  }, []);

  const groupByDate = (todos: Todo[]) => {
    const grouped: Record<string, Todo[]> = {};
    todos.forEach((todo) => {
      const date = todo.date;
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(todo);
    });
    return grouped;
  };

  const filteredTodos = completedTodos.filter((todo) => {
    const matchesSearch = todo.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || todo.category?.id === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedTodos = groupByDate(filteredTodos);
  const dates = Object.keys(groupedTodos).sort((a, b) => b.localeCompare(a));

  const handleDelete = (id: string) => {
    const allTodos = storage.getTodos();
    const updated = allTodos.filter((t) => t.id !== id);
    storage.saveTodos(updated);
    setCompletedTodos(updated.filter((t) => t.completed));
  };

  const handleRestore = (id: string) => {
    const allTodos = storage.getTodos();
    const updated = allTodos.map((t) =>
      t.id === id ? { ...t, completed: false, completedAt: undefined } : t
    );
    storage.saveTodos(updated);
    setCompletedTodos(updated.filter((t) => t.completed));
  };

  const handleExport = () => {
    const allTodos = storage.getTodos();
    const categories = storage.getCategories();
    const data = {
      todos: allTodos,
      categories: categories,
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todo-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        
        if (data.todos && Array.isArray(data.todos)) {
          storage.saveTodos(data.todos);
          const completed = data.todos
            .filter((t: Todo) => t.completed)
            .sort((a: Todo, b: Todo) => (b.completedAt || 0) - (a.completedAt || 0));
          setCompletedTodos(completed);
        }
        
        if (data.categories && Array.isArray(data.categories)) {
          storage.saveCategories(data.categories);
          setCategories(data.categories);
        }
        
        alert('データを正常にインポートしました！');
        window.dispatchEvent(new Event('storage'));
      } catch (error) {
        alert('インポートに失敗しました。ファイルを確認してください。');
      }
    };
    reader.readAsText(file);
    
    // リセット input value
    event.target.value = '';
  };

  return (
    <div className="min-h-screen pb-8" style={{ backgroundColor: '#F4F0ED' }}>
      <BackgroundAnimation />

      <div className="max-w-md mx-auto px-4 pt-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-white/60 rounded-xl transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold flex-1 text-gray-800">完了済み</h1>
          
          {/* Import/Export Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="p-2 bg-white/60 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all"
              title="エクスポート"
            >
              <Download size={20} />
            </button>
            <label
              className="p-2 bg-white/60 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
              title="インポート"
            >
              <Upload size={20} />
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="完了したタスクを検索..."
            className="w-full pl-12 pr-4 py-4 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 placeholder:text-gray-500"
          />
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                !selectedCategory
                ? 'bg-gray-800 text-white'
                : 'bg-white/70 hover:bg-white/90 text-gray-800'
            }`}
          >
            すべて
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id ? 'ring-2 ring-offset-2 ring-gray-400' : ''
              }`}
              style={{
                backgroundColor: cat.color,
                color: cat.color === '#F4F0ED' ? '#000' : '#fff',
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Completed Todos by Date */}
        <div className="space-y-6">
          {dates.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg">完了したタスクがありません</p>
            </div>
          ) : (
            dates.map((date) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h3 className="text-sm font-semibold text-gray-600 mb-3 ml-2">{date}</h3>
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {groupedTodos[date].map((todo) => (
                      <motion.div
                        key={todo.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 shadow-lg"
                        style={{
                          background: todo.category
                            ? `linear-gradient(135deg, ${todo.category.color}15 0%, ${todo.category.color}05 100%)`
                            : 'rgba(255, 255, 255, 0.7)',
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-green-500 flex items-center justify-center mt-1">
                            <svg
                              className="w-4 h-4 text-white"
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
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-base mb-2 break-words line-through text-gray-500">
                              {todo.content}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
                              <span>{todo.time}</span>
                              {todo.category && (
                                <span
                                  className="px-3 py-1 rounded-xl text-xs font-medium"
                                  style={{
                                    backgroundColor: todo.category.color,
                                    color:
                                      todo.category.color === '#F4F0ED' ? '#000' : '#fff',
                                  }}
                                >
                                  {todo.category.name}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRestore(todo.id)}
                              className="text-blue-400 hover:text-blue-600 transition-colors p-1"
                              title="復元"
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
                                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(todo.id)}
                              className="text-red-400 hover:text-red-600 transition-colors p-1"
                              title="削除"
                            >
                              <X size={20} />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}