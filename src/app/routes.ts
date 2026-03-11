import { createBrowserRouter } from 'react-router';
import { TodoList } from './pages/TodoList';
import { CalendarPage } from './pages/CalendarPage';
import { Archive } from './pages/Archive';

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
    path: '/archive',
    Component: Archive,
  },
]);
