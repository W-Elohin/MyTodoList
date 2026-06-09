import { useState, useEffect, useCallback } from 'react';

declare const __APP_VERSION__: string;

/**
 * 檢查是否有新版本可用
 * 僅在連線時才執行檢查，離線時不發送請求
 */
export function useUpdateCheck() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const checkForUpdate = useCallback(async () => {
    // 離線時不檢查
    if (!navigator.onLine) return;

    setIsChecking(true);
    try {
      // 使用 cache-busting 確保取得最新版本資訊
      const res = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (!res.ok) return;

      const data = await res.json();
      const latestVersion = data?.version;

      if (latestVersion && latestVersion !== __APP_VERSION__) {
        setUpdateAvailable(true);
      }
    } catch {
      // 網路錯誤或無法取得版本時靜默忽略
    } finally {
      setIsChecking(false);
    }
  }, []);

  useEffect(() => {
    // 僅在連線時檢查
    if (!navigator.onLine) return;

    checkForUpdate();

    // 監聽網路狀態，恢復連線時可再次檢查
    const handleOnline = () => checkForUpdate();
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [checkForUpdate]);

  const applyUpdate = useCallback(() => {
    // 清除快取並重新載入以取得最新版本
    if ('caches' in window) {
      caches.keys().then((names) => {
        Promise.all(names.map((name) => caches.delete(name))).then(() => {
          window.location.reload();
        });
      });
    } else {
      window.location.reload();
    }
  }, []);

  return { updateAvailable, isChecking, applyUpdate, dismissUpdate: () => setUpdateAvailable(false) };
}
