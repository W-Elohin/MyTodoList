import { RouterProvider } from 'react-router';
import { MotionConfig } from 'motion/react';
import { Toaster } from 'sonner';
import { router } from './routes';
import { useEffect } from 'react';
import { registerServiceWorker } from './utils/pwa-register';
import { initReminderService } from './utils/reminder';
import { useUpdateCheck } from './hooks/useUpdateCheck';
import { UpdatePrompt } from './components/UpdatePrompt';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ThemeProvider } from './components/ThemeProvider';
import { GameProvider } from './context/GameContext';

export default function App() {
  const { updateAvailable, applyUpdate, dismissUpdate } = useUpdateCheck();

  useEffect(() => {
    registerServiceWorker();
    initReminderService();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <GameProvider>
          {/* 全站動畫尊重使用者的「減少動態」系統偏好（a11y） */}
          <MotionConfig reducedMotion="user">
            <RouterProvider router={router} />
            <Toaster position="top-center" richColors />
            <UpdatePrompt
              open={updateAvailable}
              onUpdate={applyUpdate}
              onDismiss={dismissUpdate}
            />
          </MotionConfig>
        </GameProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
