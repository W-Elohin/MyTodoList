import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useSearchParams } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Todo } from '../types';
import { storage } from '../utils/storage';
import { getLocalDateString } from '../utils/date';

export function TimelinePage() {
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date');

  const [selectedDate, setSelectedDate] = useState(() => dateParam || getLocalDateString());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const timelineRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  const loadTodos = () => {
    const allTodos = storage.getTodos();
    setTodos(allTodos.filter((t) => t.date === selectedDate));
  };

  useEffect(() => {
    loadTodos();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    const handleStorageChange = () => loadTodos();
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    return () => {
      clearInterval(timer);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, [selectedDate]);

  useEffect(() => {
    if (selectedDate !== getLocalDateString()) return;
    const scrollToCurrentTime = () => {
      if (!timelineRef.current) return;
      const currentHour = currentTime.getHours();
      const currentMinute = currentTime.getMinutes();
      const currentTimeInHours = currentHour + currentMinute / 60;
      const pixelsPerHour = 60;
      const currentPosition = currentTimeInHours * pixelsPerHour;
      const viewportHeight = window.innerHeight;
      timelineRef.current.scrollTop = Math.max(0, currentPosition - viewportHeight / 3);
    };
    if (!hasScrolled.current) {
      const id = requestAnimationFrame(() => {
        scrollToCurrentTime();
        hasScrolled.current = true;
      });
      return () => cancelAnimationFrame(id);
    }
  }, [selectedDate, currentTime, todos]);

  const timeToMinutes = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const currentTimeInMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const isToday = selectedDate === getLocalDateString();

  const getTodosForHour = (hour: number) =>
    todos.filter((todo) => {
      const todoStartMinutes = timeToMinutes(todo.time);
      const todoStartHour = Math.floor(todoStartMinutes / 60);
      const todoEndMinutes = todoStartMinutes + (todo.duration || 30);
      const todoEndHour = Math.floor(todoEndMinutes / 60);
      return hour >= todoStartHour && hour <= todoEndHour;
    });

  const getTodoPosition = (todo: Todo, hour: number) => {
    const todoStartMinutes = timeToMinutes(todo.time);
    const todoStartHour = Math.floor(todoStartMinutes / 60);
    const todoEndMinutes = todoStartMinutes + (todo.duration || 30);
    if (todoStartHour === hour) {
      const startMinuteInHour = todoStartMinutes % 60;
      const topPercent = (startMinuteInHour / 60) * 100;
      const durationInThisHour = Math.min(60 - startMinuteInHour, todo.duration || 30);
      const heightPercent = (durationInThisHour / 60) * 100;
      return { top: topPercent, height: heightPercent, isStart: true };
    } else {
      const todoEndHour = Math.floor(todoEndMinutes / 60);
      if (hour < todoEndHour) return { top: 0, height: 100, isStart: false };
      else {
        const endMinuteInHour = todoEndMinutes % 60;
        return { top: 0, height: (endMinuteInHour / 60) * 100, isStart: false };
      }
    }
  };

  const currentTimePosition = (currentTime.getHours() + currentTime.getMinutes() / 60) * 60;

  const changeDate = (offset: number) => {
    const current = new Date(selectedDate + 'T12:00:00');
    current.setDate(current.getDate() + offset);
    setSelectedDate(getLocalDateString(current));
    hasScrolled.current = false;
  };

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    return `${month}月${day}日 (${dayOfWeek})`;
  };

  const glassPanel = {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255,255,255,0.12)',
  } as const;

  return (
    <>
      <div>
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-sky-50">タイムライン</h1>

        <div className="rounded-2xl p-4 shadow-lg shadow-black/20 mb-4" style={glassPanel}>
          <div className="flex items-center justify-between">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => changeDate(-1)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors text-sky-300"
            >
              <ChevronLeft size={20} />
            </motion.button>
            <motion.div
              key={selectedDate}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg font-semibold text-sky-50"
            >
              {formatDateDisplay(selectedDate)}
            </motion.div>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => changeDate(1)}
              className="p-2 hover:bg-white/10 rounded-xl transition-colors text-sky-300"
            >
              <ChevronRight size={20} />
            </motion.button>
          </div>
        </div>

        <div
          ref={timelineRef}
          className="rounded-2xl shadow-lg shadow-black/20 overflow-y-auto relative"
          style={{ ...glassPanel, height: 'calc(100vh - 200px)' }}
        >
          <div className="relative" style={{ height: '1440px' }}>
            <motion.div
              className="absolute left-0 right-0 z-20 flex items-center"
              style={{ top: `${currentTimePosition}px` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-12 h-8 bg-sky-500 rounded-r-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
              <div className="flex-1 h-0.5 bg-sky-500/70" />
            </motion.div>

            {Array.from({ length: 24 }, (_, hour) => {
              const hourTodos = getTodosForHour(hour);
              return (
                <div
                  key={hour}
                  className="relative border-b border-white/8"
                  style={{ height: '60px' }}
                >
                  <div className="absolute left-0 top-0 w-12 text-xs text-sky-500 pl-2 pt-1">
                    {hour.toString().padStart(2, '0')}
                  </div>
                  <div className="absolute left-12 right-0 top-0 bottom-0 pl-2 pr-2">
                    {hourTodos.map((todo) => {
                      const position = getTodoPosition(todo, hour);
                      const isPast = isToday && (timeToMinutes(todo.time) + (todo.duration || 30) < currentTimeInMinutes);
                      return position.isStart ? (
                        <motion.div
                          key={todo.id}
                          className="absolute left-0 right-0 rounded-lg p-2 text-xs overflow-hidden"
                          style={{
                            top: `${position.top}%`,
                            height: `${position.height}%`,
                            background: todo.category
                              ? `linear-gradient(135deg, ${todo.category.color}90 0%, ${todo.category.color}60 100%)`
                              : 'rgba(14,165,233,0.5)',
                            filter: isPast ? 'grayscale(100%)' : 'none',
                            opacity: isPast ? 0.5 : 1,
                            minHeight: '20px',
                          }}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: isPast ? 0.5 : 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="font-medium text-white truncate">{todo.content}</div>
                          <div className="text-[10px] text-white/80">
                            {todo.time} ({todo.duration || 30}分)
                            {todo.priority && ` [${todo.priority === 'high' ? '高' : todo.priority === 'medium' ? '中' : '低'}]`}
                          </div>
                        </motion.div>
                      ) : (
                        <div
                          key={`${todo.id}-${hour}`}
                          className="absolute left-0 right-0 rounded-lg"
                          style={{
                            top: `${position.top}%`,
                            height: `${position.height}%`,
                            background: todo.category
                              ? `linear-gradient(135deg, ${todo.category.color}90 0%, ${todo.category.color}60 100%)`
                              : 'rgba(14,165,233,0.5)',
                            filter: isPast ? 'grayscale(100%)' : 'none',
                            opacity: isPast ? 0.5 : 1,
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </>
  );
}
