import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Todo } from '../types';
import { storage } from '../utils/storage';
import { getLocalDateString } from '../utils/date';
import { BackgroundAnimation } from '../components/BackgroundAnimation';
import { BottomNav } from '../components/BottomNav';

export function CalendarPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const loadTodos = () => {
    setTodos(storage.getTodos());
  };

  useEffect(() => {
    loadTodos();
    setSelectedDate(getLocalDateString());
    const handleFocus = () => loadTodos();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  useEffect(() => {
    const handleStorageChange = () => loadTodos();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const previousMonth = () => setCurrentDate(new Date(year, month - 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1));
  const getTodosForDate = (date: string) => todos.filter((todo) => todo.date === date);

  const days: (number | null)[] = [];
  for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const formatDateString = (day: number) => getLocalDateString(new Date(year, month, day));
  const selectedTodos = selectedDate ? getTodosForDate(selectedDate) : [];

  const glassPanel = {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.12)',
  } as const;

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--ocean-gradient)' }}>
      <BackgroundAnimation />

      <div className="max-w-md mx-auto px-4 pt-8">
        <h1 className="text-3xl font-bold mb-8 text-sky-50">カレンダー</h1>

        <div className="rounded-2xl p-6 shadow-lg shadow-black/20 mb-6" style={glassPanel}>
          <div className="flex items-center justify-between mb-6">
            <button onClick={previousMonth} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-sky-300">
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-xl font-semibold text-sky-50">
              {year}年 {month + 1}月
            </h2>
            <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-xl transition-colors text-sky-300">
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-sky-300">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              if (day === null) return <div key={`empty-${index}`} />;

              const dateString = formatDateString(day);
              const todosForDay = getTodosForDate(dateString);
              const isSelected = selectedDate === dateString;
              const isToday = dateString === getLocalDateString();

              return (
                <motion.button
                  key={day}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedDate(selectedDate === dateString ? null : dateString)}
                  className="min-h-[80px] rounded-xl flex flex-col items-start p-2 text-xs relative transition-all overflow-hidden"
                  style={
                    isSelected
                      ? { background: 'rgba(14,165,233,0.2)', border: '1px solid rgba(14,165,233,0.5)' }
                      : isToday
                      ? { background: 'rgba(14,165,233,0.12)', border: '1px solid rgba(14,165,233,0.3)' }
                      : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
                  }
                >
                  <span className={`font-semibold text-sm mb-1 ${isToday ? 'text-sky-300' : 'text-sky-100'}`}>
                    {day}
                  </span>
                  {todosForDay.length > 0 && (
                    <div className="w-full space-y-1">
                      {todosForDay.slice(0, 3).map((todo, i) => (
                        <div
                          key={i}
                          className="text-[10px] leading-tight truncate w-full px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: todo.category?.color || '#0ea5e9',
                            color: '#fff',
                            filter: todo.completed ? 'grayscale(80%) opacity(0.6)' : 'none',
                          }}
                          title={todo.content}
                        >
                          {todo.content}
                        </div>
                      ))}
                      {todosForDay.length > 3 && (
                        <div className="text-[9px] text-sky-400 pl-1">+{todosForDay.length - 3}件</div>
                      )}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6 shadow-lg shadow-black/20"
            style={glassPanel}
          >
            <h3 className="font-semibold mb-4 text-sky-50">
              {selectedDate} のToDo ({selectedTodos.length})
            </h3>
            <div className="space-y-3">
              {selectedTodos.length === 0 ? (
                <p className="text-sky-400 text-center py-4">ToDoがありません</p>
              ) : (
                selectedTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="p-4 rounded-xl relative"
                    style={{
                      background: todo.category
                        ? `linear-gradient(135deg, ${todo.category.color}20 0%, ${todo.category.color}08 100%)`
                        : 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    <button
                      onClick={() => navigate(`/timeline?date=${selectedDate}`)}
                      className="absolute top-3 right-3 flex items-center gap-1 p-1.5 rounded-lg transition-colors text-sky-400 hover:text-sky-200 hover:bg-white/10"
                      title="タイムラインで表示"
                    >
                      <Clock size={14} />
                      <ArrowRight size={12} />
                    </button>

                    <div className="flex items-start gap-3 pr-12">
                      {todo.completed && (
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/70 flex items-center justify-center mt-0.5">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className={`font-medium mb-1 ${todo.completed ? 'line-through text-sky-500' : 'text-sky-50'}`}>
                          {todo.content}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-sky-300 flex-wrap">
                          <span>{todo.time}</span>
                          {todo.completed && (
                            <span className="px-2 py-0.5 rounded-xl text-xs bg-emerald-500/30 text-emerald-300">完了済み</span>
                          )}
                          {todo.category && (
                            <span className="px-2 py-0.5 rounded-xl text-xs text-white" style={{ backgroundColor: todo.category.color }}>
                              {todo.category.name}
                            </span>
                          )}
                          {todo.priority && (
                            <span className={`px-2 py-0.5 rounded-xl text-xs text-white ${todo.priority === 'high' ? 'bg-red-500/80' : todo.priority === 'medium' ? 'bg-yellow-500/80' : 'bg-emerald-500/80'}`}>
                              {todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
