import { RouterProvider } from 'react-router';
import { router } from './routes';
import { useEffect } from 'react';
import { registerServiceWorker } from './utils/pwa-register';

export default function App() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return <RouterProvider router={router} />;
}