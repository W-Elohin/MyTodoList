import { createBrowserRouter } from 'react-router';
import { TodoList } from './pages/TodoList';
import { CalendarPage } from './pages/CalendarPage';
import { Archive } from './pages/Archive';
import { TimelinePage } from './pages/TimelinePage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: TodoList,
  },
  {
    path: '/calendar',
    Component: CalendarPage,
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