# Claude Pro 完整開發指示：🌊 海洋沉浸式主題系統 + 動態背景引擎

## 角色與權限
你是本專案的「主題系統與動畫引擎工程師」，擁有 Terminal 操作權限（可執行 shell 指令）。

## 專案技術棧（必讀）
- **框架**：React 19 + TypeScript + Vite 6
- **樣式**：TailwindCSS v4（`@tailwindcss/vite` plugin）
- **動畫**：`motion` (Framer Motion) → import `from 'motion/react'`；**`animejs` v4** → import `from 'animejs'`
- **圖標**：`lucide-react`（已安裝）
- **路由**：`react-router` v7 (`createBrowserRouter`)
- **套件管理器**：**pnpm**
- **儲存**：localStorage，透過 `src/app/utils/storage.ts`

## 目前資料模型（`src/app/types.ts`）
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

## 目前檔案清單（你需要改動的）
- `src/app/components/BackgroundAnimation.tsx` — 現在是 3 個 Framer Motion 的模糊圓形，**要完全重寫為海洋動態背景**
- `src/app/components/BottomNav.tsx` — 底部導覽列，目前米色 `#f4f0ed` 背景
- `src/app/components/SearchBar.tsx` — 搜尋欄，目前 `bg-white/80`
- `src/app/components/FilterChips.tsx` — 篩選按鈕，目前 `bg-white/70`
- `src/app/components/AddTodoDialog.tsx` — 新增/編輯對話框，目前 `bg-[#f4f0ed]`
- `src/app/components/SubTaskList.tsx` — 子任務清單
- `src/app/pages/TodoList.tsx` — 列表頁，`style={{ backgroundColor: '#F4F0ED' }}`，卡片 `bg-white`
- `src/app/pages/MyDayPage.tsx` — 今日頁，同上背景
- `src/app/pages/CalendarPage.tsx` — 日曆頁
- `src/app/pages/KanbanPage.tsx` — 看板頁，卡片 `bg-white`，欄位 `bg-gray-100/bg-green-50/bg-yellow-50/bg-red-50`
- `src/app/pages/StatsPage.tsx` — 統計頁，圖表顏色 `#2A89C6`, `#B5A89E`, `#EEE7E2`
- `src/app/pages/TimelinePage.tsx` — 時間軸頁
- `src/app/pages/Archive.tsx` — 封存頁
- `src/styles/index.css` — 全局樣式

## 第一步：Git 設定
```bash
cd /Users/ne/Desktop/Projects/MyTodoList
git checkout main && git pull
git checkout -b claude-pro/feature-ocean-theme
```

---

## 任務 1：建立海洋色彩 CSS 變數系統（`src/styles/index.css`）

在現有 CSS 中新增全局 CSS 變數。**不要刪除現有的 TailwindCSS import**，只新增內容。

```css
:root {
  /* 海洋主色板 */
  --ocean-deep: #0a1628;
  --ocean-mid: #1e3a5f;
  --ocean-surface: #0ea5e9;
  --ocean-light: #38bdf8;
  --ocean-foam: #bae6fd;
  --ocean-pearl: #f0f9ff;
  
  /* 珊瑚暖色（用於強調、CTA、priority high） */
  --coral: #f97316;
  --coral-light: #fdba74;
  
  /* 海藻綠（用於 success、priority low） */
  --seaweed: #10b981;
  --seaweed-light: #6ee7b7;
  
  /* 功能色 */
  --glass-bg: rgba(255, 255, 255, 0.08);
  --glass-bg-hover: rgba(255, 255, 255, 0.14);
  --glass-border: rgba(255, 255, 255, 0.15);
  --glass-border-hover: rgba(255, 255, 255, 0.25);
  
  /* 文字 */
  --text-primary: #f0f9ff;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
}
```

同時加入 glassmorphism 工具 class：
```css
.glass-card {
  background: var(--glass-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid var(--glass-border);
  border-radius: 1rem;
}
.glass-card:hover {
  background: var(--glass-bg-hover);
  border-color: var(--glass-border-hover);
}
```

---

## 任務 2：海洋動態背景（完全重寫 `src/app/components/BackgroundAnimation.tsx` → 改名為 `OceanBackground.tsx`）

建立一個新元件 `src/app/components/OceanBackground.tsx`，同時保留舊的 `BackgroundAnimation.tsx` 作為 re-export（`export { OceanBackground as BackgroundAnimation } from './OceanBackground'`），讓其他頁面不用改 import。

**OceanBackground 必須包含以下動態效果，全部用 anime.js + CSS 實作：**

### 2a. 深海漸層背景
- 使用 `linear-gradient(180deg, var(--ocean-deep) 0%, var(--ocean-mid) 40%, #0c4a6e 70%, var(--ocean-surface) 100%)`
- 佔滿整個 `fixed inset-0`，`z-index: -10`，`pointer-events: none`

### 2b. 動態海浪（3 層 SVG wave）
- 用 3 個 `<svg>` 畫正弦波，疊加在背景底部
- 第 1 層：最慢（12s），透明度 0.3，深藍色
- 第 2 層：中速（8s），透明度 0.2，藍綠色
- 第 3 層：最快（6s），透明度 0.15，淺藍色
- 每層用 anime.js 動畫 `translateX` 做水平循環（左→右反覆）
- anime.js 使用方式：
```ts
import anime from 'animejs';
// 在 useEffect 中：
anime({
  targets: waveRef.current,
  translateX: [0, -200],
  duration: 12000,
  easing: 'linear',
  loop: true,
});
```

### 2c. 浮動氣泡（15-20 顆）
- 用 `<div>` 建立 15-20 個圓形氣泡，半徑隨機 2-8px
- 初始位置隨機分佈在畫面下半部
- 用 anime.js 做向上浮動動畫，到達頂部後消失，然後從底部重新出現
- 每個氣泡有微微的左右搖擺（用 `translateX` 加正弦偏移）
- 透明度 0.1-0.3，白色或淺藍色
- anime.js stagger 用法：
```ts
anime({
  targets: '.bubble',
  translateY: [() => anime.random(600, 800), () => anime.random(-100, -200)],
  translateX: () => anime.random(-30, 30),
  opacity: [{ value: 0.3, duration: 300 }, { value: 0, duration: 300, delay: anime.stagger(200) }],
  duration: () => anime.random(8000, 15000),
  delay: anime.stagger(500),
  loop: true,
  easing: 'easeInOutSine',
});
```

### 2d. 光線效果
- 2-3 條斜向光束，從左上角射入水中
- 用 `<div>` + CSS `linear-gradient` + `transform: rotate(30deg)` 模擬
- 用 anime.js 做透明度呼吸效果（0.03 ↔ 0.08，duration 6-10s）

---

## 任務 3：更新所有頁面的背景和卡片樣式

### 通用規則：
- **所有** `style={{ backgroundColor: '#F4F0ED' }}` 改為 `style={{ background: 'linear-gradient(180deg, #0a1628 0%, #1e3a5f 50%, #0c4a6e 100%)' }}`
- **所有** `bg-white` 卡片改為 `glass-card` class（使用你在 index.css 定義的）
- **所有** `text-gray-800` 改為 `text-sky-50` 或 `text-white`
- **所有** `text-gray-500/600/700` 改為 `text-sky-200` 或 `text-sky-300`
- **所有** `text-gray-400` 改為 `text-sky-400`
- **所有** `bg-gray-100` 改為 `bg-white/10`
- **所有** `shadow-lg` 改為 `shadow-lg shadow-black/20`
- **所有** `border-gray-200` 改為 `border-white/15`

### 每個檔案的具體改動：

**TodoList.tsx**：
- 頁面背景改為海洋漸層
- `<h1>` 標題文字改為 `text-sky-50`
- Archive 按鈕改為 `bg-white/10 backdrop-blur-sm` + `text-sky-200`
- 任務卡片改為 `glass-card`（刪除 `bg-white`）
- 優先度標籤保留彩色（red/yellow/green），但外觀改為半透明
- FAB 按鈕改為 `bg-white/10 backdrop-blur-xl border border-white/20`

**MyDayPage.tsx**：
- 同上背景、卡片、文字規則
- Sun icon 保留黃色

**CalendarPage.tsx**：
- 日曆表格改為 glassmorphism 背景
- 日期數字改為 `text-sky-100`
- 今日高亮用 `bg-sky-500/30 border border-sky-400/50`
- 星期標題用 `text-sky-300`

**KanbanPage.tsx**：
- 四欄的背景色改為半透明：
  - 未分類：`bg-white/5`
  - 低優先：`bg-emerald-500/10`
  - 中優先：`bg-amber-500/10`
  - 高優先：`bg-red-500/10`
- 欄位內的任務卡片：`glass-card`
- 摘要統計卡片：`glass-card`
- 中文文字改為日文：`總任務數`→`全タスク`, `已完成`→`完了`, `未完成`→`未完了`, `今日到期`→`今日期限`, `低優先`→`低`, `中優先`→`中`, `高優先`→`高`, `未分類`→`未分類`（此已為日文）

**StatsPage.tsx**：
- 圓形進度條的 track 色改為 `rgba(255,255,255,0.1)`，填充色改為 `var(--ocean-surface)` (`#0ea5e9`)
- bar chart 的 bar 色改為 `#0ea5e9`（today）和 `rgba(255,255,255,0.2)`（other days）
- 連續天數的 🔥 保留，文字改為淺色
- 分類統計的 track 色改為 `rgba(255,255,255,0.1)`

**Archive.tsx / TimelinePage.tsx**：
- 同樣套用海洋背景 + glassmorphism 規則

---

## 任務 4：BottomNav 大改造

更新 `src/app/components/BottomNav.tsx`：
- 外層容器：`bg-[#0a1628]/80 backdrop-blur-xl border-t border-white/10`（刪除 `bg-[#f4f0edcc]` 和 `bg-[#f4f0ed]`）
- icon 預設色：`text-sky-400`
- active icon 色：`text-sky-100`
- active label 色：`text-sky-100`
- inactive label 色：`text-sky-500`
- active 背景泡泡：`bg-sky-500/20 rounded-xl`（替換現有的白色方塊）

---

## 任務 5：SearchBar + FilterChips 改造

**SearchBar.tsx**：
- 容器改為 `bg-white/8 backdrop-blur-md border border-white/15`（刪除 `bg-white/80`）
- 輸入文字顏色：`text-sky-50`
- placeholder 顏色：`text-sky-400`
- Search icon：`text-sky-400`
- 清除按鈕：`hover:bg-white/10 text-sky-400`

**FilterChips.tsx**：
- 非 active chip：`bg-white/8 text-sky-300 border-white/15`（替換 `bg-white/70 text-gray-600 border-gray-200`）
- active chip 保留 `backgroundColor` 不變（色彩保留）

---

## 任務 6：AddTodoDialog 改造

- 對話框背景：`bg-[#0a1628]/95 backdrop-blur-2xl border border-white/15`（替換 `bg-[#f4f0ed]`）
- 標題文字：`text-sky-50`（替換 `text-gray-800`）
- label 文字：`text-sky-200`（替換 `text-gray-700`）
- 輸入框：`bg-white/8 border-white/15 text-sky-50 placeholder:text-sky-500`（替換所有 `border-gray-200 text-gray-800`）
- 提交按鈕保留藍色 `#2A89C6`

---

## 任務 7：PM 文件

建立 `PM_Guide/claude_pro_ocean_theme.md`，記錄：
- 海洋色彩系統的所有 CSS 變數值
- OceanBackground 的 3 個動畫層級（波浪、氣泡、光線）
- 修改了哪些檔案、哪些 class
- anime.js 在本專案中的使用方式

---

## 任務 8：Git 版本控制
```bash
git add .
git commit -m "feat: implement immersive ocean theme with anime.js dynamic background, glassmorphism cards, and unified color system"
```

## ⚠️ 注意事項
- **不要改動** `routes.ts`（路由結構）
- **不要改動** 任何業務邏輯（handleAddTodo, handleToggleComplete 等函數不要碰）
- **不要刪除** 任何現有功能
- 確保 `pnpm run build` 通過
- 舊的 `BackgroundAnimation` 匯出保留，讓其他頁面的 import 不會壞
