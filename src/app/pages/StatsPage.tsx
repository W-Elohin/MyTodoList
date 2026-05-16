import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3 } from 'lucide-react';
import { Todo } from '../types';
import { storage } from '../utils/storage';
import { getLocalDateString } from '../utils/date';
import { calculateStats } from '../utils/statsCalculator';
import { BackgroundAnimation } from '../components/BackgroundAnimation';
import { BottomNav } from '../components/BottomNav';

const circleSize = 168;
const strokeWidth = 14;
const radius = (circleSize - strokeWidth) / 2;
const circumference = 2 * Math.PI * radius;

const formatDayLabel = (date: string) => {
  const parsed = new Date(`${date}T00:00:00`);
  return `${parsed.getMonth() + 1}/${parsed.getDate()}`;
};

export function StatsPage() {
  const [todos, setTodos] = useState<Todo[]>([]);

  const loadTodos = () => {
    setTodos(storage.getTodos());
  };

  useEffect(() => {
    loadTodos();

    const handleStorageChange = () => loadTodos();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  const stats = useMemo(() => calculateStats(todos), [todos]);
  const maxWeeklyCount = Math.max(...stats.weeklyData.map((day) => day.count), 1);
  const maxCategoryCount = Math.max(...stats.categoryBreakdown.map((item) => item.count), 1);
  const today = getLocalDateString();
  const strokeOffset = circumference - (stats.todayCompletionRate / 100) * circumference;

  return (
    <div className="min-h-screen pb-24" style={{ backgroundColor: '#F4F0ED' }}>
      <BackgroundAnimation />

      <div className="max-w-4xl mx-auto px-4 pt-8">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 size={32} className="text-gray-700" />
          <h1 className="text-3xl font-bold text-gray-800">統計</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/75 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
          >
            <h2 className="font-semibold text-gray-800 mb-5">今日完成率</h2>
            <div className="flex items-center justify-center">
              <div className="relative" style={{ width: circleSize, height: circleSize }}>
                <svg width={circleSize} height={circleSize} className="-rotate-90">
                  <circle
                    cx={circleSize / 2}
                    cy={circleSize / 2}
                    r={radius}
                    fill="none"
                    stroke="#EEE7E2"
                    strokeWidth={strokeWidth}
                  />
                  <motion.circle
                    cx={circleSize / 2}
                    cy={circleSize / 2}
                    r={radius}
                    fill="none"
                    stroke="#2A89C6"
                    strokeLinecap="round"
                    strokeWidth={strokeWidth}
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: strokeOffset }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.span
                    key={stats.todayCompletionRate}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-bold text-gray-800"
                  >
                    {stats.todayCompletionRate}%
                  </motion.span>
                  <span className="text-xs text-gray-500 mt-1">
                    {stats.todayCompleted}/{stats.todayTotal}
                  </span>
                </div>
              </div>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="bg-white/75 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
          >
            <h2 className="font-semibold text-gray-800 mb-5">連續天數</h2>
            <div className="h-[168px] flex flex-col items-center justify-center">
              <motion.div
                key={stats.streak}
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-end gap-3"
              >
                <span className="text-6xl font-bold text-gray-800">{stats.streak}</span>
                <span className="text-4xl leading-tight">🔥</span>
              </motion.div>
              <p className="text-sm text-gray-500 mt-3">日連続で達成中</p>
              <p className="text-xs text-gray-400 mt-2">累計完了 {stats.totalCompleted} 件</p>
            </div>
          </motion.section>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="bg-white/75 backdrop-blur-sm rounded-2xl p-6 shadow-lg mb-4"
        >
          <h2 className="font-semibold text-gray-800 mb-5">本週トレンド</h2>
          <div className="h-52 flex items-end gap-3">
            {stats.weeklyData.map((day) => {
              const height = Math.max((day.count / maxWeeklyCount) * 150, day.count > 0 ? 14 : 4);
              const isToday = day.date === today;

              return (
                <div key={day.date} className="flex-1 h-full flex flex-col items-center justify-end gap-2">
                  <span className="text-xs font-semibold text-gray-600">{day.count}</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className={`w-full max-w-12 rounded-t-xl ${isToday ? 'bg-[#2A89C6]' : 'bg-[#B5A89E]'}`}
                  />
                  <span className={`text-[11px] ${isToday ? 'text-[#2A89C6] font-semibold' : 'text-gray-500'}`}>
                    {formatDayLabel(day.date)}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="bg-white/75 backdrop-blur-sm rounded-2xl p-6 shadow-lg"
        >
          <h2 className="font-semibold text-gray-800 mb-5">分類統計</h2>
          <div className="space-y-4">
            {stats.categoryBreakdown.length === 0 ? (
              <p className="text-center text-gray-400 py-8">未完成任務がありません</p>
            ) : (
              stats.categoryBreakdown.map((category) => (
                <div key={category.name}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium text-gray-700">{category.name}</span>
                    <span className="text-gray-500">{category.count}</span>
                  </div>
                  <div className="h-3 rounded-full bg-[#EEE7E2] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(category.count / maxCategoryCount) * 100}%` }}
                      transition={{ duration: 0.65, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.section>
      </div>

      <BottomNav />
    </div>
  );
}
