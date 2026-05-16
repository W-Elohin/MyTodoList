# Codex Pro 任務記錄：優先權限系統 (Priority Levels)

## 負責 AI
**Codex Pro**

## 開發分支
`codex-pro/feature-priority`

## 實作內容
1. **資料結構 (`src/app/types.ts`)**: 
   - 擴充 `Todo` 介面，新增 `priority?: 'low' | 'medium' | 'high'` 屬性。
2. **新增/編輯介面 (`src/app/components/AddTodoDialog.tsx`)**: 
   - 在表單中加入三個按鈕（高、中、低），對應不同的顏色（紅、黃、綠）。
   - 更新元件的內部 state 以支援儲存和載入 Priority。
3. **列表視圖 (`src/app/pages/TodoList.tsx`)**: 
   - 在任務卡片上，若是包含 priority 的項目，將以膠囊標籤顯示（例如紅色背景白字的「優先度: 高」）。
4. **其他視圖 (`Archive.tsx`, `CalendarPage.tsx`, `TimelinePage.tsx`)**: 
   - 同步加入 priority 標籤的顯示，確保各個畫面的體驗一致。

## 狀態
✅ 開發完成並已 Commit。
