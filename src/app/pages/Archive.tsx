import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, X, ArrowLeft, Download, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Todo, TodoCategory } from '../types';
import { storage, isTodoArray, isCategoryArray } from '../utils/storage';
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
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push(todo);
    });
    return grouped;
  };

  const filteredTodos = completedTodos.filter((todo) => {
    const matchesSearch = todo.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || todo.category?.id === selectedCategory;
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
    const cats = storage.getCategories();
    const data = { todos: allTodos, categories: cats, exportDate: new Date().toISOString() };
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

        // 嚴格驗證外部檔案結構：複用 storage 的型別守衛，
        // 拒絕結構不符的備份，避免注入壞資料導致渲染崩潰。
        const hasValidTodos = isTodoArray(data?.todos);
        const hasValidCategories = isCategoryArray(data?.categories);

        if (!hasValidTodos && !hasValidCategories) {
          toast.error('バックアップファイルの形式が正しくありません。');
          return;
        }

        if (hasValidTodos) {
          storage.saveTodos(data.todos);
          const completed = data.todos
            .filter((t: Todo) => t.completed)
            .sort((a: Todo, b: Todo) => (b.completedAt || 0) - (a.completedAt || 0));
          setCompletedTodos(completed);
        }
        if (hasValidCategories) {
          storage.saveCategories(data.categories);
          setCategories(data.categories);
        }
        toast.success('データを正常にインポートしました！');
        window.dispatchEvent(new Event('storage'));
      } catch {
        toast.error('インポートに失敗しました。ファイルを確認してください。');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const glassPanel = {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.12)',
  } as const;

  return (
    <div className="min-h-screen pb-8" style={{ background: 'var(--ocean-gradient)' }}>
      <BackgroundAnimation />

      <div className="max-w-md mx-auto px-4 pt-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/')}
            aria-label="戻る"
            className="p-2 hover:bg-white/10 rounded-xl transition-colors text-sky-300"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold flex-1 text-sky-50">完了済み</h1>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              aria-label="バックアップをエクスポート"
              className="p-2 rounded-xl shadow-lg hover:bg-white/15 transition-all text-sky-300"
              style={glassPanel}
              title="エクスポート"
            >
              <Download size={20} />
            </button>
            <label
              aria-label="バックアップをインポート"
              className="p-2 rounded-xl shadow-lg hover:bg-white/15 transition-all cursor-pointer text-sky-300"
              style={glassPanel}
              title="インポート"
            >
              <Upload size={20} />
              <input type="file" accept=".json" onChange={handleImport} className="hidden" />
            </label>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-sky-400" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="完了したタスクを検索..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl shadow-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sky-50 placeholder:text-sky-500"
            style={glassPanel}
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-hide">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
              !selectedCategory
                ? 'bg-sky-500/30 text-sky-100 border border-sky-400/30'
                : 'text-sky-300 hover:bg-white/10'
            }`}
            style={!selectedCategory ? {} : { background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}
          >
            すべて
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id ? 'ring-2 ring-sky-400/50' : ''
              }`}
              style={{ backgroundColor: cat.color, color: cat.color === '#F4F0ED' ? '#000' : '#fff' }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {dates.length === 0 ? (
            <div className="text-center py-16 text-sky-500">
              <p className="text-lg">完了したタスクがありません</p>
            </div>
          ) : (
            dates.map((date) => (
              <motion.div key={date} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h3 className="text-sm font-semibold text-sky-400 mb-3 ml-2">{date}</h3>
                <div className="space-y-3">
                  <AnimatePresence mode="popLayout">
                    {groupedTodos[date].map((todo) => (
                      <motion.div
                        key={todo.id}
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        className="rounded-2xl p-5 shadow-lg"
                        style={{
                          background: todo.category
                            ? `linear-gradient(135deg, ${todo.category.color}15 0%, ${todo.category.color}05 100%)`
                            : 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.12)',
                        }}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-500/70 flex items-center justify-center mt-1">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-base mb-2 break-words line-through text-sky-400">
                              {todo.content}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-sky-500">
                              <span>{todo.time}</span>
                              {todo.category && (
                                <span
                                  className="px-3 py-1 rounded-xl text-xs font-medium"
                                  style={{ backgroundColor: todo.category.color, color: '#fff' }}
                                >
                                  {todo.category.name}
                                </span>
                              )}
                              {todo.priority && (
                                <span
                                  className={`px-3 py-1 rounded-xl text-xs font-medium text-white ${
                                    todo.priority === 'high' ? 'bg-red-500/70' : todo.priority === 'medium' ? 'bg-yellow-500/70' : 'bg-emerald-500/70'
                                  }`}
                                >
                                  {todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低'}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleRestore(todo.id)}
                              className="text-sky-400 hover:text-sky-200 transition-colors p-1"
                              title="復元"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(todo.id)}
                              className="text-red-400 hover:text-red-300 transition-colors p-1"
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
