import { useNavigate, useLocation } from 'react-router';
import { CheckSquare, Calendar, Clock } from 'lucide-react';
import { motion } from 'motion/react';

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: '/', icon: CheckSquare, label: 'ToDoリスト' },
    { path: '/calendar', icon: Calendar, label: 'カレンダー' },
    { path: '/timeline', icon: Clock, label: 'タイムライン' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 backdrop-blur-md border-t border-gray-200 safe-area-inset-bottom bg-[#f4f0edcc]">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-4 bg-[#f4f0ed]">
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
                  layoutId="bubble"
                  className="absolute inset-0 flex items-center justify-center"
                  transition={{
                    type: 'spring',
                    bounce: 0.3,
                    duration: 0.6,
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-xl shadow-md px-[10px] py-[0px] bg-[#f4f0ed]"
                  />
                </motion.div>
              )}
              <Icon
                className={`relative z-10 transition-colors ${
                  isActive ? 'text-gray-800' : 'text-gray-500'
                }`}
                size={24}
              />
              <span
                className={`relative z-10 text-xs mt-1 transition-colors ${
                  isActive ? 'text-gray-800' : 'text-gray-500'
                }`}
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