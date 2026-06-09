# Codex Pro: Kanban, Stats, Reminder

## KanbanPage 欄位設計

- 新增 `src/app/pages/KanbanPage.tsx`。
- 使用 `storage.getTodos()` 載入所有任務，並透過 `storage` 與 `focus` 事件同步其他頁面的變更。
- 頁面頂部統計摘要包含總任務數、已完成、未完成、今日到期，數字以 `motion` 做淡入位移動畫。
- 看板欄位依 priority 分為 `未分類`、`低優先`、`中優先`、`高優先`。
- 未完成任務才會出現在看板；未設定 priority 的任務放入 `未分類`。
- 任務卡片顯示 content、date、time、category 與 tags；點擊卡片會將任務標記完成，寫入 `completedAt`，並用 `AnimatePresence` 做退出動畫。

## StatsPage 計算方式

- 新增 `src/app/pages/StatsPage.tsx` 與 `src/app/utils/statsCalculator.ts`。
- `todayTotal`：所有 `date` 等於 `getLocalDateString()` 的任務數。
- `todayCompleted`：`completedAt` 轉成本地日期後等於今天的任務數。
- `todayCompletionRate`：`todayCompleted / todayTotal`，無今日任務時為 0。
- `weeklyData`：最近 7 天每天以 `completedAt` 統計完成數。
- `streak`：從今天往回檢查，每天至少完成一件任務才累加。
- `categoryBreakdown`：未完成任務依 `category` 分組，無分類歸入 `未分類`。
- 圖表使用 SVG circle、CSS div bar 與 Framer Motion，不引入新圖表庫。

## Reminder 系統

- 新增 `src/app/utils/reminder.ts`。
- `requestNotificationPermission()` 會在瀏覽器支援 Notification 時請求權限，回傳是否允許。
- `scheduleReminder(todo)` 會依 `todo.date + todo.time` 計算到期時間，未完成且未過期才以 `setTimeout` 排程。
- 通知內容使用 `new Notification(todo.content, { body: '任務到期提醒', icon: '/icon-192x192.png' })`。
- `cancelReminder(todoId)` 會清除既有 timer。
- `initReminderService()` 在 App 啟動時執行；若已有通知權限，會為所有未完成且未過期任務重新排程。
- `TodoList` 新增任務後呼叫 `scheduleReminder(newTodo)`，完成或刪除任務時取消提醒。

## 修改檔案

- `src/app/pages/KanbanPage.tsx`
- `src/app/pages/StatsPage.tsx`
- `src/app/utils/statsCalculator.ts`
- `src/app/utils/reminder.ts`
- `src/app/App.tsx`
- `src/app/routes.ts`
- `src/app/components/BottomNav.tsx`
- `src/app/pages/TodoList.tsx`
- `PM_Guide/codex_pro_kanban_stats_reminder.md`

## 路由與導覽

- 新增路由 `/kanban` 與 `/stats`。
- BottomNav 新增 `看板` 與 `統計`。
- `/timeline` 路由保留，但從 BottomNav 移除，仍可直接透過 URL 存取。
