import { useEffect, useRef, useState } from 'react';
import { useTheme } from 'next-themes';
import { Settings, Sun, Moon, Monitor, Download, Upload, Bell, BellOff, Info, User } from 'lucide-react';
import { toast } from 'sonner';
import { CreatureImage } from '../components/creatures/CreatureImage';
import { useGame } from '../context/GameContext';
import { ANIMAL_PROTAGONISTS, HUMAN_PROTAGONISTS, isCreatureVariant } from '../data/protagonists';
import type { ProtagonistType } from '../types/gamification';
import { storage, isTodoArray, isCategoryArray } from '../utils/storage';
import { requestNotificationPermission } from '../utils/reminder';

type ThemeOption = 'light' | 'dark' | 'system';

const THEME_OPTIONS: { value: ThemeOption; label: string; icon: typeof Sun }[] = [
  { value: 'light', label: 'ライト', icon: Sun },
  { value: 'dark', label: 'ダーク', icon: Moon },
  { value: 'system', label: 'システム', icon: Monitor },
];

export function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { profile, setProtagonist } = useGame();
  const [protagonistTab, setProtagonistTab] = useState<ProtagonistType>(profile.protagonist.type);
  const [mounted, setMounted] = useState(false);
  const [notificationGranted, setNotificationGranted] = useState(false);
  const [notificationSupported, setNotificationSupported] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const appVersion = '0.0.1';

  useEffect(() => {
    setMounted(true);
    setNotificationSupported(typeof window !== 'undefined' && 'Notification' in window);
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationGranted(Notification.permission === 'granted');
    }
  }, []);

  const handleExport = () => {
    const allTodos = storage.getTodos();
    const cats = storage.getCategories();
    const data = { todos: allTodos, categories: cats, exportDate: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todo-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('バックアップをエクスポートしました');
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const hasValidTodos = isTodoArray(data?.todos);
        const hasValidCategories = isCategoryArray(data?.categories);

        if (!hasValidTodos && !hasValidCategories) {
          toast.error('バックアップファイルの形式が正しくありません。');
          return;
        }

        if (hasValidTodos) storage.saveTodos(data.todos);
        if (hasValidCategories) storage.saveCategories(data.categories);
        toast.success('データを正常にインポートしました！');
        window.dispatchEvent(new Event('storage'));
      } catch {
        toast.error('インポートに失敗しました。ファイルを確認してください。');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleNotificationToggle = async () => {
    if (!notificationSupported) return;
    if (notificationGranted) {
      toast.info('通知の無効化はブラウザの設定から行ってください');
      return;
    }
    const granted = await requestNotificationPermission();
    setNotificationGranted(granted);
    if (granted) toast.success('通知が有効になりました');
    else toast.error('通知の許可が拒否されました');
  };

  const activeTheme = (theme ?? 'dark') as ThemeOption;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 md:mb-8">
        <Settings size={32} className="text-[var(--ocean-surface)]" aria-hidden />
        <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold ocean-heading">設定</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* 主人公 */}
        <section className="ocean-glass-panel p-5 md:p-6 shadow-lg lg:col-span-2">
          <h2 className="font-semibold ocean-heading mb-2 text-base md:text-lg">主人公</h2>
          <p className="text-sm ocean-body mb-4">
            マイルームに表示されるキャラクターを選びます。動物と人間の両方から選べます。
          </p>

          <div className="flex gap-2 mb-4" role="tablist" aria-label="主人公タイプ">
            {(['animal', 'human'] as const).map((type) => (
              <button
                key={type}
                type="button"
                role="tab"
                aria-selected={protagonistTab === type}
                onClick={() => setProtagonistTab(type)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  protagonistTab === type
                    ? 'border-[var(--ocean-surface)] bg-[var(--nav-active-bg)] ocean-heading'
                    : 'border-[var(--glass-border)] ocean-muted hover:bg-[var(--glass-bg-hover)]'
                }`}
              >
                {type === 'animal' ? '動物' : '人間'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {(protagonistTab === 'animal' ? ANIMAL_PROTAGONISTS : HUMAN_PROTAGONISTS).map((opt) => {
              const isActive =
                profile.protagonist.type === opt.type && profile.protagonist.variant === opt.variant;

              return (
                <button
                  key={`${opt.type}-${opt.variant}`}
                  type="button"
                  onClick={() => setProtagonist({ type: opt.type, variant: opt.variant })}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-colors ${
                    isActive
                      ? 'border-[var(--ocean-surface)] bg-[var(--nav-active-bg)]'
                      : 'border-[var(--glass-border)] hover:bg-[var(--glass-bg-hover)]'
                  }`}
                >
                  <div className="h-16 flex items-center justify-center">
                    {opt.type === 'animal' && isCreatureVariant(opt.variant) ? (
                      <CreatureImage name={opt.variant} size={64} float={false} />
                    ) : (
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center"
                        style={{
                          background: 'linear-gradient(135deg, rgba(14,165,233,0.25), rgba(16,185,129,0.15))',
                          border: '1px solid rgba(255,255,255,0.15)',
                        }}
                      >
                        <User size={24} className="text-sky-300" />
                      </div>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${isActive ? 'ocean-heading' : 'ocean-muted'}`}>
                    {opt.labelJa}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* テーマ */}
        <section className="ocean-glass-panel p-5 md:p-6 shadow-lg">
          <h2 className="font-semibold ocean-heading mb-4 text-base md:text-lg">テーマ</h2>
          {mounted ? (
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="テーマ選択">
              {THEME_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isActive = activeTheme === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={isActive}
                    onClick={() => setTheme(opt.value)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-colors ${
                      isActive
                        ? 'border-[var(--ocean-surface)] bg-[var(--nav-active-bg)]'
                        : 'border-[var(--glass-border)] hover:bg-[var(--glass-bg-hover)]'
                    }`}
                  >
                    <Icon size={20} className={isActive ? 'text-[var(--ocean-surface)]' : 'ocean-muted'} />
                    <span className={`text-xs font-medium ${isActive ? 'ocean-heading' : 'ocean-muted'}`}>
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="h-20 animate-pulse rounded-xl bg-[var(--glass-bg)]" />
          )}
          {mounted && resolvedTheme && (
            <p className="text-xs ocean-muted mt-3">
              現在：{resolvedTheme === 'dark' ? 'ダークモード' : 'ライトモード'}
            </p>
          )}
        </section>

        {/* 通知 */}
        <section className="ocean-glass-panel p-5 md:p-6 shadow-lg">
          <h2 className="font-semibold ocean-heading mb-4 text-base md:text-lg">リマインダー</h2>
          <p className="text-sm ocean-body mb-4">
            タスクの期限時刻にブラウザ通知を送信します。
          </p>
          <button
            type="button"
            onClick={handleNotificationToggle}
            disabled={!notificationSupported}
            aria-label={notificationGranted ? '通知は有効です' : '通知を有効にする'}
            className="flex items-center gap-3 w-full p-3 rounded-xl border border-[var(--glass-border)] hover:bg-[var(--glass-bg-hover)] transition-colors disabled:opacity-50"
          >
            {notificationGranted ? (
              <Bell size={20} className="text-[var(--seaweed)]" />
            ) : (
              <BellOff size={20} className="ocean-muted" />
            )}
            <span className="text-sm ocean-heading">
              {!notificationSupported
                ? 'このブラウザは通知に対応していません'
                : notificationGranted
                ? '通知：オン'
                : '通知を有効にする'}
            </span>
          </button>
        </section>

        {/* バックアップ */}
        <section className="ocean-glass-panel p-5 md:p-6 shadow-lg">
          <h2 className="font-semibold ocean-heading mb-4 text-base md:text-lg">データのバックアップ</h2>
          <p className="text-sm ocean-body mb-4">
            タスクとカテゴリーを JSON ファイルでエクスポート・インポートできます。
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={handleExport}
              className="flex items-center justify-center gap-2 flex-1 px-4 py-3 rounded-xl border border-[var(--glass-border)] hover:bg-[var(--glass-bg-hover)] transition-colors text-sm ocean-heading"
            >
              <Download size={18} />
              エクスポート
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-2 flex-1 px-4 py-3 rounded-xl border border-[var(--glass-border)] hover:bg-[var(--glass-bg-hover)] transition-colors text-sm ocean-heading"
            >
              <Upload size={18} />
              インポート
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImport}
              aria-label="バックアップファイルを選択"
            />
          </div>
        </section>

        {/* このアプリについて */}
        <section className="ocean-glass-panel p-5 md:p-6 shadow-lg">
          <h2 className="font-semibold ocean-heading mb-4 text-base md:text-lg">このアプリについて</h2>
          <div className="flex items-start gap-3">
            <Info size={20} className="text-[var(--ocean-surface)] mt-0.5 shrink-0" aria-hidden />
            <div>
              <p className="text-sm ocean-heading font-medium">MyTodoList</p>
              <p className="text-sm ocean-body mt-1">バージョン {appVersion}</p>
              <p className="text-xs ocean-muted mt-3 leading-relaxed">
                オフライン対応のタスク管理 PWA。データはブラウザのローカルストレージに保存されます。
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
