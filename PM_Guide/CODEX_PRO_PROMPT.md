# Codex Pro 任務指示：統計頁激勵系統 + 看板拖拽 + Pomodoro 計時器

## 角色與環境
你是本專案的「功能開發工程師」，在 IDE 中操作。
專案：React + Vite + TailwindCSS PWA Todo App，套件管理器 **pnpm**。
動畫庫：`motion` (Framer Motion)，import 為 `from 'motion/react'`。圖標：`lucide-react`。

## 目前相關檔案
- `src/app/pages/StatsPage.tsx` - 統計頁（已有基本的完成率、週趨勢、streak、分類統計）
- `src/app/pages/KanbanPage.tsx` - 看板（已有 4 欄靜態看板）
- `src/app/utils/statsCalculator.ts` - 統計計算函數
- `src/app/types.ts` - 資料模型

## Git
1. 確保在 `main` 分支並 pull 最新
2. 建立 `codex-pro/feature-stats-kanban-pomodoro`

## 任務 A：統計頁激勵系統

### 問題
統計頁在沒有資料或資料很少時顯得空洞無力。

### 解決方案
1. **等級系統**：根據累積完成任務數給使用者一個「稱號」
   - 0-10: 🌱 初心者
   - 11-50: 🌿 見習い
   - 51-100: 🌳 一人前
   - 101-200: ⭐ ベテラン
   - 201-500: 🔥 達人
   - 500+: 👑 マスター
   在 StatsPage 頂部以大圖示 + 稱號 + 進度條 (到下一等級) 顯示

2. **成就徽章**：達成特定條件解鎖
   - 「初タスク」：完成第一個任務
   - 「三日坊主卒業」：streak 達 3 天
   - 「一週間の戦士」：streak 達 7 天
   - 「百戦錬磨」：累積完成 100 個任務
   用灰色（未解鎖）和彩色（已解鎖）圖示顯示

3. **空狀態激勵**：沒有資料時顯示「まだデータがありません。タスクを完成させて統計を作りましょう！🚀」

## 任務 B：Pomodoro 計時器

### 設計
建立 `src/app/components/PomodoroTimer.tsx`：
- 一個可折疊的浮動元件，固定在右下角（FAB 上方）
- 預設 25 分鐘工作 / 5 分鐘休息
- 顯示圓形進度 (SVG circle) + 剩餘時間
- 開始/暫停/重置按鈕
- 時間到時播放瀏覽器通知 + 視覺提示
- 可選擇關聯一個 todo（計時完成後自動標記完成）

### 整合
- 在 `src/app/App.tsx` 或共用的 layout 中加入 PomodoroTimer
- 使用 lucide-react 的 `Timer` icon

## 任務 C：看板拖拽改善

在 `KanbanPage.tsx` 中：
1. 任務卡片加入 swipe-to-complete 手勢（向右滑動完成）
2. 每欄加一個「+」按鈕，可直接新增該優先度的任務
3. 欄位標題旁加上對應顏色的圓點指示器

## PM 文件
建立 `PM_Guide/codex_pro_stats_pomodoro.md`，記錄你的設計決策。

## Git
```
feat: add gamification stats, Pomodoro timer, and kanban improvements
```

## 注意事項
- 不要碰 `AddTodoDialog.tsx`（Cursor Pro 正在改）
- 不要碰 `BottomNav.tsx`（不需要新增 tab）
- 所有圖表用純 CSS/SVG + Framer Motion
