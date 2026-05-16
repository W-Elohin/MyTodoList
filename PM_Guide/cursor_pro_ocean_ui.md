# Cursor Pro 任務記錄：海洋 UI 插畫 + 表單改造 + 今日頁 + 微互動

## 負責 AI
**Cursor Pro**

## 開發分支
`cursor-pro/feature-ocean-ui-polish`

---

## 任務 1：海洋生物 SVG 插畫（anime.js）

| 元件 | 用途 | 動畫參數摘要 |
|------|------|----------------|
| `OctopusIllustration` | TodoList 空狀態 | 觸手 `rotate ±5deg` 3s loop stagger 200ms；身體 `translateY ±3px` 4s；眼睛反光 `opacity` 0.6↔1 2s |
| `TurtleIllustration` | MyDay 空狀態 | 整體 `translateX ±10px` 6s；前鰭 `rotate ±15deg` 1.5s；後鰭反向 delay 300ms；身體 `rotate ±2deg` 5s |
| `CrabIllustration` | Kanban 欄空狀態 | 鉗子 `rotate` 開合 1s alternate；腿 stagger 80ms；眼睛 `translateY ±2px`；`compact` 時 `scale(0.5)` |
| `WhaleIllustration` | Calendar 空狀態 | 水滴 `translateY` 0→-40 + `opacity` 1→0 2s stagger 400ms；身體浮動 4s；尾巴 `rotate ±8deg` 2s |
| `EmptyStateWrapper` | 統一空狀態容器 | Framer `opacity/y` 進場；標題 `text-sky-200`、副標 `text-sky-400` |

技術：`import { animate } from 'animejs'`（v4），`useEffect` 內啟動、`pause()` 清理。

---

## 任務 2：各頁空狀態整合

- **TodoList**：章魚 + 日文標題／副標
- **MyDayPage**：海龜 +「のんびりしましょう！」
- **KanbanPage**：每欄迷你螃蟹
- **CalendarPage**：鯨魚 + 選日提示

---

## 任務 3：AddTodoDialog 表單改造

### 改造前
- 所有欄位垂直堆疊，手機需大量捲動才能看到提交按鈕。

### 改造後
- **核心區**：内容 textarea + 語音按鈕 → 工具列 icon → 可選展開面板 → 日付／時間並排 → 提交
- **工具列**：Clock / Folder / Flag / Tag / Repeat / ListChecks，36×36，未選 `bg-white/10`，已設定 `bg-sky-500/20 ring`
- **展開**：`AnimatePresence` 單一面板；海洋深色 dialog `bg-[#0a1628]/95`
- 輸入框：`bg-white/[0.08] border-white/15 text-sky-50`

---

## 任務 4：今日頁情境化

- `getGreeting()`：依小時回傳 emoji／問候／副標
- `GreetingEmoji`：anime.js `scale` 0.9↔1.1 呼吸 3s
- **進度條**：`storage.getTodos()` 當日完成率；glass 卡片 + Framer 寬度動畫；無任務顯示「まだ予定がありません」

---

## 任務 5：任務卡片微互動（TodoList）

| 互動 | 實作 |
|------|------|
| Hover | `whileHover={{ y: -2 }}` + `border-white/15` → `/25` |
| 完成 | `TodoCompleteButton`：hover 淡勾預覽；點擊 `pathLength` 畫出 + `bg-sky-400` |
| 刪除 | `useDeleteConfirm`：首次顯示「削除？」2s，二次確認刪除 |

---

## 修改／新增檔案

**新增**
- `src/app/components/illustrations/OctopusIllustration.tsx`
- `src/app/components/illustrations/TurtleIllustration.tsx`
- `src/app/components/illustrations/CrabIllustration.tsx`
- `src/app/components/illustrations/WhaleIllustration.tsx`
- `src/app/components/illustrations/EmptyStateWrapper.tsx`
- `src/app/components/TodoCompleteButton.tsx`
- `src/app/components/DeleteConfirmButton.tsx`
- `src/app/components/GreetingEmoji.tsx`
- `src/app/utils/greeting.ts`
- `PM_Guide/cursor_pro_ocean_ui.md`

**修改**
- `src/app/components/AddTodoDialog.tsx`
- `src/app/pages/TodoList.tsx`
- `src/app/pages/MyDayPage.tsx`
- `src/app/pages/KanbanPage.tsx`
- `src/app/pages/CalendarPage.tsx`

**未修改（依指示）**
- `routes.ts`、`BottomNav.tsx`、`BackgroundAnimation.tsx`、`storage.ts`

## 狀態
✅ `pnpm run build` 通過。
