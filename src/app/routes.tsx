import { createBrowserRouter, Navigate } from 'react-router';
import { MyDayPage } from './pages/MyDayPage';

// 效能（設計章程支柱 8）：主視圖 My Day 維持 eager，啟動秒開；
// 其餘 6 個次要視圖以 route-level lazy 動態載入，從首屏主 bundle 移除，
// 縮小初始下載量。react-router v7 的 lazy 會在進入路由前解析該 chunk。
export const router = createBrowserRouter([
  // 資訊架構決策（設計章程方案 C）：My Day 為產品主角，設為預設首頁。
  // PWA start_url 亦為 '/'，啟動即落在今日聚焦視圖。
  {
    path: '/',
    Component: MyDayPage,
  },
  {
    // 完整清單降為工具視圖
    path: '/list',
    lazy: async () => ({ Component: (await import('./pages/TodoList')).TodoList }),
  },
  {
    // 舊路由相容：保留 /my-day 書籤與既有 PWA 捷徑，重導向至正規首頁
    path: '/my-day',
    element: <Navigate to="/" replace />,
  },
  {
    path: '/calendar',
    lazy: async () => ({ Component: (await import('./pages/CalendarPage')).CalendarPage }),
  },
  {
    path: '/kanban',
    lazy: async () => ({ Component: (await import('./pages/KanbanPage')).KanbanPage }),
  },
  {
    path: '/stats',
    lazy: async () => ({ Component: (await import('./pages/StatsPage')).StatsPage }),
  },
  {
    path: '/timeline',
    lazy: async () => ({ Component: (await import('./pages/TimelinePage')).TimelinePage }),
  },
  {
    path: '/archive',
    lazy: async () => ({ Component: (await import('./pages/Archive')).Archive }),
  },
]);
