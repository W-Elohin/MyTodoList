import { createBrowserRouter, Navigate } from 'react-router';
import { TodoList } from './pages/TodoList';
import { CalendarPage } from './pages/CalendarPage';
import { Archive } from './pages/Archive';
import { TimelinePage } from './pages/TimelinePage';
import { MyDayPage } from './pages/MyDayPage';
import { KanbanPage } from './pages/KanbanPage';
import { StatsPage } from './pages/StatsPage';

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
    Component: TodoList,
  },
  {
    // 舊路由相容：保留 /my-day 書籤與既有 PWA 捷徑，重導向至正規首頁
    path: '/my-day',
    element: <Navigate to="/" replace />,
  },
  {
    path: '/calendar',
    Component: CalendarPage,
  },
  {
    path: '/kanban',
    Component: KanbanPage,
  },
  {
    path: '/stats',
    Component: StatsPage,
  },
  {
    path: '/timeline',
    Component: TimelinePage,
  },
  {
    path: '/archive',
    Component: Archive,
  },
]);
