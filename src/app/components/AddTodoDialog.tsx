import { useState, useEffect, useRef, useCallback } from 'react';
import { X, ListTodo } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Todo, TodoCategory, TodoRecurrence, RecurrenceType, SubTask } from '../types';
import { getLocalDateString, getLocalTimeString } from '../utils/date';
import { useWhisper } from '../hooks/useWhisper';
import { parseIntent } from '../utils/nlpParser';
import { VoiceInputButton } from './VoiceInputButton';
import { SubTaskList } from './SubTaskList';

const RECURRENCE_OPTIONS: { type: RecurrenceType; label: string }[] = [
  { type: 'daily', label: '毎日' },
  { type: 'weekly', label: '毎週' },
  { type: 'monthly', label: '毎月' },
  { type: 'weekdays', label: '平日のみ' },
  { type: 'custom', label: 'カスタム' },
];

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

interface AddTodoDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (todo: {
    content: string;
    date: string;
    time: string;
    duration?: number;
    category?: TodoCategory;
    priority?: 'low' | 'medium' | 'high';
    tags?: TodoCategory[];
    recurrence?: TodoRecurrence;
    subtasks?: SubTask[];
  }) => void;
  onEdit?: (todo: Todo) => void;
  editingTodo?: Todo | null;
  categories: TodoCategory[];
  onAddCategory: (category: TodoCategory) => void;
}

export function AddTodoDialog({
  open,
  onClose,
  onAdd,
  onEdit,
  editingTodo,
  categories,
  onAddCategory,
}: AddTodoDialogProps) {
  const [content, setContent] = useState('');
  const [date, setDate] = useState(getLocalDateString());
  const [time, setTime] = useState(getLocalTimeString());
  const [duration, setDuration] = useState(30);
  const [selectedCategory, setSelectedCategory] = useState<TodoCategory | undefined>();
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | undefined>();
  const [selectedTags, setSelectedTags] = useState<TodoCategory[]>([]);
  const [recurrence, setRecurrence] = useState<TodoRecurrence | undefined>();
  const [customInterval, setCustomInterval] = useState(1);
  const [customDays, setCustomDays] = useState<number[]>([]);
  const [showCategoryInput, setShowCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#81DDE6');
  const [showVoiceSuccess, setShowVoiceSuccess] = useState(false);
  const [subtasks, setSubtasks] = useState<SubTask[]>([]);
  const [showSubtasks, setShowSubtasks] = useState(false);

  const {
    isReady,
    isRecording,
    isProcessing,
    transcript,
    error,
    startRecording,
    stopRecording,
    setTranscript,
  } = useWhisper();

  const lastProcessedTranscript = useRef('');
  const predefinedColors = ['#F87556', '#81DDE6', '#57D0D8', '#2A89C6', '#F4F0ED'];
  const isEditMode = !!editingTodo;
  const isFormValid = content.trim().length > 0;

  const applyNlpResult = useCallback((text: string) => {
    const parsed = parseIntent(text);
    setContent(parsed.cleanedContent);

    const autoFields: string[] = [];
    if (parsed.date) {
      setDate(parsed.date);
      autoFields.push('日期');
    }
    if (parsed.priority) {
      setPriority(parsed.priority);
      autoFields.push('優先度');
    }

    if (autoFields.length > 0) {
      toast.success(`已自動設定：${autoFields.join('、')}`);
    }
  }, []);

  useEffect(() => {
    if (open) {
      if (editingTodo) {
        setContent(editingTodo.content);
        setDate(editingTodo.date);
        setTime(editingTodo.time);
        setDuration(editingTodo.duration ?? 30);
        setSelectedCategory(editingTodo.category);
        setPriority(editingTodo.priority);
        setSelectedTags(editingTodo.tags || []);
        setRecurrence(editingTodo.recurrence);
        if (editingTodo.recurrence?.type === 'custom') {
          setCustomInterval(editingTodo.recurrence.interval ?? 1);
          setCustomDays(editingTodo.recurrence.daysOfWeek ?? []);
        }
      } else {
        setContent('');
        setDate(getLocalDateString());
        setTime(getLocalTimeString());
        setDuration(30);
        setSelectedCategory(undefined);
        setPriority(undefined);
        setSelectedTags([]);
        setRecurrence(undefined);
        setCustomInterval(1);
        setCustomDays([]);
        setSubtasks([]);
        setShowSubtasks(false);
      }
      if (editingTodo) {
        setSubtasks(editingTodo.subtasks ?? []);
        setShowSubtasks((editingTodo.subtasks?.length ?? 0) > 0);
      }
      setShowCategoryInput(false);
      setShowVoiceSuccess(false);
      setTranscript('');
      lastProcessedTranscript.current = '';
    }
  }, [open, editingTodo, setTranscript]);

  useEffect(() => {
    if (!transcript || transcript === lastProcessedTranscript.current) return;
    if (isRecording || isProcessing) return;

    lastProcessedTranscript.current = transcript;
    setShowVoiceSuccess(true);
    applyNlpResult(transcript);

    const timer = setTimeout(() => setShowVoiceSuccess(false), 1200);
    return () => clearTimeout(timer);
  }, [transcript, isRecording, isProcessing, applyNlpResult]);

  const handleVoiceToggle = () => {
    if (isRecording) {
      stopRecording();
    } else if (!isProcessing && isReady) {
      startRecording();
    }
  };

  const buildRecurrence = (): TodoRecurrence | undefined => {
    if (!recurrence) return undefined;
    if (recurrence.type === 'custom') {
      return {
        type: 'custom',
        interval: customInterval,
        daysOfWeek: customDays.length > 0 ? customDays : undefined,
      };
    }
    return recurrence;
  };

  const handleRecurrenceSelect = (type: RecurrenceType) => {
    if (recurrence?.type === type) {
      setRecurrence(undefined);
      return;
    }
    if (type === 'custom') {
      setRecurrence({ type: 'custom', interval: customInterval, daysOfWeek: customDays });
    } else {
      setRecurrence({ type, interval: 1 });
    }
  };

  const toggleCustomDay = (day: number) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort((a, b) => a - b)
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      const finalRecurrence = buildRecurrence();
      if (isEditMode && editingTodo && onEdit) {
        onEdit({
          ...editingTodo,
          content,
          date,
          time,
          duration,
          category: selectedCategory,
          priority,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          recurrence: finalRecurrence,
          subtasks: subtasks.length > 0 ? subtasks : undefined,
        });
      } else {
        onAdd({
          content,
          date,
          time,
          duration,
          category: selectedCategory,
          priority,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          recurrence: finalRecurrence,
          subtasks: subtasks.length > 0 ? subtasks : undefined,
        });
      }
      setContent('');
      setSelectedCategory(undefined);
      setPriority(undefined);
      setSelectedTags([]);
      setRecurrence(undefined);
      setSubtasks([]);
      setShowSubtasks(false);
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
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-[#f4f0ed] rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <motion.div layout className="p-6">
              <motion.div layout className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800">{isEditMode ? '編集' : '新規追加'}</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X size={24} />
                </button>
              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">内容</label>
                    <VoiceInputButton
                      isReady={isReady}
                      isRecording={isRecording}
                      isProcessing={isProcessing}
                      error={error}
                      showSuccess={showVoiceSuccess}
                      onToggle={handleVoiceToggle}
                    />
                  </div>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none text-gray-800 placeholder:text-gray-500"
                    rows={3}
                    placeholder="ToDoを入力..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <motion.div layout>
                    <label className="block text-sm font-medium mb-2 text-gray-700">日付</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm text-gray-800"
                    />
                  </motion.div>
                  <motion.div layout>
                    <label className="block text-sm font-medium mb-2 text-gray-700">時間</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full px-3 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm text-gray-800"
                    />
                  </motion.div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">繰り返し</label>
                  <div className="flex flex-wrap gap-2">
                    {RECURRENCE_OPTIONS.map(({ type, label }) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleRecurrenceSelect(type)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          recurrence?.type === type
                            ? 'bg-[#2A89C6] text-white ring-2 ring-offset-1 ring-blue-300 scale-105'
                            : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence>
                    {recurrence?.type === 'custom' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 p-4 bg-white rounded-xl space-y-3 overflow-hidden"
                      >
                        <motion.div layout className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">間隔</span>
                          <input
                            type="number"
                            min={1}
                            value={customInterval}
                            onChange={(e) => setCustomInterval(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-16 px-2 py-1 rounded-lg border border-gray-200 text-center text-sm"
                          />
                          <span className="text-sm text-gray-600">日/週</span>
                        </motion.div>
                        <motion.div layout>
                          <span className="text-sm text-gray-600 block mb-2">曜日（週次用）</span>
                          <motion.div layout className="flex gap-1 flex-wrap">
                            {WEEKDAY_LABELS.map((label, day) => (
                              <button
                                key={day}
                                type="button"
                                onClick={() => toggleCustomDay(day)}
                                className={`w-9 h-9 rounded-full text-xs font-medium transition-all ${
                                  customDays.includes(day)
                                    ? 'bg-[#2A89C6] text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }`}
                              >
                                {label}
                              </button>
                            ))}
                          </motion.div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">所要時間</label>
                  <motion.div layout className="flex items-center gap-3">
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
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-center text-gray-800"
                    />
                    <span className="text-sm text-gray-700">分</span>
                    <button
                      type="button"
                      onClick={() => setDuration(duration + 15)}
                      className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center text-xl"
                    >
                      +
                    </button>
                  </motion.div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">カテゴリー</label>
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
                      className="px-4 py-2 rounded-xl text-sm font-medium border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors text-gray-700"
                    >
                      + 新規
                    </button>
                  </div>

                  <AnimatePresence>
                    {showCategoryInput && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 p-4 bg-gray-50 rounded-xl space-y-3 overflow-hidden"
                      >
                        <input
                          type="text"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                          placeholder="カテゴリー名"
                          className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-800 placeholder:text-gray-500"
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
                  </AnimatePresence>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">優先度</label>
                  <div className="flex gap-2">
                    {(['low', 'medium', 'high'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriority(priority === p ? undefined : p)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                          priority === p
                            ? p === 'high'
                              ? 'bg-red-500 text-white ring-2 ring-offset-2 ring-red-400 scale-105'
                              : p === 'medium'
                              ? 'bg-yellow-500 text-white ring-2 ring-offset-2 ring-yellow-400 scale-105'
                              : 'bg-green-500 text-white ring-2 ring-offset-2 ring-green-400 scale-105'
                            : 'bg-gray-100 text-gray-600 hover:scale-105'
                        }`}
                      >
                        {p === 'high' ? '高' : p === 'medium' ? '中' : '低'}
                      </button>
                    ))}
                  </div>
                </div>

                <motion.div layout>
                  <label className="block text-sm font-medium mb-2 text-gray-700">タグ (複数選択可)</label>
                  <div className="flex flex-wrap gap-2">
                    {categories.map((tag) => {
                      const isSelected = selectedTags.some((t) => t.id === tag.id);
                      return (
                        <button
                          key={`tag-${tag.id}`}
                          type="button"
                          onClick={() => {
                            if (isSelected) {
                              setSelectedTags(selectedTags.filter((t) => t.id !== tag.id));
                            } else {
                              setSelectedTags([...selectedTags, tag]);
                            }
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                            isSelected
                              ? 'bg-blue-100 text-blue-800 border-blue-300 shadow-sm'
                              : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          # {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>

                <div>
                  <button
                    type="button"
                    onClick={() => setShowSubtasks((v) => !v)}
                    className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors mb-2"
                  >
                    <ListTodo size={16} />
                    サブタスク
                    {subtasks.length > 0 && (
                      <span className="ml-1 px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                        {subtasks.filter((s) => s.completed).length}/{subtasks.length}
                      </span>
                    )}
                  </button>
                  <AnimatePresence>
                    {showSubtasks && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <SubTaskList
                          subtasks={subtasks}
                          onToggle={(id) =>
                            setSubtasks((prev) =>
                              prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s))
                            )
                          }
                          onAdd={(content) =>
                            setSubtasks((prev) => [
                              ...prev,
                              { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, content, completed: false },
                            ])
                          }
                          onDelete={(id) => setSubtasks((prev) => prev.filter((s) => s.id !== id))}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl text-white font-medium transition-all hover:shadow-lg"
                  style={{ backgroundColor: isFormValid ? '#2A89C6' : '#e5dad3' }}
                >
                  {isEditMode ? '更新' : '追加'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
