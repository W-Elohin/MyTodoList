import { Outlet } from 'react-router';
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
  return (
    <div className="min-h-screen" style={{ background: 'var(--ocean-gradient)' }}>
      <BackgroundAnimation />
      <div className="relative md:flex">
        <Sidebar />
        <main className="flex-1 min-h-screen pb-24 md:pb-10">
          <div className="mx-auto w-full px-4 pt-8 max-w-md md:max-w-3xl lg:max-w-4xl">
            <Outlet />
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
