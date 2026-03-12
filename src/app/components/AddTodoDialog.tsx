import { useState } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TodoCategory } from '../types';

interface AddTodoDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (todo: {
    content: string;
    date: string;
    time: string;
    duration?: number;
    category?: TodoCategory;
  }) => void;
  categories: TodoCategory[];
  onAddCategory: (category: TodoCategory) => void;
}

export function AddTodoDialog({
  open,
  onClose,
  onAdd,
  categories,
  onAddCategory,
}: AddTodoDialogProps) {
  const now = new Date();
  const [content, setContent] = useState('');
  const [date, setDate] = useState(now.toISOString().split('T')[0]);
  const [time, setTime] = useState(
    now.toTimeString().slice(0, 5)
  );
  const [duration, setDuration] = useState(30); // デフォルト30分
  const [selectedCategory, setSelectedCategory] = useState<TodoCategory | undefined>();
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#81DDE6');

  const predefinedColors = ['#F87556', '#81DDE6', '#57D0D8', '#2A89C6', '#F4F0ED'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onAdd({ content, date, time, duration, category: selectedCategory });
      setContent('');
      setSelectedCategory(undefined);
      onClose();
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: TodoCategory = {
        id: Date.now().toString(),
        name: newCategoryName,
        color: newCategoryColor,
      };
      onAddCategory(newCategory);
      setSelectedCategory(newCategory);
      setNewCategoryName('');
      setShowCategoryInput(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', bounce: 0.3, duration: 0.4 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-[#f4f0ed] rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">新規追加</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">内容</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                    rows={3}
                    placeholder="ToDoを入力..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">日付</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">時間</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">所要時間</label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setDuration(Math.max(15, duration - 15))}
                      className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center text-xl"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(Math.max(15, parseInt(e.target.value) || 15))}
                      min="15"
                      step="15"
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center"
                    />
                    <span className="text-sm text-gray-600">分</span>
                    <button
                      type="button"
                      onClick={() => setDuration(duration + 15)}
                      className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center text-xl"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">カテゴリー</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          selectedCategory?.id === cat.id
                            ? 'ring-2 ring-offset-2 ring-gray-400 scale-105'
                            : 'hover:scale-105'
                        }`}
                        style={{
                          backgroundColor: cat.color,
                          color: cat.color === '#F4F0ED' ? '#000' : '#fff',
                        }}
                      >
                        {cat.name}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setShowCategoryInput(!showCategoryInput)}
                      className="px-4 py-2 rounded-xl text-sm font-medium border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors"
                    >
                      + 新規
                    </button>
                  </div>

                  {showCategoryInput && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-3 p-4 bg-gray-50 rounded-xl space-y-3"
                    >
                      <input
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        placeholder="カテゴリー名"
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      />
                      <div className="flex gap-2">
                        {predefinedColors.map((color) => (
                          <button
                            key={color}
                            type="button"
                            onClick={() => setNewCategoryColor(color)}
                            className={`w-10 h-10 rounded-xl transition-all ${
                              newCategoryColor === color
                                ? 'ring-2 ring-offset-2 ring-gray-400 scale-110'
                                : 'hover:scale-110'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={handleAddCategory}
                        className="w-full px-4 py-2 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors"
                      >
                        追加確認
                      </button>
                    </motion.div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-white font-medium transition-all hover:shadow-lg"
                  style={{ backgroundColor: '#e5dad3' }}
                >
                  追加
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}