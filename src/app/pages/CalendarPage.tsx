import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Todo } from '../types';
import { storage } from '../utils/storage';
import { BackgroundAnimation } from '../components/BackgroundAnimation';
import { BottomNav } from '../components/BottomNav';

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    setTodos(storage.getTodos().filter((t) => !t.completed));
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

        {/* Calendar Header */}
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

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-2 mb-2">
            {['日', '一', '二', '三', '四', '五', '六'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-gray-600">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {days.map((day, index) => {
              if (day === null) {
                return <div key={`empty-${index}`} />;
              }

              const dateString = formatDateString(day);
              const todosForDay = getTodosForDate(dateString);
              const isSelected = selectedDate === dateString;
              const isToday =
                dateString === new Date().toISOString().split('T')[0];

              return (
                <motion.button
                  key={day}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() =>
                    setSelectedDate(selectedDate === dateString ? null : dateString)
                  }
                  className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-sm relative transition-all ${
                    isSelected
                      ? 'bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-lg'
                      : isToday
                      ? 'bg-blue-100 text-blue-600'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="font-medium">{day}</span>
                  {todosForDay.length > 0 && (
                    <div className="flex gap-0.5 mt-1">
                      {todosForDay.slice(0, 3).map((todo, i) => (
                        <div
                          key={i}
                          className="w-1 h-1 rounded-full"
                          style={{
                            backgroundColor: todo.category?.color || '#81DDE6',
                          }}
                        />
                      ))}
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Selected Date Todos */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
          >
            <h3 className="font-semibold mb-4">
              {selectedDate} のToDo ({selectedTodos.length})
            </h3>
            <div className="space-y-3">
              {selectedTodos.length === 0 ? (
                <p className="text-gray-400 text-center py-4">ToDoがありません</p>
              ) : (
                selectedTodos.map((todo) => (
                  <div
                    key={todo.id}
                    className="p-4 rounded-xl"
                    style={{
                      background: todo.category
                        ? `linear-gradient(135deg, ${todo.category.color}15 0%, ${todo.category.color}05 100%)`
                        : 'rgba(255, 255, 255, 0.5)',
                    }}
                  >
                    <p className="font-medium mb-1">{todo.content}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>{todo.time}</span>
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