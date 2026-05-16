import { RouterProvider } from 'react-router';
import { Toaster } from 'sonner';
import { router } from './routes';
import { useEffect } from 'react';
import { registerServiceWorker } from './utils/pwa-register';
import { initReminderService } from './utils/reminder';
import { useUpdateCheck } from './hooks/useUpdateCheck';
import { UpdatePrompt } from './components/UpdatePrompt';

export default function App() {
  const { updateAvailable, applyUpdate, dismissUpdate } = useUpdateCheck();

  useEffect(() => {
    registerServiceWorker();
    initReminderService();
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-center" richColors />
      <UpdatePrompt
        open={updateAvailable}
        onUpdate={applyUpdate}
        onDismiss={dismissUpdate}
      />
    </>
  );
}
