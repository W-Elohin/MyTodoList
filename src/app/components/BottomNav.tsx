import { useNavigate, useLocation } from 'react-router';
import { CheckSquare, Calendar, Sun, Columns3, BarChart3 } from 'lucide-react';
import { motion } from 'motion/react';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: '/', icon: Sun, label: '今日' },
    { path: '/list', icon: CheckSquare, label: 'リスト' },
    { path: '/kanban', icon: Columns3, label: '看板' },
    { path: '/calendar', icon: Calendar, label: 'カレンダー' },
    { path: '/stats', icon: BarChart3, label: '統計' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 safe-area-inset-bottom"
      style={{ background: 'rgba(10, 22, 40, 0.85)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.1)' }}
    >
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-4">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className="relative flex flex-col items-center justify-center flex-1 h-full"
            >
              {isActive && (
                <motion.div
                  layoutId="ocean-bubble"
                  className="absolute inset-0 flex items-center justify-center"
                  transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                >
                  <div className="w-14 h-10 rounded-xl" style={{ background: 'rgba(14, 165, 233, 0.2)' }} />
                </motion.div>
              )}
              <Icon
                className={`relative z-10 transition-colors ${isActive ? 'text-sky-100' : 'text-sky-500'}`}
                size={24}
              />
              <span
                className={`relative z-10 text-xs mt-1 transition-colors ${isActive ? 'text-sky-100' : 'text-sky-500'}`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
