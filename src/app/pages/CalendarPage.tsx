import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Todo } from '../types';
import { storage } from '../utils/storage';
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
    
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    
    const handleFocus = () => {
      loadTodos();
    };
    
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      loadTodos();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1));
  };

  const getTodosForDate = (date: string) => {
    return todos.filter((todo) => todo.date === date);
  };

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const formatDateString = (day: number) => {
    const d = new Date(year, month, day);
    return d.toISOString().split('T')[0];
  };

  const selectedTodos = selectedDate ? getTodosForDate(selectedDate) : [];

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#F4F0ED' }}>
      <BackgroundAnimation />

      <div className="max-w-md mx-auto px-4 pt-8">
        <h1 className="text-3xl font-bold mb-8">カレンダー</h1>

        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={previousMonth}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ChevronLeft size={24} />
            </button>
            <h2 className="text-xl font-semibold">
              {year}年 {month + 1}月
            </h2>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ChevronRight size={24} />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['日', '月', '火', '水', '木', '金', '土'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} />;
              }

              const dateString = formatDateString(day);
              const todosForDay = getTodosForDate(dateString);
              const isSelected = selectedDate === dateString;
              const isToday = dateString === new Date().toISOString().split('T')[0];

              return (
                <motion.button
                  key={day}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    setSelectedDate(selectedDate === dateString ? null : dateString)
                  }
                  className={`min-h-[80px] rounded-xl flex flex-col items-start p-2 text-xs relative transition-all overflow-hidden ${
                    isSelected
                      ? 'bg-white shadow-lg ring-2 ring-gray-300'
                      : isToday
                      ? 'bg-blue-50'
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                >
                  <span className={`font-semibold text-sm mb-1 ${
                    isToday ? 'text-blue-600' : 'text-gray-800'
                  }`}>
                    {day}
                  </span>
                  
                  {todosForDay.length > 0 && (
                    <div className="w-full space-y-1">
                      {todosForDay.slice(0, 3).map((todo, i) => (
                        <div
                          key={i}
                          className="text-[10px] leading-tight truncate w-full px-1.5 py-0.5 rounded"
                          style={{
                            backgroundColor: todo.category?.color || '#81DDE6',
                            color: todo.category?.color === '#F4F0ED' ? '#000' : '#fff',
                            filter: todo.completed ? 'grayscale(100%)' : 'none',
                          }}
                          title={todo.content}
                        >
                          {todo.content}
                        </div>
                      ))}
                      {todosForDay.length > 3 && (
                        <div className="text-[9px] text-gray-500 pl-1">
                          +{todosForDay.length - 3}件
                        </div>
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
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
          >
            <h3 className="font-semibold mb-4 flex items-center justify-between">
              <span>{selectedDate} のToDo ({selectedTodos.length})</span>
              {/* <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/timeline?date=${selectedDate}`)}
                className="p-2 bg-gray-100/80 hover:bg-gray-200/80 rounded-lg transition-colors"
                title="タイムラインで表示"
              >
                <Clock size={18} className="text-gray-600" />
              </motion.button> */}
            </h3>
            <div className="space-y-3">
              {selectedTodos.length === 0 ? (
                <p className="text-gray-400 text-center py-4">ToDoがありません</p>
              ) : (
                selectedTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="p-4 rounded-xl bg-white/70 backdrop-blur-sm relative"
                    style={{
                      background: todo.category
                        ? `linear-gradient(135deg, ${todo.category.color}15 0%, ${todo.category.color}05 100%)`
                        : 'rgba(255, 255, 255, 0.7)',
                    }}
                  >
                    {/* Timeline跳轉按鈕 */}
                    <button
                      onClick={() => navigate(`/timeline?date=${selectedDate}`)}
                      className="absolute top-3 right-3 flex items-center gap-1 p-1.5 bg-gray-100/80 hover:bg-gray-200/80 rounded-lg transition-colors group"
                      title="タイムラインで表示"
                    >
                      <Clock size={14} className="text-gray-600 group-hover:text-gray-800" />
                      <ArrowRight size={12} className="text-gray-600 group-hover:text-gray-800" />
                    </button>

                    <div className="flex items-start gap-3 pr-12">
                      {todo.completed && (
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gray-600 flex items-center justify-center mt-0.5">
                          <svg
                            className="w-3 h-3 text-white"
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
                      )}
                      <div className="flex-1">
                        <p className={`font-medium mb-1 ${
                          todo.completed ? 'line-through text-gray-500' : ''
                        }`}>
                          {todo.content}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-gray-600 flex-wrap">
                          <span>{todo.time}</span>
                          {todo.completed && (
                            <span className="px-2 py-0.5 rounded-xl text-xs bg-gray-600 text-white">
                              完了済み
                            </span>
                          )}
                          {todo.category && (
                            <span
                              className="px-2 py-0.5 rounded-xl text-xs"
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