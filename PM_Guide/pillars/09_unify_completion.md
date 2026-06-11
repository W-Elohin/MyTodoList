# 統一完成體驗 — Kanban 加入完成獎勵

> 對應設計章程支柱 4（完成反饋）的一致性收尾。
> 分支：`claude-pro/unify-completion`
> 日期：2026-06-09

---

## 問題陳述

完成獎勵（confetti + 觸覺）已在 My Day 與 `/list`，但其他列表頁面不一致。

## 稽核結果（先確認再動手）

- **KanbanPage**：有完成切換（點卡片即完成），但無任何獎勵反饋 → 需補。
- **CalendarPage / TimelinePage**：是「檢視型」頁面，本來就沒有完成切換動作 →
  無需、也不應硬加完成按鈕（會偏離其瀏覽用途）。

## 考慮過的方案（Kanban）

- 方案 1 — 把卡片內塞 `TodoCompleteButton`：但 Kanban 整張卡片本身就是 `<button>`，
  再嵌按鈕會變成巢狀 button（非法 HTML）。否決。
- **方案 2 — 保留「點卡片完成」的既有 UX，在 handler 內補 confetti + 觸覺** ✅ **選定**
  最小變動、不破壞既有互動，獎勵體驗與其他頁一致。

## 技術實作細節

`src/app/pages/KanbanPage.tsx`
- 引入 `useConfetti`；`handleToggleComplete(id, e?)` 內 `confetti.fire(e.clientX, e.clientY)`
  + `navigator.vibrate(15)`（feature-detected）。
- 卡片 onClick 改傳事件以取得噴發座標。

## 如何測試

1. `npx vite build` 通過（3.0s）。
2. 看板完成一張卡 → 應見彩帶從點擊處噴發 + （行動裝置）短震，卡片退場。

## 後續維護

- confetti 顏色未來可改海洋色票（已記於 PM_Guide 04）。
- 觸覺與 confetti 的「慶祝」組合可抽成共用 util，目前在 TodoCompleteButton 與
  KanbanPage 各有一份 vibrate 呼叫，重複度低、暫不抽象。
