import { useState, useEffect, useRef, useCallback } from 'react';
import { X, Clock, Folder, Flag, Tag, Repeat, ListChecks, type LucideIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { Todo, TodoCategory, TodoRecurrence, RecurrenceType, SubTask } from '../types';
import { getLocalDateString, getLocalTimeString } from '../utils/date';
import { useWhisper } from '../hooks/useWhisper';
import { parseIntent } from '../utils/nlpParser';
import { VoiceInputButton } from './VoiceInputButton';
import { SubTaskList } from './SubTaskList';
import { PRIORITY_META, PRIORITY_ORDER } from '../utils/priority';
import { dialogContentVariants, dialogOverlayVariants, springTransition } from '../utils/animations';

const RECURRENCE_OPTIONS: { type: RecurrenceType; label: string }[] = [
  { type: 'daily', label: '毎日' },
  { type: 'weekly', label: '毎週' },
  { type: 'monthly', label: '毎月' },
  { type: 'weekdays', label: '平日のみ' },
  { type: 'custom', label: 'カスタム' },
];

const WEEKDAY_LABELS = ['日', '月', '火', '水', '木', '金', '土'];

type ToolbarKey = 'duration' | 'category' | 'priority' | 'tags' | 'recurrence' | 'subtasks';

const TOOLBAR_ITEMS: { icon: LucideIcon; label: string; key: ToolbarKey }[] = [
  { icon: Clock, label: '所要時間', key: 'duration' },
  { icon: Folder, label: 'カテゴリー', key: 'category' },
  { icon: Flag, label: '優先度', key: 'priority' },
  { icon: Tag, label: 'タグ', key: 'tags' },
  { icon: Repeat, label: '繰り返し', key: 'recurrence' },
  { icon: ListChecks, label: 'サブタスク', key: 'subtasks' },
];

const inputClass =
  'w-full px-3 py-2.5 rounded-xl bg-white/[0.08] border border-white/[0.15] text-sky-50 placeholder:text-sky-400/60 focus:outline-none focus:ring-2 focus:ring-sky-400/40 text-sm';

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
  const [openPanel, setOpenPanel] = useState<ToolbarKey | null>(null);

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
      autoFields.push('日付');
    }
    if (parsed.priority) {
      setPriority(parsed.priority);
      autoFields.push('優先度');
    }

    if (autoFields.length > 0) {
      toast.success(`自動設定しました：${autoFields.join('、')}`);
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
        setOpenPanel(null);
      }
      if (editingTodo) {
        setSubtasks(editingTodo.subtasks ?? []);
      }
      setOpenPanel(null);
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
      setOpenPanel(null);
      onClose();
    }
  };

  const togglePanel = (key: ToolbarKey) => {
    setOpenPanel((prev) => (prev === key ? null : key));
  };

  const isToolbarActive = (key: ToolbarKey): boolean => {
    switch (key) {
      case 'duration':
        return duration !== 30;
      case 'category':
        return !!selectedCategory;
      case 'priority':
        return !!priority;
      case 'tags':
        return selectedTags.length > 0;
      case 'recurrence':
        return !!recurrence;
      case 'subtasks':
        return subtasks.length > 0;
      default:
        return false;
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
            variants={dialogOverlayVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          <motion.div
            variants={dialogContentVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={springTransition}
            className="fixed inset-x-4 top-[8vh] max-w-md mx-auto bg-[#0a1628]/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[85vh] flex flex-col"
          >
            <motion.div className="p-5 pb-3 flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-semibold text-sky-50">{isEditMode ? '編集' : '新規追加'}</h2>
              <button type="button" onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-sky-300"><X size={22} /></button>
            </motion.div>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 px-5 pb-5 space-y-3 overflow-y-auto">
              <div>
                <motion.div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-sky-200">内容</label>
                  <VoiceInputButton isReady={isReady} isRecording={isRecording} isProcessing={isProcessing} error={error} showSuccess={showVoiceSuccess} onToggle={handleVoiceToggle} />
                </motion.div>
                <textarea value={content} onChange={(e) => setContent(e.target.value)} className={`${inputClass} resize-none`} rows={3} placeholder="ToDoを入力..." required />
              </div>
              <div className="flex gap-2 flex-wrap">
                {TOOLBAR_ITEMS.map(({ icon: Icon, label, key }) => {
                  const active = isToolbarActive(key) || openPanel === key;
                  return (
                    <button key={key} type="button" title={label} onClick={() => togglePanel(key)} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/30' : 'bg-white/10 text-sky-300 hover:bg-white/15'}`}>
                      <Icon size={18} />
                    </button>
                  );
                })}
              </div>
              <AnimatePresence mode="wait">
                {openPanel && (
                  <motion.div key={openPanel} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden rounded-xl bg-white/[0.06] border border-white/10 p-3">
                    {openPanel === 'duration' && (
                      <motion.div className="flex items-center gap-2">
                        <button type="button" onClick={() => setDuration(Math.max(15, duration - 15))} className="w-9 h-9 rounded-lg bg-white/10 text-sky-200 text-lg">-</button>
                        <input type="number" value={duration} onChange={(e) => setDuration(Math.max(15, parseInt(e.target.value) || 15))} min={15} step={15} className={`${inputClass} text-center flex-1`} />
                        <span className="text-sm text-sky-300">分</span>
                        <button type="button" onClick={() => setDuration(duration + 15)} className="w-9 h-9 rounded-lg bg-white/10 text-sky-200 text-lg">+</button>
                      </motion.div>
                    )}
                    {openPanel === 'category' && (
                      <motion.div className="space-y-3">
                        <motion.div className="flex flex-wrap gap-2">
                          {categories.map((cat) => (
                            <button key={cat.id} type="button" onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-xl text-xs font-medium ${selectedCategory?.id === cat.id ? 'ring-2 ring-sky-400/50' : ''}`} style={{ backgroundColor: cat.color, color: cat.color === '#F4F0ED' ? '#000' : '#fff' }}>{cat.name}</button>
                          ))}
                          <button type="button" onClick={() => setShowCategoryInput(!showCategoryInput)} className="px-3 py-1.5 rounded-xl text-xs border border-dashed border-white/25 text-sky-300">+ 新規</button>
                        </motion.div>
                        <AnimatePresence>
                          {showCategoryInput && (
                            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
                              <input type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} placeholder="カテゴリー名" className={inputClass} />
                              <motion.div className="flex gap-2">{predefinedColors.map((color) => (<button key={color} type="button" onClick={() => setNewCategoryColor(color)} className={`w-8 h-8 rounded-lg ${newCategoryColor === color ? 'ring-2 ring-sky-400' : ''}`} style={{ backgroundColor: color }} />))}</motion.div>
                              <button type="button" onClick={handleAddCategory} className="w-full py-2 rounded-xl bg-sky-500/30 text-sky-100 text-sm">追加確認</button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    )}
                    {openPanel === 'priority' && (
                      <motion.div className="flex gap-2">
                        {PRIORITY_ORDER.map((p) => {
                          const meta = PRIORITY_META[p];
                          return (
                            <button
                              key={p}
                              type="button"
                              onClick={() => setPriority(priority === p ? undefined : p)}
                              className={`flex-1 py-2 rounded-xl text-sm font-medium ${priority === p ? meta.activeClass : 'bg-white/10 text-sky-300'}`}
                            >
                              {meta.label}
                            </button>
                          );
                        })}
                      </motion.div>
                    )}
                    {openPanel === 'tags' && (
                      <motion.div className="flex flex-wrap gap-2">
                        {categories.map((tag) => {
                          const isSelected = selectedTags.some((t) => t.id === tag.id);
                          return (<button key={`tag-${tag.id}`} type="button" onClick={() => isSelected ? setSelectedTags(selectedTags.filter((t) => t.id !== tag.id)) : setSelectedTags([...selectedTags, tag])} className={`px-3 py-1 rounded-full text-xs border ${isSelected ? 'bg-sky-500/25 text-sky-100 border-sky-400/40' : 'bg-white/5 text-sky-400 border-white/15'}`}># {tag.name}</button>);
                        })}
                      </motion.div>
                    )}
                    {openPanel === 'recurrence' && (
                      <motion.div className="space-y-3">
                        <motion.div className="flex flex-wrap gap-2">{RECURRENCE_OPTIONS.map(({ type, label }) => (<button key={type} type="button" onClick={() => handleRecurrenceSelect(type)} className={`px-3 py-1.5 rounded-xl text-xs ${recurrence?.type === type ? 'bg-sky-500/40 text-sky-50 ring-1 ring-sky-400/40' : 'bg-white/10 text-sky-300'}`}>{label}</button>))}</motion.div>
                        <AnimatePresence>{recurrence?.type === 'custom' && (<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden"><motion.div className="flex items-center gap-2"><span className="text-sm text-sky-300">間隔</span><input type="number" min={1} value={customInterval} onChange={(e) => setCustomInterval(Math.max(1, parseInt(e.target.value) || 1))} className={`${inputClass} w-16 text-center`} /><span className="text-sm text-sky-300">日/週</span></motion.div><motion.div className="flex gap-1 flex-wrap">{WEEKDAY_LABELS.map((label, day) => (<button key={day} type="button" onClick={() => toggleCustomDay(day)} className={`w-8 h-8 rounded-full text-xs ${customDays.includes(day) ? 'bg-sky-500/40 text-sky-50' : 'bg-white/10 text-sky-400'}`}>{label}</button>))}</motion.div></motion.div>)}</AnimatePresence>
                      </motion.div>
                    )}
                    {openPanel === 'subtasks' && (<SubTaskList subtasks={subtasks} onToggle={(id) => setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, completed: !s.completed } : s)))} onAdd={(stContent) => setSubtasks((prev) => [...prev, { id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, content: stContent, completed: false }])} onDelete={(id) => setSubtasks((prev) => prev.filter((s) => s.id !== id))} />)}
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.div className="grid grid-cols-2 gap-2">
                <motion.div><label className="block text-xs font-medium mb-1 text-sky-300">日付</label><input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} /></motion.div>
                <motion.div><label className="block text-xs font-medium mb-1 text-sky-300">時間</label><input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={inputClass} /></motion.div>
              </motion.div>
              <button type="submit" disabled={!isFormValid} className="w-full py-3 rounded-xl font-medium flex-shrink-0 bg-sky-500 text-white hover:bg-sky-400 disabled:bg-white/10 disabled:text-sky-600">{isEditMode ? '更新' : '追加'}</button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

