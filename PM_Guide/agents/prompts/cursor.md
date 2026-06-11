# Cursor Pro 完整開發指示：🌊 海洋 UI 插畫 + 表單大改造 + 今日頁情境化 + 微互動動畫

## 角色與權限
你是本專案的「前端 UX/UI 工程師」，在 Cursor IDE 中操作。

## 專案技術棧（必讀）
- **框架**：React 19 + TypeScript + Vite 6
- **樣式**：TailwindCSS v4（`@tailwindcss/vite` plugin）
- **動畫**：`motion` (Framer Motion) → import `from 'motion/react'`；**`animejs` v4** → import `from 'animejs'`
- **圖標**：`lucide-react`
- **Toast 通知**：`sonner`（已在 App.tsx 中 `<Toaster />`）
- **路由**：`react-router` v7 (`createBrowserRouter`)
- **套件管理器**：**pnpm**

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

## 設計方向
整個 App 正在改為「海洋沉浸式主題」（由 Claude Pro 負責背景和色彩）。你的工作是在這個海洋世界中加入**可愛的生物插畫**和**極致的微互動體驗**。

**海洋色彩（Claude Pro 會建立，你可以直接使用這些 CSS 變數）：**
- `--ocean-deep: #0a1628` / `--ocean-mid: #1e3a5f` / `--ocean-surface: #0ea5e9`
- `--coral: #f97316` / `--seaweed: #10b981`
- `--glass-bg: rgba(255,255,255,0.08)` / `--glass-border: rgba(255,255,255,0.15)`
- `--text-primary: #f0f9ff` / `--text-secondary: #94a3b8`

**若 Claude Pro 的 CSS 變數尚未建立，請直接 hardcode 上述顏色值，合併時不會衝突。**

## Git 設定
1. 確保在 `main` 分支，`git pull` 更新
2. 建立 `cursor-pro/feature-ocean-ui-polish`

---

## 任務 1：海洋生物 SVG 插畫元件集（新建）

建立 `src/app/components/illustrations/` 資料夾，在裡面建立以下純 JSX/SVG 插畫元件。**每個都必須是可愛的卡通風格，用 SVG path 手繪，不要用外部圖片**。每個元件都要用 anime.js 加上微妙的活物動畫。

### 1a. `OctopusIllustration.tsx` — 章魚（用於 TodoList 空狀態）
- 一隻可愛的卡通章魚，坐在海底的石頭上
- 8 條觸手用 SVG path 繪製，排列在身體兩側
- 顏色：身體 `#c084fc`（紫色），吸盤 `#f9a8d4`（粉色）
- 兩個大眼睛，有反光點（白色小圓）
- **anime.js 動畫**：
  - 觸手 1-4 號用 anime.js 做緩慢的 `rotate` 搖擺（±5deg, duration 3s, easing 'easeInOutSine', loop）
  - 觸手 5-8 號同樣搖擺，但 delay 不同（stagger 200ms），形成自然的水中飄動感
  - 身體整體做微微的 `translateY` 上下浮動（±3px, duration 4s, loop）
  - 眼睛的反光點做 `opacity` 呼吸閃爍（0.6 ↔ 1.0, duration 2s, loop）
- 尺寸：寬 200px，高 200px

### 1b. `TurtleIllustration.tsx` — 海龜（用於 MyDayPage 空狀態）
- 一隻可愛的綠色海龜，側面視角，正在悠閒游泳
- 龜殼用六角形花紋裝飾，顏色 `#10b981`（綠）+ `#059669`（深綠）
- 四肢為鰭狀，嘴巴微笑
- **anime.js 動畫**：
  - 整體做 `translateX` 微移（±10px, duration 6s, loop）模擬游泳
  - 前鰭做 `rotate` 擺動（±15deg, duration 1.5s, loop）模擬划水
  - 後鰭同樣但反向（delay 300ms）
  - 身體微微 `rotate`（±2deg, duration 5s, loop）模擬水流
- 尺寸：寬 220px，高 160px

### 1c. `CrabIllustration.tsx` — 螃蟹（用於 KanbanPage 空狀態）
- 一隻橘紅色螃蟹，舉著兩隻大鉗子
- 身體圓形，顏色 `#f97316`（橙）
- 兩隻鉗子上方各舉著一個小型空白看板（白色方塊）
- 8 條腿，4 條在左邊，4 條在右邊
- **anime.js 動畫**：
  - 左鉗子做 `rotate` 開合（0deg ↔ -20deg, duration 1s, loop, direction: 'alternate'）
  - 右鉗子同樣（方向相反）
  - 腿用 stagger 做微動
  - 眼睛（兩根柄）做 `translateY` 伸縮
- 尺寸：寬 200px，高 180px

### 1d. `WhaleIllustration.tsx` — 鯨魚噴水（用於 CalendarPage 空狀態）
- 一隻可愛的藍色鯨魚，正面 45 度角
- 頭頂噴出 3 個水滴（淺藍色圓形）
- 身體 `#3b82f6`（藍），肚子 `#bae6fd`（淺藍）
- 微笑的嘴巴，一個小眼睛帶反光
- **anime.js 動畫**：
  - 水滴向上噴出：`translateY` 從 0 到 -40px，`opacity` 1 → 0，duration 2s，loop，stagger 400ms
  - 身體 `translateY` 上下浮動（±5px, duration 4s, loop）
  - 尾巴 `rotate` 搖擺（±8deg, duration 2s, loop）
- 尺寸：寬 200px，高 200px

### 1e. `EmptyStateWrapper.tsx` — 空狀態統一容器
一個通用容器元件：
```tsx
interface Props {
  illustration: React.ReactNode;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}
```
- 垂直置中排列：插畫 → 標題 → 副標題 → 按鈕
- 標題：`text-lg font-semibold text-sky-200`
- 副標題：`text-sm text-sky-400 mt-2`
- 按鈕（若提供）：圓角、`bg-sky-500/20 border border-sky-400/30 text-sky-200 hover:bg-sky-500/30`
- 整體容器用 Framer Motion `initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}`

---

## 任務 2：在各頁面整合空狀態插畫

### 2a. TodoList 空狀態（`src/app/pages/TodoList.tsx`）
找到目前的空狀態區塊（約第 218-232 行）：
```tsx
{filteredTodos.length === 0 ? (
  <motion.div className="text-center py-16 text-gray-400">
    <p className="text-lg">{todos.length === 0 ? 'ToDoがありません' : '該当するToDoがありません'}</p>
    ...
  </motion.div>
```
替換為：
```tsx
{filteredTodos.length === 0 ? (
  <EmptyStateWrapper
    illustration={<OctopusIllustration />}
    title={todos.length === 0 ? 'タスクがまだありません' : '該当するタスクがありません'}
    subtitle={todos.length === 0 ? '下の＋ボタンから追加してみましょう！' : '検索条件を変更してください'}
  />
```

### 2b. MyDayPage 空狀態（`src/app/pages/MyDayPage.tsx`，約第 124-132 行）
替換為 `<EmptyStateWrapper illustration={<TurtleIllustration />} title="今日のタスクはありません" subtitle="のんびりしましょう！" />`

### 2c. KanbanPage 欄位空狀態（`src/app/pages/KanbanPage.tsx`，約第 144-152 行）
替換每欄的空狀態為 `<CrabIllustration />` 的小型版（用 CSS `scale(0.5)` 縮小）

### 2d. CalendarPage（`src/app/pages/CalendarPage.tsx`）
找到日曆下方的任務列表空狀態，用 `<WhaleIllustration />` 替換

---

## 任務 3：AddTodoDialog 表單大改造

**問題**：目前的 `AddTodoDialog.tsx`（366 行）表單太長，需要大量捲動。用戶在手機上幾乎無法看到提交按鈕。

**解決方案**：改為「核心 + 展開式附加欄位」設計。

### 3a. 重構表單佈局
主表單只顯示 3 個核心欄位：
1. **内容** textarea（保持不變）
2. **日付 + 時間** 並排在同一行
3. **提交按鈕**（保持不變）

### 3b. 附加欄位工具列
在 textarea 和日期之間，加入一排水平 icon 按鈕（像訊息 App 的附加功能列）：

```tsx
const toolbarItems = [
  { icon: Clock, label: '所要時間', key: 'duration' },
  { icon: Folder, label: 'カテゴリー', key: 'category' },
  { icon: Flag, label: '優先度', key: 'priority' },
  { icon: Tag, label: 'タグ', key: 'tags' },
  { icon: Repeat, label: '繰り返し', key: 'recurrence' },
  { icon: ListChecks, label: 'サブタスク', key: 'subtasks' },
];
```

- 每個 icon 按鈕大小 36x36px，圓角
- 未選中：`bg-white/10 text-sky-300`（配合海洋主題）
- 選中（已設定值）：`bg-sky-500/20 text-sky-100 ring-1 ring-sky-400/30`
- 點擊時展開對應的欄位區塊（同一時間只展開一個），用 Framer Motion `AnimatePresence` + `height: auto` 動畫
- 收合時自動關閉

### 3c. 每個展開區塊的配置
- **duration**：保持現有的 -/+/數字 UI，但縮小間距
- **category**：保持現有的彩色按鈕選擇 + 新增功能
- **priority**：保持 高/中/低 三個按鈕
- **tags**：保持現有的 tag pills
- **recurrence**：保持現有的重複選擇
- **subtasks**：保持現有的 SubTaskList

### 3d. 表單背景適配海洋主題
- Dialog 背景可能已由 Claude Pro 改，但若未改：`bg-[#0a1628]/95 backdrop-blur-2xl`
- 輸入框：`bg-white/8 border-white/15 text-sky-50`

---

## 任務 4：今日頁情境化設計（`src/app/pages/MyDayPage.tsx`）

### 4a. 時段問候語系統
在頁面標題區域加入動態問候語，根據 `new Date().getHours()` 判斷：

```ts
function getGreeting(): { emoji: string; text: string; sub: string } {
  const h = new Date().getHours();
  if (h >= 6 && h < 12) return { emoji: '🌅', text: 'おはようございます', sub: '新しい一日の始まり！' };
  if (h >= 12 && h < 18) return { emoji: '🌊', text: 'お疲れ様です', sub: '午後も頑張りましょう！' };
  if (h >= 18 && h < 24) return { emoji: '🌙', text: 'お疲れ様でした', sub: '今日もよく頑張りました' };
  return { emoji: '🐙', text: '夜更かしですか？', sub: '早めに休みましょう' };
}
```

- emoji 用 anime.js 做微微的 `scale` 呼吸動畫（0.9 ↔ 1.1, duration 3s, loop）
- 問候文字用 `text-2xl font-bold text-sky-50`
- 副文字用 `text-sm text-sky-300`
- 替換目前的 `<Sun size={32}>` icon 和 `今日` 標題

### 4b. 今日進度條
在問候語下方、任務列表上方加入進度資訊：

```tsx
const todayAll = storage.getTodos().filter(t => t.date === getLocalDateString());
const todayCompleted = todayAll.filter(t => t.completed).length;
const todayTotal = todayAll.length;
const progress = todayTotal > 0 ? (todayCompleted / todayTotal) * 100 : 0;
```

- 外觀：glassmorphism 卡片，水平排列：文字 + 進度條 + 百分比
- 文字：`今日の進捗 ${todayCompleted}/${todayTotal}`，`text-sm text-sky-200`
- 進度條：`h-2 rounded-full bg-white/10`，填充 `bg-gradient-to-r from-sky-500 to-emerald-400`
- 百分比用 Framer Motion 的 `animate={{ width: '${progress}%' }}` 動畫
- 若沒有今日任務：隱藏進度條，只顯示「まだ予定がありません」

---

## 任務 5：任務卡片微互動動畫

在 `TodoList.tsx` 的任務卡片中加入更豐富的互動：

### 5a. Hover 效果
- 卡片 hover 時：`translateY: -2px` + `border-color` 從 `white/15` 變為 `white/25`
- 用 Framer Motion `whileHover` 實作

### 5b. 完成按鈕動畫
目前的完成按鈕（圓形 checkbox）太簡單。改為：
- Hover 時：圓形內出現淡淡的 checkmark 預覽（opacity 0.3）
- 點擊後：圓形填充為 `bg-sky-400` + checkmark 用 SVG stroke-dasharray 動畫「畫出」
- 同時卡片向右滑出（已有 `exit={{ opacity: 0, x: -100 }}`，保留即可）

### 5c. 刪除按鈕確認
目前點擊刪除按鈕直接刪除，沒有確認。改為：
- 第一次點擊：按鈕變紅 + 出現「削除？」文字（2 秒後自動還原）
- 第二次點擊（2 秒內）：執行刪除
- 用 `useState` + `setTimeout` 管理狀態

---

## 任務 6：PM 文件

建立 `PM_Guide/cursor_pro_ocean_ui.md`，記錄：
- 4 個海洋生物 SVG 插畫的設計理念和 anime.js 動畫參數
- AddTodoDialog 表單改造前後的 UX 差異
- 今日頁的問候語邏輯和進度條設計
- 微互動動畫的設計細節（hover、完成、刪除確認）
- 修改和新增了哪些檔案

---

## 任務 7：Git 版本控制
```
git add .
git commit -m "feat: add ocean SVG illustrations, redesign AddTodoDialog, contextual greetings, micro-interactions"
```

## ⚠️ 注意事項
- **不要改** `routes.ts`、`BottomNav.tsx`（Claude Pro 負責）
- **不要改** `BackgroundAnimation.tsx`（Claude Pro 會改為 OceanBackground）
- **不要改** `storage.ts`、`statsCalculator.ts`、業務邏輯函數
- 若引入新的 lucide-react icon（如 `Flag`, `Tag`, `ListChecks`, `Repeat`），直接從 lucide-react import 即可
- 所有新元件放在 `src/app/components/` 或其子資料夾
- 確保 TypeScript 型別正確，`pnpm run build` 通過
