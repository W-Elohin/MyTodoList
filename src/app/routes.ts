import { createBrowserRouter } from 'react-router';
import { TodoList } from './pages/TodoList';
import { CalendarPage } from './pages/CalendarPage';
import { Archive } from './pages/Archive';
import { TimelinePage } from './pages/TimelinePage';
import { MyDayPage } from './pages/MyDayPage';
import { KanbanPage } from './pages/KanbanPage';
import { StatsPage } from './pages/StatsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: TodoList,
  },
  {
    path: '/my-day',
    Component: MyDayPage,
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
