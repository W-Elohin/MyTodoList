import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { useSearchParams } from 'react-router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Todo } from '../types';
import { storage } from '../utils/storage';
import { getLocalDateString } from '../utils/date';
import { BackgroundAnimation } from '../components/BackgroundAnimation';
import { BottomNav } from '../components/BottomNav';

export function TimelinePage() {
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get('date');
  
  const [selectedDate, setSelectedDate] = useState(() => {
    return dateParam || getLocalDateString();
  });
  const [todos, setTodos] = useState<Todo[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const timelineRef = useRef<HTMLDivElement>(null);
  const hasScrolled = useRef(false);

  const loadTodos = () => {
    const allTodos = storage.getTodos();
    const todayTodos = allTodos.filter((t) => t.date === selectedDate);
    setTodos(todayTodos);
  };

  useEffect(() => {
    loadTodos();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // 1分ごとに更新

    const handleStorageChange = () => {
      loadTodos();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);

    return () => {
      clearInterval(timer);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, [selectedDate]);

  // 現在時刻の位置にスクロール（今日を表示時、初回または日付切替時）
  useEffect(() => {
    if (selectedDate !== getLocalDateString()) return; // 今日以外はスクロールしない

    const scrollToCurrentTime = () => {
      if (!timelineRef.current) return;
      const currentHour = currentTime.getHours();
      const currentMinute = currentTime.getMinutes();
      const currentTimeInHours = currentHour + currentMinute / 60;
      const pixelsPerHour = 60;
      const currentPosition = currentTimeInHours * pixelsPerHour;
      const viewportHeight = window.innerHeight;
      const targetScroll = currentPosition - viewportHeight / 3;
      timelineRef.current.scrollTop = Math.max(0, targetScroll);
    };

    if (!hasScrolled.current) {
      // レイアウト確定後にスクロール（DOM 準備待ち）
      const id = requestAnimationFrame(() => {
        scrollToCurrentTime();
        hasScrolled.current = true;
      });
      return () => cancelAnimationFrame(id);
    }
  }, [selectedDate, currentTime, todos]);

  // 時間をHH:MM形式から分単位に変換
  const timeToMinutes = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // 現在時刻を分単位で取得
  const currentTimeInMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  // 選択した日付が今日かどうかをチェック
  const isToday = selectedDate === getLocalDateString();

  // 各時間帯のTodoを取得
  const getTodosForHour = (hour: number) => {
    return todos.filter((todo) => {
      const todoStartMinutes = timeToMinutes(todo.time);
      const todoStartHour = Math.floor(todoStartMinutes / 60);
      const todoEndMinutes = todoStartMinutes + (todo.duration || 30);
      const todoEndHour = Math.floor(todoEndMinutes / 60);
      
      return hour >= todoStartHour && hour <= todoEndHour;
    });
  };

  // Todoの開始位置と高さを計算
  const getTodoPosition = (todo: Todo, hour: number) => {
    const todoStartMinutes = timeToMinutes(todo.time);
    const todoStartHour = Math.floor(todoStartMinutes / 60);
    const todoEndMinutes = todoStartMinutes + (todo.duration || 30);
    
    if (todoStartHour === hour) {
      const startMinuteInHour = todoStartMinutes % 60;
      const topPercent = (startMinuteInHour / 60) * 100;
      const durationInThisHour = Math.min(60 - startMinuteInHour, (todo.duration || 30));
      const heightPercent = (durationInThisHour / 60) * 100;
      
      return { top: topPercent, height: heightPercent, isStart: true };
    } else {
      const todoEndHour = Math.floor(todoEndMinutes / 60);
      if (hour < todoEndHour) {
        // 中間の時間帯
        return { top: 0, height: 100, isStart: false };
      } else {
        // 最後の時間帯
        const endMinuteInHour = todoEndMinutes % 60;
        return { top: 0, height: (endMinuteInHour / 60) * 100, isStart: false };
      }
    }
  };

  // 現在時刻の位置（0-24時間の範囲で）
  const currentTimePosition = (currentTime.getHours() + currentTime.getMinutes() / 60) * 60;

  // 日付変更関数
  const changeDate = (offset: number) => {
    const current = new Date(selectedDate + 'T12:00:00'); // ローカル日付として解釈
    current.setDate(current.getDate() + offset);
    setSelectedDate(getLocalDateString(current));
    hasScrolled.current = false; // 日付変更時に再度スクロール
  };

  // 日付フォーマット関数
  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
    return `${month}月${day}日 (${dayOfWeek})`;
  };

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#F4F0ED' }}>
      <BackgroundAnimation />

      <div className="max-w-md mx-auto px-4 pt-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">タイムライン</h1>

        {/* 日付選択器 */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 shadow-lg mb-4">
          <div className="flex items-center justify-between">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => changeDate(-1)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ChevronLeft size={20} />
            </motion.button>
            
            <motion.div
              key={selectedDate}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-lg font-semibold text-gray-800"
            >
              {formatDateDisplay(selectedDate)}
            </motion.div>
            
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => changeDate(1)}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ChevronRight size={20} />
            </motion.button>
          </div>
        </div>

        <div
          ref={timelineRef}
          className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg overflow-y-auto relative"
          style={{ height: 'calc(100vh - 200px)' }}
        >
          {/* Timeline */}
          <div className="relative" style={{ height: '1440px' }}> {/* 24時間 × 60px */}
            {/* 現在時刻のライン */}
            <motion.div
              className="absolute left-0 right-0 z-20 flex items-center"
              style={{ top: `${currentTimePosition}px` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-12 h-8 bg-red-500 rounded-r-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full" />
              </div>
              <div className="flex-1 h-0.5 bg-red-500" />
            </motion.div>

            {/* 時間軸とTodo */}
            {Array.from({ length: 24 }, (_, hour) => {
              const hourTodos = getTodosForHour(hour);
              
              return (
                <div
                  key={hour}
                  className="relative border-b border-gray-200"
                  style={{ height: '60px' }}
                >
                  {/* 時刻表示 */}
                  <div className="absolute left-0 top-0 w-12 text-xs text-gray-500 pl-2 pt-1">
                    {hour.toString().padStart(2, '0')}
                  </div>

                  {/* Todo表示エリア */}
                  <div className="absolute left-12 right-0 top-0 bottom-0 pl-2 pr-2">
                    {hourTodos.map((todo) => {
                      const position = getTodoPosition(todo, hour);
                      // 今日の場合のみ過去/未来を判定、それ以外は全てカラー表示
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
                              : 'rgba(129, 221, 230, 0.6)',
                            filter: isPast ? 'grayscale(100%)' : 'none',
                            opacity: isPast ? 0.5 : 1,
                            minHeight: '20px',
                          }}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: isPast ? 0.5 : 1, scale: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="font-medium text-white truncate">{todo.content}</div>
                          <div className="text-[10px] text-white/90">
                            {todo.time} ({todo.duration || 30}分)
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
                              : 'rgba(129, 221, 230, 0.6)',
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

      <BottomNav />
    </div>
  );
}