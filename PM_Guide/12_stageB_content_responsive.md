# 階段B（其一）：My Day 內容區響應式雙欄

> 對應 PM_Guide 10 的階段 B。建立在 PR #11（AppShell）之上。
> 分支：`claude-pro/ui-responsive-stageB`
> 日期：2026-06-10

---

## 問題

AppShell（#11）已讓桌面有側邊欄 + 較寬內容區（max-w-3xl）。但 My Day 的內容仍是
單一直欄：逾期區、今日清單上下堆疊，在寬螢幕上是一條很長的單欄，沒善用水平空間。

## 方案

- **有逾期時**：把「逾期區 | 今日清單」在 `lg` 以上並排（`lg:grid-cols-2`），
  焦點 banner 與進度條維持上方全寬。
- **無逾期時**：維持單欄（`className` 條件式），避免出現空的右欄造成不平衡。

```tsx
<div className={overdueTodos.length > 0 ? 'lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start' : ''}>
```

### 考慮過的方案
- 無條件 2 欄：無逾期時右欄空白、不平衡。否決。
- 條件式 2 欄 ✅：依資料決定佈局，兩種情況都平衡。

## 取捨 / 限制

- 本次僅處理 My Day（主視圖，最高價值）。Kanban 全寬、其他頁多欄、字級階梯
  留待後續（每項仍會各自寫 PM_Guide）。
- **無法在本 session 視覺驗證**（Preview MCP `EPERM`）。經使用者授權「直接合併並繼續」，
  以 `vite build` 通過為據合併；若桌面斷點觀感需微調，可隨時 git revert 或續修。

## 如何測試

1. `npx vite build`（已通過，3.2s）。
2. desktop ≥1024 且有逾期任務：逾期與今日清單應左右並排。
3. 無逾期任務：今日清單維持單欄、不留空欄。
4. mobile/tablet：維持單欄堆疊，無回歸。

## 追加（同階段 B）：標題字級階梯

6 個頁面標題由固定 `text-3xl` 改為 `text-2xl md:text-3xl`：手機不再過大、桌面維持份量。
涵蓋 My Day 以外的 ToDoリスト/看板/統計/カレンダー/タイムライン/完了済み。

## 後續

- Kanban 桌面全寬（目前受 AppShell max-w 約束）。
- 階段 C 視覺精緻化（卡片層次、焦點環、hover/active 一致化）。
