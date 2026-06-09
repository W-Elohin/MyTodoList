import { createBrowserRouter, Navigate } from 'react-router';
import { AppShell } from './components/AppShell';
import { MyDayPage } from './pages/MyDayPage';

// 響應式 AppShell 為 layout route，統一提供背景、導航與內容容器（見 PM_Guide 10、11）。
// My Day 維持 eager（主視圖秒開）；其餘 6 個次要視圖 route-level lazy（見 PM_Guide 06）。
export const router = createBrowserRouter([
  {
    path: '/',
    Component: AppShell,
    children: [
      // 資訊架構決策（方案 C）：My Day 為主角，預設首頁。PWA start_url 亦為 '/'。
      { index: true, Component: MyDayPage },
      // 完整清單降為工具視圖
      { path: 'list', lazy: async () => ({ Component: (await import('./pages/TodoList')).TodoList }) },
      { path: 'calendar', lazy: async () => ({ Component: (await import('./pages/CalendarPage')).CalendarPage }) },
      { path: 'kanban', lazy: async () => ({ Component: (await import('./pages/KanbanPage')).KanbanPage }) },
      { path: 'stats', lazy: async () => ({ Component: (await import('./pages/StatsPage')).StatsPage }) },
      { path: 'timeline', lazy: async () => ({ Component: (await import('./pages/TimelinePage')).TimelinePage }) },
      { path: 'archive', lazy: async () => ({ Component: (await import('./pages/Archive')).Archive }) },
      // 舊路由相容：保留 /my-day 書籤與既有 PWA 捷徑，重導向至正規首頁
      { path: 'my-day', element: <Navigate to="/" replace /> },
    ],
  },
]);
