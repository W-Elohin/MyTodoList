import { Outlet, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { pageTransition, pageVariants } from '../utils/animations';
import { BackgroundAnimation } from './BackgroundAnimation';
import { BottomNav } from './BottomNav';
import { Sidebar } from './Sidebar';

/**
 * 全站響應式佈局外殼（layout route）。
 * 統一提供海洋背景、導航與內容容器，取代各頁各自重複的
 * min-h-screen + BackgroundAnimation + max-w-md + BottomNav。
 *
 * 響應式策略（見 PM_Guide 10）：
 * - <md：底部 BottomNav（拇指熱區）。
 * - ≥md：左側 Sidebar，內容區並排放寬（max-w 隨斷點增大）。
 */
export function AppShell() {
  const location = useLocation();
  return (
    <div className="min-h-screen ocean-bg">
      <BackgroundAnimation />
      <div className="relative md:flex">
        <Sidebar />
        <main className="flex-1 min-h-screen pb-24 md:pb-10">
          <div className="mx-auto w-full px-4 pt-6 md:pt-8 max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl">
            {/* 視圖切換過場：淡入 + 輕微上滑，讓導航更有質感 */}
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                variants={pageVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={pageTransition}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
