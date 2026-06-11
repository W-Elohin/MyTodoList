# Codex Pro 完整開發指示：🌊 海洋等級系統 + Pomodoro 泡泡計時器 + 看板升級

## 角色與權限
你是本專案的「核心功能開發工程師」，在 IDE 中操作。

## 專案技術棧（必讀）
- **框架**：React 19 + TypeScript + Vite 6
- **樣式**：TailwindCSS v4（`@tailwindcss/vite` plugin）
- **動畫**：`motion` (Framer Motion) → import `from 'motion/react'`；**`animejs` v4** → import `from 'animejs'`
- **圖標**：`lucide-react`
- **路由**：`react-router` v7 (`createBrowserRouter`)，檔案 `src/app/routes.ts`
- **套件管理器**：**pnpm**
- **儲存**：localStorage，`src/app/utils/storage.ts`（`storage.getTodos()`, `storage.saveTodos()`）
- **日期工具**：`src/app/utils/date.ts`（`getLocalDateString()`）

## 目前資料模型（`src/app/types.ts`，完整）
```ts
export interface TodoCategory { id: string; name: string; color: string; }
export interface SubTask { id: string; content: string; completed: boolean; }
export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'weekdays' | 'custom';
export interface TodoRecurrence { type: RecurrenceType; interval?: number; daysOfWeek?: number[]; }
export interface Todo {
  id: string; content: string; date: string; time: string;
  duration?: number; category?: TodoCategory;
  priority?: 'low' | 'medium' | 'high'; tags?: TodoCategory[];
  subtasks?: SubTask[]; recurrence?: TodoRecurrence;
  completed: boolean; createdAt: number; completedAt?: number;
}
```

## 目前統計計算（`src/app/utils/statsCalculator.ts`）
已有 `calculateStats(todos)` 函數，回傳：
```ts
{ todayTotal, todayCompleted, todayCompletionRate, weeklyData, streak, categoryBreakdown, totalCompleted }
```

## 設計方向
海洋沉浸式主題。Claude Pro 正在改整體色彩。你需要：
- 所有新建元件的文字使用 `text-sky-50`（主標題）、`text-sky-200`（副文字）、`text-sky-400`（輔助文字）
- 卡片背景：`bg-white/8 backdrop-blur-xl border border-white/15 rounded-2xl`
- 圖表/進度條顏色改為海洋色：`#0ea5e9`（主色）、`#06b6d4`（漸層）、`#f97316`（強調）
- 背景色：別設定，背景由 OceanBackground 元件處理

## Git 設定
1. 確保 main 最新
2. 建立 `codex-pro/feature-ocean-stats-pomodoro`

---

## 任務 1：海洋等級進化系統（StatsPage 大升級）

### 1a. 建立等級計算工具 (`src/app/utils/oceanLevel.ts`)
```ts
export interface OceanLevel {
  name: string;
  emoji: string;
  minTasks: number;
  maxTasks: number; // 到達下一等級所需
  color: string;    // 漸層主色
}

export const OCEAN_LEVELS: OceanLevel[] = [
  { name: 'プランクトン', emoji: '🦠', minTasks: 0, maxTasks: 10, color: '#94a3b8' },
  { name: 'イソギンチャク', emoji: '🪸', minTasks: 11, maxTasks: 30, color: '#f472b6' },
  { name: 'クマノミ', emoji: '🐠', minTasks: 31, maxTasks: 60, color: '#fb923c' },
  { name: 'タツノオトシゴ', emoji: '🐡', minTasks: 61, maxTasks: 100, color: '#a78bfa' },
  { name: 'イルカ', emoji: '🐬', minTasks: 101, maxTasks: 200, color: '#38bdf8' },
  { name: 'クジラ', emoji: '🐋', minTasks: 201, maxTasks: 500, color: '#2dd4bf' },
  { name: '海の王者', emoji: '🔱', minTasks: 501, maxTasks: Infinity, color: '#fbbf24' },
];

export function getCurrentLevel(totalCompleted: number): OceanLevel;
export function getLevelProgress(totalCompleted: number): number; // 0-100, 到下一等級的進度
export function getNextLevel(totalCompleted: number): OceanLevel | null;
```

### 1b. 等級卡片元件（新增到 StatsPage 最頂部）
在 StatsPage 的標題下方、現有統計上方，加入一個大型等級展示卡：
- 上半部：大 emoji（用 anime.js 做 `scale` 呼吸動畫 0.9 ↔ 1.1, duration 3s, loop）
- 等級名稱：`text-2xl font-bold`，用等級對應的 `color`
- 進度條到下一等級：
  - 外框：`h-3 rounded-full bg-white/10 overflow-hidden`
  - 填充：`bg-gradient-to-r` 從當前等級色到下一等級色
  - 用 Framer Motion `animate={{ width: '${progress}%' }}`
  - 下方文字：`あと ${remaining} 件で ${nextLevel.name} に進化！`，`text-xs text-sky-400`
- 若已到最高等級：顯示 `🎉 最高ランク達成！` + 金色閃爍動畫（anime.js `opacity` loop）
- 累計完成數：`累計 ${totalCompleted} 件完了`

### 1c. 成就徽章系統
建立 `src/app/components/AchievementBadges.tsx`：

定義 6 個成就：
```ts
const ACHIEVEMENTS = [
  { id: 'first_task', name: '初めての一歩', emoji: '🐚', desc: '最初のタスクを完了', condition: (stats) => stats.totalCompleted >= 1 },
  { id: 'streak_3', name: '三日坊主卒業', emoji: '🌊', desc: '3日連続で達成', condition: (stats) => stats.streak >= 3 },
  { id: 'streak_7', name: '波乗りマスター', emoji: '🏄', desc: '7日連続で達成', condition: (stats) => stats.streak >= 7 },
  { id: 'total_50', name: '深海探検家', emoji: '🤿', desc: '50件のタスクを完了', condition: (stats) => stats.totalCompleted >= 50 },
  { id: 'total_100', name: '百戦錬磨', emoji: '⚓', desc: '100件のタスクを完了', condition: (stats) => stats.totalCompleted >= 100 },
  { id: 'total_500', name: '海の伝説', emoji: '🧜', desc: '500件のタスクを完了', condition: (stats) => stats.totalCompleted >= 500 },
];
```

- 用 CSS grid `grid-cols-3 gap-3` 排列
- 每個徽章是一個 glassmorphism 小卡（`bg-white/8 backdrop-blur border border-white/15 rounded-xl p-3`）
- **已解鎖**：emoji 正常顯示 + 名稱 `text-sky-100` + 描述 `text-sky-400 text-xs`
- **未解鎖**：emoji 改為 `🔒`，整個卡片 `opacity-40`，名稱顯示 `???`
- 徽章入場用 Framer Motion stagger 動畫（每張延遲 0.08s）

### 1d. 整合到 StatsPage
在 StatsPage 中加入以上兩個區塊。順序：
1. 標題 `統計`
2. 🆕 等級卡片
3. 🆕 成就徽章
4. 今日完成率（已有）
5. 連續天數（已有）
6. 本週トレンド（已有）
7. 分類統計（已有）

同時更新現有區塊的顏色：
- 圓形進度條 stroke 改為 `#0ea5e9`，track 改為 `rgba(255,255,255,0.1)`
- bar chart bar 色：today `#0ea5e9`，others `rgba(255,255,255,0.15)`
- 所有 `text-gray-*` 改為 `text-sky-*`
- 所有 `bg-white/75` 改為 `bg-white/8 backdrop-blur-xl border border-white/15`

---

## 任務 2：Pomodoro 泡泡計時器

### 2a. 建立元件 (`src/app/components/PomodoroTimer.tsx`)

**外觀設計**：
- 固定定位 `fixed bottom-24 right-6`（在 FAB 按鈕上方）
- 預設狀態：一個 48x48 的圓形按鈕（像一個氣泡），`bg-white/10 backdrop-blur-xl border border-white/20`
- 按鈕內顯示 lucide-react 的 `Timer` icon（`text-sky-300`）
- 點擊展開為完整計時器面板

**展開面板**：
- 大小約 200x260px，`bg-[#0a1628]/90 backdrop-blur-2xl border border-white/15 rounded-3xl`
- 用 Framer Motion `AnimatePresence` + `scale(0) → scale(1)` 從按鈕位置展開
- 面板內容（從上到下）：
  1. 標題列：「🍅 ポモドーロ」+ 關閉按鈕（X icon）
  2. 圓形計時器（SVG circle，半徑 70px）：
     - Track 色：`rgba(255,255,255,0.1)`
     - 工作模式填充：`#0ea5e9`（海洋藍）
     - 休息模式填充：`#10b981`（海藻綠）
     - 圓圈內顯示剩餘時間 `mm:ss`，`text-3xl font-bold text-sky-50`
  3. 狀態文字：`作業中` 或 `休憩中`，`text-sm text-sky-300`
  4. 按鈕列（水平排列 3 個按鈕）：
     - ▶️ 開始 / ⏸️ 暫停（toggle）
     - ⏹️ 重置
     - ⏭️ 跳過（直接進入下一階段）
  5. 設定區：工作時間（預設 25min）/ 休息時間（預設 5min）可調整

**核心邏輯**：
```ts
const [mode, setMode] = useState<'work' | 'break'>('work');
const [timeLeft, setTimeLeft] = useState(25 * 60); // seconds
const [isRunning, setIsRunning] = useState(false);
const [isExpanded, setIsExpanded] = useState(false);
const [workDuration, setWorkDuration] = useState(25);
const [breakDuration, setBreakDuration] = useState(5);
```
- 用 `useEffect` + `setInterval(1000ms)` 倒計時
- 倒計時結束時：
  1. 用 `new Notification('ポモドーロ完了！', { body: mode === 'work' ? '休憩しましょう' : '作業を再開しましょう' })` 發送通知
  2. 用 anime.js 做泡泡爆裂動畫：圓形計時器的 border 快速放大到 3 倍然後消失
  3. 自動切換 work ↔ break 模式
- 最小化狀態（收合後）：小圓形按鈕上顯示剩餘時間的百分比（用 SVG 小圓形進度指示）

### 2b. 整合到 App
在 `src/app/App.tsx` 中加入 `<PomodoroTimer />`（放在 `<Toaster />` 旁邊），讓它在所有頁面都能使用。

---

## 任務 3：看板頁面大升級 (`src/app/pages/KanbanPage.tsx`)

### 3a. 看板欄位顏色改為海洋風
更新 `columns` 陣列：
```ts
const columns: PriorityColumn[] = [
  { key: 'uncategorized', title: '未分類', tone: 'bg-white/5', badge: 'bg-sky-400' },
  { key: 'low', title: '低', tone: 'bg-emerald-500/10', badge: 'bg-emerald-400' },
  { key: 'medium', title: '中', tone: 'bg-amber-500/10', badge: 'bg-amber-400' },
  { key: 'high', title: '高', tone: 'bg-rose-500/10', badge: 'bg-rose-400' },
];
```

### 3b. 卡片入場交錯動畫
用 anime.js 做每張卡片的入場動畫（代替目前的 Framer Motion delay）：
```ts
useEffect(() => {
  anime({
    targets: '.kanban-card',
    translateY: [30, 0],
    opacity: [0, 1],
    delay: anime.stagger(80),
    duration: 600,
    easing: 'easeOutCubic',
  });
}, [activeTodos]);
```
- 在每張卡片上加 `className="kanban-card"`

### 3c. 完成動畫改為氣泡飄走
目前卡片完成的 exit 是 `opacity: 0, scale: 0.94, x: 24`。改為更有趣的「氣泡飄走」：
```tsx
exit={{ opacity: 0, y: -80, scale: 0.6, rotate: anime.random(-10, 10) }}
transition={{ duration: 0.5, ease: 'easeInOut' }}
```
（注意：anime.random 不能用在 Framer Motion 中，改用 `Math.random() * 20 - 10`）

### 3d. 摘要統計卡片改為海洋風
更新頂部四張統計卡：
- 背景：`bg-white/8 backdrop-blur-xl border border-white/15 rounded-2xl`（刪除 `bg-white/75`）
- 標籤文字：`text-sky-300`（替換 `text-gray-500`）
- 數字文字：`text-sky-50`（替換 `text-gray-800`）
- 中文標籤改為日文：`總任務數`→`全タスク`, `已完成`→`完了`, `未完成`→`未完了`, `今日到期`→`今日期限`

### 3e. 每欄加入快速新增按鈕
在每欄底部加一個小按鈕：
```tsx
<button className="w-full py-2 mt-2 rounded-xl bg-white/5 border border-dashed border-white/15 text-sky-400 text-xs hover:bg-white/10 transition-all">
  + タスクを追加
</button>
```
點擊後可直接在欄位底部出現一個 inline 輸入框（不是彈出 Dialog），按 Enter 建立新任務，priority 自動設為該欄對應的值。

### 3f. 卡片拖拽排序提示
（不需要實作真正的拖拽，但要有視覺暗示）
- 每張卡片左邊加一個 `GripVertical` icon（6 dots），`text-sky-500/30`
- Hover 時 icon 變為 `text-sky-400`

---

## 任務 4：PM 文件

建立 `PM_Guide/codex_pro_ocean_stats_pomodoro.md`，記錄：
- 海洋等級系統的 7 個等級定義和計算邏輯
- 6 個成就徽章的解鎖條件
- Pomodoro 計時器的狀態機（work → break → work 循環）
- 看板頁面的改動細節（顏色、動畫、快速新增）
- 修改和新增了哪些檔案

---

## 任務 5：Git 版本控制
```
git add .
git commit -m "feat: add ocean level system, achievement badges, Pomodoro timer, and kanban upgrades"
```

## ⚠️ 注意事項
- **不要改** `AddTodoDialog.tsx`（Cursor Pro 正在改）
- **不要改** `BackgroundAnimation.tsx`（Claude Pro 正在改）
- **不要改** `SearchBar.tsx`、`FilterChips.tsx`（Claude Pro 負責）
- **可以改** `StatsPage.tsx`（你是唯一改它的人）
- **可以改** `KanbanPage.tsx`（你是唯一改它的人）
- **可以改** `App.tsx`（加入 PomodoroTimer）
- `statsCalculator.ts` 的 `calculateStats` 回傳值已足夠，如需新欄位可自行新增但不要刪除現有欄位
- 確保 TypeScript 型別正確，`pnpm run build` 通過
