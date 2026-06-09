import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3 } from 'lucide-react';
import { Todo } from '../types';
import { storage } from '../utils/storage';
import { getLocalDateString } from '../utils/date';
import { calculateStats } from '../utils/statsCalculator';

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

  const glassPanel = {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.12)',
  } as const;

  return (
    <>
      <div>
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 size={32} className="text-sky-400" />
          <h1 className="text-2xl md:text-3xl font-bold text-sky-50">統計</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl p-6 shadow-lg shadow-black/20"
            style={glassPanel}
          >
            <h2 className="font-semibold text-sky-100 mb-5">今日完成率</h2>
            <div className="flex items-center justify-center">
              <div className="relative" style={{ width: circleSize, height: circleSize }}>
                <svg width={circleSize} height={circleSize} className="-rotate-90">
                  <circle
                    cx={circleSize / 2}
                    cy={circleSize / 2}
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={strokeWidth}
                  />
                  <motion.circle
                    cx={circleSize / 2}
                    cy={circleSize / 2}
                    r={radius}
                    fill="none"
                    stroke="#0ea5e9"
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
                    className="text-4xl font-bold text-sky-50"
                  >
                    {stats.todayCompletionRate}%
                  </motion.span>
                  <span className="text-xs text-sky-400 mt-1">
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
            className="rounded-2xl p-6 shadow-lg shadow-black/20"
            style={glassPanel}
          >
            <h2 className="font-semibold text-sky-100 mb-5">連続達成</h2>
            <div className="h-[168px] flex flex-col items-center justify-center">
              <motion.div
                key={stats.streak}
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="flex items-end gap-3"
              >
                <span className="text-6xl font-bold text-sky-50">{stats.streak}</span>
                <span className="text-4xl leading-tight">🔥</span>
              </motion.div>
              <p className="text-sm text-sky-400 mt-3">日連続で達成中</p>
              <p className="text-xs text-sky-500 mt-2">累計完了 {stats.totalCompleted} 件</p>
            </div>
          </motion.section>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          className="rounded-2xl p-6 shadow-lg shadow-black/20 mb-4"
          style={glassPanel}
        >
          <h2 className="font-semibold text-sky-100 mb-5">本週トレンド</h2>
          <div className="h-52 flex items-end gap-3">
            {stats.weeklyData.map((day) => {
              const height = Math.max((day.count / maxWeeklyCount) * 150, day.count > 0 ? 14 : 4);
              const isToday = day.date === today;

              return (
                <div key={day.date} className="flex-1 h-full flex flex-col items-center justify-end gap-2">
                  <span className="text-xs font-semibold text-sky-400">{day.count}</span>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    className="w-full max-w-12 rounded-t-xl"
                    style={{ backgroundColor: isToday ? '#0ea5e9' : 'rgba(255,255,255,0.2)' }}
                  />
                  <span className={`text-[11px] ${isToday ? 'text-sky-300 font-semibold' : 'text-sky-500'}`}>
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
          className="rounded-2xl p-6 shadow-lg shadow-black/20"
          style={glassPanel}
        >
          <h2 className="font-semibold text-sky-100 mb-5">分類統計</h2>
          <div className="space-y-4">
            {stats.categoryBreakdown.length === 0 ? (
              <p className="text-center text-sky-500 py-8">未完成タスクがありません</p>
            ) : (
              stats.categoryBreakdown.map((category) => (
                <div key={category.name}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium text-sky-200">{category.name}</span>
                    <span className="text-sky-400">{category.count}</span>
                  </div>
                  <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
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

    </>
  );
}
