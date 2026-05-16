# Cursor Pro 任務指示：語音 UI/UX + 繰り返し任務 + 搜尋/篩選

## 角色
你是本專案的「前端 UI/UX 工程師」，在 IDE 中操作。

## 專案背景
這是一個 React + Vite + TailwindCSS 的 PWA Todo App。套件管理器是 **pnpm**。
目標：超越 Todoist 的介面質感，加入語音 UI 動效、重複任務、全局搜尋與篩選。

## 目前技術現況
- 資料儲存：`localStorage`，透過 `src/app/utils/storage.ts`
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
- 路由：`react-router` v7 (`createBrowserRouter`)
- 目前路由：`/`, `/my-day`, `/calendar`, `/timeline`, `/archive`
- BottomNav tabs：今日(Sun) / リスト(CheckSquare) / カレンダー(Calendar) / タイムライン(Clock)
- 新增/編輯 Dialog：`src/app/components/AddTodoDialog.tsx`
  - 目前已有 content, date, time, duration, category, priority, tags 欄位
  - 目前已有 `useWhisper` 的 import（由 Claude Pro 開發），提供 `isReady`, `isRecording`, `isProcessing`, `transcript`, `error`, `startRecording()`, `stopRecording()`, `setTranscript()`

## 第一步：Git 分支
在你的 IDE Git 工具中：
1. 確保在 `main` 分支
2. 建立並切換到 `cursor-pro/feature-voice-ui-repeat-search`

## 任務 A：語音輸入 UI 動態特效

### A1. 升級 AddTodoDialog 的麥克風按鈕
目前 `AddTodoDialog.tsx` 已有一個簡易的 Mic 按鈕。請大幅升級：
- **未錄音狀態**：麥克風圖示 + 微微的呼吸燈效果（scale 0.95~1.05 循環）
- **錄音中**：
  - 按鈕變為紅色，加上 3 層 ring 擴散動畫（像水波紋向外擴散）
  - 顯示錄音時長計時器（mm:ss）
  - 按鈕圖示變為 Square（停止圖示）
- **AI 處理中**：
  - 顯示精緻的載入動畫（3 個圓點交替跳動，或旋轉 AI 圖示）
  - 按鈕下方顯示「AI 辨識中...」文字
- **辨識完成**：短暫顯示綠色勾勾動畫，然後文字自動填入 textarea
- 使用 `motion` 的 `motion.div`, `AnimatePresence` 實作所有動畫

### A2. 整合 NLP 解析結果
Claude Pro 會建立 `src/app/utils/nlpParser.ts`（提供 `parseIntent(text)` 函數）。
當語音辨識完成後：
1. 呼叫 `parseIntent(transcript)` 取得結構化資料
2. 若解析出 `date`，自動填入日期欄位
3. 若解析出 `priority`，自動選取優先度按鈕
4. 將 `cleanedContent` 填入 textarea
5. 用一個小 Toast 提示使用者「已自動設定：日期/優先度」

## 任務 B：繰り返し任務（重複任務系統）
這是 Todoist 的核心功能之一。

### B1. 更新資料模型 (`src/app/types.ts`)
在 `Todo` interface 加入：
```ts
recurrence?: {
  type: 'daily' | 'weekly' | 'monthly' | 'weekdays' | 'custom';
  interval?: number;      // 每 N 天/週/月
  daysOfWeek?: number[];  // 0=日, 1=月...6=土（用於 weekly）
};
```

### B2. 更新 AddTodoDialog
在日期欄位下方加入「繰り返し」選擇區：
- 一排按鈕：毎日 / 毎週 / 毎月 / 平日のみ / カスタム
- 選擇「カスタム」時展開：間隔輸入 + 星期幾多選（用於 weekly）
- 使用 Framer Motion 展開/收合動畫

### B3. 建立重複任務邏輯 (`src/app/utils/recurrence.ts`)
```ts
export function getNextOccurrence(todo: Todo): string | null;
// 根據 recurrence 設定計算下一次日期（YYYY-MM-DD）
```

### B4. 更新 TodoList 完成邏輯
在 `TodoList.tsx` 中，當使用者勾選一個有 `recurrence` 的任務時：
1. 將當前任務標記為 completed
2. 自動建立一個新的相同任務，日期設為下一次出現日
3. 在卡片上顯示重複圖示（使用 lucide-react 的 `Repeat` icon）

## 任務 C：全局搜尋與篩選

### C1. 搜尋元件 (`src/app/components/SearchBar.tsx`)
- 一個浮動的搜尋欄，固定在頁面頂部
- 輸入關鍵字即時過濾所有 todos（搜尋 content, category.name, tags 中的 name）
- 搜尋結果高亮匹配的文字
- 使用 `useMemo` 優化效能

### C2. 篩選器 (`src/app/components/FilterChips.tsx`)
- 水平捲動的 chip 列：全部 / 高優先 / 中優先 / 低優先 / 各 Category
- 點擊 chip 篩選對應的任務
- 可同時使用搜尋 + 篩選

### C3. 整合到 TodoList
在 TodoList 頁面頂部整合 SearchBar + FilterChips。

## 任務 D：PM 文件與版本控制

### D1. 撰寫 PM 文件
建立 `PM_Guide/cursor_pro_voice_ui_repeat_search.md`，記錄：
- 語音 UI 動畫的設計邏輯（各狀態的視覺回饋）
- 繰り返し系統的資料結構與運算邏輯
- 搜尋/篩選元件的架構
- 修改了哪些檔案

### D2. Git 版本控制
使用 IDE 的 Git 工具 commit：
```
feat: add voice UI animations, recurrence system, and search/filter
```

## 注意事項
- 不要碰 `routes.ts` 和 `BottomNav.tsx`（那是 Codex Pro 的範圍）
- `useWhisper` hook 由 Claude Pro 開發，你只需要使用它的 API
- `nlpParser` 由 Claude Pro 開發，你只需要 import 並使用
- 若 Claude Pro 尚未完成，你可以先建立一個 stub（空殼函數），之後合併時會被替換
- 確保所有 TypeScript 型別正確
- 動畫必須流暢自然，達到 Apple 等級的質感
