# Codex Pro 任務指示：看板模式 + 生產力統計 + 提醒通知

## 角色
你是本專案的「核心功能開發工程師」，在 IDE 中操作。

## 專案背景
這是一個 React + Vite + TailwindCSS 的 PWA Todo App。套件管理器是 **pnpm**。
目標：超越 Todoist，加入看板視圖、生產力統計儀表板、與瀏覽器提醒通知。

## 目前技術現況
- 資料儲存：`localStorage`，透過 `src/app/utils/storage.ts`（`storage.getTodos()`, `storage.saveTodos()`, `storage.getCategories()`, `storage.saveCategories()`）
- 資料模型 (`src/app/types.ts`)：
```ts
export interface TodoCategory { id: string; name: string; color: string; }
export interface Todo {
  id: string; content: string; date: string; time: string;
  duration?: number; category?: TodoCategory;
  priority?: 'low' | 'medium' | 'high'; tags?: TodoCategory[];
  completed: boolean; createdAt: number; completedAt?: number;
}
```
- 動畫庫：`motion` (Framer Motion)，import 為 `from 'motion/react'`
- 圖標庫：`lucide-react`
- 路由：`react-router` v7 (`createBrowserRouter`)，檔案 `src/app/routes.ts`
- BottomNav：`src/app/components/BottomNav.tsx`，目前 tabs：
  - `{ path: '/my-day', icon: Sun, label: '今日' }`
  - `{ path: '/', icon: CheckSquare, label: 'リスト' }`
  - `{ path: '/calendar', icon: Calendar, label: 'カレンダー' }`
  - `{ path: '/timeline', icon: Clock, label: 'タイムライン' }`
- 現有頁面：TodoList, MyDayPage, CalendarPage, TimelinePage, Archive
- 現有元件：AddTodoDialog, BackgroundAnimation, BottomNav, UpdatePrompt

## 第一步：Git 分支
在你的 IDE Git 工具中：
1. 確保在 `main` 分支
2. 建立並切換到 `codex-pro/feature-kanban-stats-reminder`

## 任務 A：看板模式 (Kanban Board)

### A1. 建立看板頁面 (`src/app/pages/KanbanPage.tsx`)
設計一個三欄式看板：
- **低優先** (bg-green) | **中優先** (bg-yellow) | **高優先** (bg-red)
- 每欄顯示對應 priority 的未完成任務卡片
- 沒有設定 priority 的任務放在「未分類」區（可放在最上方或獨立一欄）
- 每張卡片顯示：content, date, time, category 標籤, tags 標籤
- 卡片可點擊勾選完成（加上 Framer Motion 的退出動畫）
- 每欄頂部顯示該欄任務數量

### A2. 看板頁面頂部統計
在看板頁面最頂部放置一個統計摘要列：
- 總任務數 | 已完成 | 未完成 | 今日到期
- 用圓角卡片 + 數字動畫呈現

### A3. 載入資料
- 使用 `storage.getTodos()` 讀取所有任務
- 使用 `useEffect` + `window.addEventListener('storage')` 監聽變化（與其他頁面同步）

## 任務 B：生產力統計儀表板

### B1. 建立統計頁面 (`src/app/pages/StatsPage.tsx`)
設計一個精緻的生產力儀表板，包含以下區塊：

**B1-1. 今日完成率**
- 環形進度條（顯示今日已完成 / 今日總任務）
- 中間顯示百分比數字
- 用 SVG circle + stroke-dasharray 實作，搭配 Framer Motion 動畫

**B1-2. 本週趨勢**
- 最近 7 天每天完成的任務數量
- 用簡單的 bar chart 呈現（用 div + 動態高度即可，不需要 recharts）
- 標注今天的 bar 為高亮色

**B1-3. 連續天數 (Streak)**
- 計算使用者連續幾天有完成至少一個任務
- 用大數字 + 火焰 emoji 🔥 呈現
- 類似 Todoist 的 Karma 系統

**B1-4. 分類統計**
- 依 category 分組，顯示每個分類的任務數量
- 用水平條形圖呈現，條的顏色對應 category.color

### B2. 資料計算邏輯 (`src/app/utils/statsCalculator.ts`)
```ts
export function calculateStats(todos: Todo[]): {
  todayTotal: number;
  todayCompleted: number;
  todayCompletionRate: number;
  weeklyData: { date: string; count: number }[];
  streak: number;
  categoryBreakdown: { name: string; color: string; count: number }[];
  totalCompleted: number;
};
```
- `todayTotal`：今日 date 的所有任務數
- `todayCompleted`：今日完成的任務數（用 `completedAt` 判斷是否為今天完成）
- `weeklyData`：最近 7 天每天完成的數量
- `streak`：從今天往回數，連續有完成任務的天數
- `categoryBreakdown`：各 category 的未完成任務分佈
- 使用 `getLocalDateString()` from `src/app/utils/date.ts` 來處理日期

## 任務 C：瀏覽器提醒通知

### C1. 建立提醒服務 (`src/app/utils/reminder.ts`)
```ts
export function requestNotificationPermission(): Promise<boolean>;
export function scheduleReminder(todo: Todo): void;
export function cancelReminder(todoId: string): void;
export function initReminderService(): void;
```
- `requestNotificationPermission()`：請求瀏覽器通知權限
- `scheduleReminder()`：根據 todo 的 date + time，計算距離現在的毫秒數，用 `setTimeout` 設定定時通知
- 通知使用 `new Notification(todo.content, { body: '任務到期提醒', icon: '/icon-192x192.png' })`
- `initReminderService()`：應用啟動時呼叫，讀取所有未完成且未過期的任務，為它們設定提醒

### C2. 在 App 啟動時初始化
在 `src/app/App.tsx` 中呼叫 `initReminderService()`。

### C3. 在新增任務時設定提醒
在 `TodoList.tsx` 的 `handleAddTodo` 中，新增任務後呼叫 `scheduleReminder(newTodo)`。

## 任務 D：路由與導覽更新

### D1. 更新路由 (`src/app/routes.ts`)
新增：
```ts
import { KanbanPage } from './pages/KanbanPage';
import { StatsPage } from './pages/StatsPage';
// 在 router 陣列中加入：
{ path: '/kanban', Component: KanbanPage },
{ path: '/stats', Component: StatsPage },
```

### D2. 更新 BottomNav (`src/app/components/BottomNav.tsx`)
新增兩個 tab（從 lucide-react import 對應 icon）：
```ts
import { CheckSquare, Calendar, Clock, Sun, Columns3, BarChart3 } from 'lucide-react';
// tabs 陣列更新為：
{ path: '/my-day', icon: Sun, label: '今日' },
{ path: '/', icon: CheckSquare, label: 'リスト' },
{ path: '/kanban', icon: Columns3, label: '看板' },
{ path: '/calendar', icon: Calendar, label: 'カレンダー' },
{ path: '/stats', icon: BarChart3, label: '統計' },
```
注意：原本的「タイムライン」tab 仍保留在路由中，但從 BottomNav 移除（讓位給更重要的功能，使用者仍可透過 URL 訪問）。

## 任務 E：PM 文件與版本控制

### E1. 撰寫 PM 文件
建立 `PM_Guide/codex_pro_kanban_stats_reminder.md`，記錄：
- KanbanPage 的欄位設計邏輯
- StatsPage 各區塊的計算方式
- Reminder 系統的運作原理
- 修改了哪些檔案
- 路由與導覽的變更

### E2. Git 版本控制
使用 IDE 的 Git 工具，commit 你的所有修改：
```
feat: add kanban board, productivity stats dashboard, and browser reminders
```

## 注意事項
- 不要碰 `AddTodoDialog.tsx`（那是 Claude Pro + Cursor Pro 的範圍）
- 你是唯一負責 `routes.ts` 和 `BottomNav.tsx` 的人
- 所有圖表都用純 CSS/SVG + Framer Motion 實作，不要引入新的圖表庫
- 確保所有 TypeScript 型別正確
- 頁面要有 BackgroundAnimation 和 BottomNav（參考現有頁面的結構）
- 用 `storage.getTodos()` 讀取資料，不要自己讀 localStorage
