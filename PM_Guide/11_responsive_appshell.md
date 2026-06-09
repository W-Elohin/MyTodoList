# 階段A：響應式 AppShell — 手機底部導航 → 桌面側邊欄

> 對應 PM_Guide 10 的階段 A。回應使用者「沒有響應式、桌面細欄飄空白」的批評。
> 分支：`claude-pro/ui-responsive`
> 日期：2026-06-10

---

## ⚠️ 合併前須知（重要）

本 PR 改動全站佈局，**作者無法在本次 session 視覺驗證**（Preview MCP 在此環境
`EPERM` 無法啟動瀏覽器截圖，見記憶 preview-dev-server-quirk）。
**請在 mobile(375) / tablet(768) / desktop(1280) 三個寬度實際檢視後再合併。**
建置（`vite build`）已通過、JSX 平衡、型別無誤，但像素級外觀需人眼確認。

---

## 問題

所有頁面各自硬編 `min-h-screen + BackgroundAnimation + max-w-md mx-auto + BottomNav`，
導致：(1) 桌面是 448px 細欄飄在空白漸層；(2) 無任何斷點，非響應式；(3) 七頁重複同樣外殼。

## 方案（見 PM_Guide 10 的研究分析）

採「手機底部 Tab → ≥md 側邊欄」自適應導航 + 統一 layout 外殼：

- 新建 `AppShell`（layout route）：統一提供海洋背景、`BackgroundAnimation`、導航、
  響應式內容容器（`max-w-md md:max-w-3xl lg:max-w-4xl`）。
- 新建 `Sidebar`：`<md` 隱藏、`≥md` 顯示的垂直導航（含 7 個視圖 + 品牌），
  sticky 於 flex 流、內容區 `flex-1` 並排，不覆蓋。
- `BottomNav` 加 `md:hidden`，桌面交給 Sidebar。
- `routes.tsx`：所有頁面改為 `AppShell` 的 children（layout route），`/` 為 index。
- 7 個頁面移除各自的外殼（`min-h-screen`/`BackgroundAnimation`/`max-w-*`/`BottomNav`），
  只保留內容 + FAB + 對話框；清掉不再使用的 import。

## 取捨

- **Kanban 寬度**：原本用 `max-w-6xl`，現受 AppShell 的 `max-w-4xl` 約束，桌面 4 欄會較窄。
  Stage B 會讓 Kanban 可用更寬版面（例如該頁 opt-out 容器寬度）。暫可接受。
- **未自行合併**：因無法視覺驗證，留 PR 待人眼確認（不同於先前可純邏輯驗證的 PR）。

## 如何測試（請 reviewer 執行）

1. `npx vite build`（已通過）。
2. mobile 375：應為單欄 + 底部導航，無水平溢出。
3. tablet/desktop ≥768：應出現左側 Sidebar、底部導航消失、內容區加寬置中。
4. 切換各視圖，Sidebar 作用中項目高亮（aria-current）。
5. My Day 的問候/聚焦/逾期/完成獎勵、各頁功能無回歸。

## 後續（階段 B）

- 各頁內容區多欄 grid（My Day 寬螢幕雙欄、Kanban 全寬）。
- 字級/間距斷點階梯。
- FAB 在桌面側欄佈局下的位置微調。
