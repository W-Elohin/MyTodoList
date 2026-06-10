import { useNavigate, useLocation } from 'react-router';
import { CheckSquare, Calendar, Sun, Columns3, BarChart3, Clock, Archive, Settings, Home, Store } from 'lucide-react';
import { motion } from 'motion/react';

const items = [
  { path: '/', icon: Sun, label: '今日' },
  { path: '/home', icon: Home, label: 'マイルーム' },
  { path: '/shop', icon: Store, label: 'ショップ' },
  { path: '/list', icon: CheckSquare, label: 'リスト' },
  { path: '/kanban', icon: Columns3, label: 'カンバン' },
  { path: '/calendar', icon: Calendar, label: 'カレンダー' },
  { path: '/timeline', icon: Clock, label: 'タイムライン' },
  { path: '/stats', icon: BarChart3, label: '統計' },
  { path: '/archive', icon: Archive, label: 'アーカイブ' },
  { path: '/settings', icon: Settings, label: '設定' },
];

/**
 * 桌面/平板側邊導航（≥md 顯示，<md 隱藏，由 BottomNav 接手）。
 * 響應式導航光譜：手機底部 Tab → ≥md 側邊欄（見 PM_Guide 10）。
 * sticky 佔位於 flex 流中，內容區以 flex-1 並排，不會被覆蓋。
 */
export function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside
      className="hidden md:flex md:flex-col md:w-56 lg:w-60 sticky top-0 h-screen shrink-0 px-3 py-6 gap-1"
      style={{ borderRight: '1px solid var(--nav-border)' }}
      aria-label="メインナビゲーション"
    >
      <div className="px-3 mb-4 flex items-center gap-2 ocean-heading">
        <span className="font-bold tracking-wide">MyTodo</span>
      </div>
      {items.map((item) => {
        const isActive = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            className="relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors focus-visible:outline-offset-2"
          >
            {isActive && (
              <motion.div
                layoutId="sidebar-active"
                className="absolute inset-0 rounded-xl"
                style={{ background: 'var(--nav-active-bg)' }}
                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
              />
            )}
            <Icon
              size={20}
              className="relative z-10"
              style={{ color: isActive ? 'var(--nav-text-active)' : 'var(--nav-text)' }}
            />
            <span
              className={`relative z-10 text-sm ${isActive ? 'font-medium' : ''}`}
              style={{ color: isActive ? 'var(--nav-text-active)' : 'var(--nav-text)' }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </aside>
  );
}
