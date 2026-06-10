import { useNavigate, useLocation } from 'react-router';
import { CheckSquare, Sun, Home, Store, Settings } from 'lucide-react';
import { motion } from 'motion/react';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: '/', icon: Sun, label: '今日' },
    { path: '/home', icon: Home, label: 'ルーム' },
    { path: '/shop', icon: Store, label: 'ショップ' },
    { path: '/list', icon: CheckSquare, label: 'リスト' },
    { path: '/settings', icon: Settings, label: '設定' },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 safe-area-inset-bottom z-30"
      style={{
        background: 'var(--nav-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid var(--nav-border)',
      }}
      aria-label="メインナビゲーション"
    >
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const isActive = location.pathname === tab.path;
          const Icon = tab.icon;

          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              aria-label={tab.label}
              aria-current={isActive ? 'page' : undefined}
              className="relative flex flex-col items-center justify-center flex-1 h-full focus-visible:outline-offset-1"
            >
              {isActive && (
                <motion.div
                  layoutId="ocean-bubble"
                  className="absolute inset-0 flex items-center justify-center"
                  transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                >
                  <div className="w-14 h-10 rounded-xl" style={{ background: 'var(--nav-active-bg)' }} />
                </motion.div>
              )}
              <Icon
                className="relative z-10 transition-colors"
                style={{ color: isActive ? 'var(--nav-text-active)' : 'var(--nav-text)' }}
                size={22}
              />
              <span
                className="relative z-10 text-[10px] mt-0.5 transition-colors"
                style={{ color: isActive ? 'var(--nav-text-active)' : 'var(--nav-text)' }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
