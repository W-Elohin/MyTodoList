# 設計 Token 收斂 — 單一真實來源

> 對應設計章程支柱 2（設計 Token 收斂）。
> 分支：`claude-pro/design-tokens`
> 作者：Claude（UI-UX 設計師 / 前端架構視角）
> 日期：2026-06-09

---

## 問題陳述

Ocean 主題的視覺值散落在程式碼各處硬編，沒有單一真實來源（SSOT）：

1. **頁面漸層**：`linear-gradient(180deg, #0a1628 0%, #1e3a5f 50%, #0c4a6e 100%)`
   這一長串在 **8 個檔案**（7 個頁面 + ErrorBoundary）各自硬編。要微調全站背景
   得改 8 個地方，極易遺漏（My Day 之前就因此漏改成米色）。

2. **優先度色彩**：高/中/低的標籤與紅/黃/綠配色散落在 AddTodoDialog、KanbanPage、
   Archive，各自用 Tailwind class 硬編。更糟的是已經 **drift**：medium 在
   KanbanPage 是 `amber-500`，在 AddTodoDialog 卻是 `yellow-500`，兩個畫面顏色不一致。

---

## 考慮過的方案

### 議題 A：頁面漸層如何收斂

- **方案 A1 — 建 `.ocean-bg` class，掃掉所有 inline style** 
  優點：最徹底。
  缺點：各頁的容器 className 結構不一，掃改易誤傷；且部分頁面 background 與其他
  inline style 混在同一 style 物件，拆出來變動較大。

- **方案 A2 — 新增 `--ocean-gradient` CSS 變數，inline style 改引用 `var(...)`** ✅ **選定**
  同時提供 `.ocean-bg` utility 給未來新頁面用。
  優點：改動最小（每檔只換字串值）、零視覺風險、立刻達成 SSOT。
  缺點：既有頁面仍用 inline style（但值已集中），非純 class 化。

**為何選 A2**：在「達成單一真實來源」與「最小變動風險」間最佳平衡。
inline 改引用變數已徹底解決「改一處即全站生效」，純 class 化可日後漸進。

### 議題 B：OceanBackground 的漸層要不要一起收斂

- 它用的是 **4 段**深海漸層（多一個 `#0369a1` 停點），與頁面漸層是不同設計元素。
- **決策**：刻意不動。盲目替換會破壞動態背景的視覺。SSOT 的目的是收斂「相同」的值，
  而非把不同用途的值硬湊在一起。

### 議題 C：優先度 medium 的 drift 要統一到哪個顏色

- amber-500（#f59e0b）vs yellow-500（#eab308）。
- **決策**：統一為 **amber**。理由：amber 偏暖橘，更貼近海洋主題的珊瑚暖色調，
  與 `--coral` 系列協調；且 KanbanPage 是較近期、較完整的實作，採其值變動面較小。

---

## 技術實作細節

### `src/styles/index.css`
- 新增 `--ocean-abyss: #0c4a6e`（補齊漸層第三停點的具名變數）。
- 新增 `--ocean-gradient`，由 `--ocean-deep/mid/abyss` 派生。
- 新增 `.ocean-bg { background: var(--ocean-gradient); }` utility。

### 8 個檔案的 inline 漸層
- StatsPage / MyDayPage / CalendarPage / KanbanPage / TimelinePage / Archive /
  TodoList / ErrorBoundary：`'linear-gradient(...)'` → `'var(--ocean-gradient)'`。

### `src/app/utils/priority.ts`（新檔）
- `PRIORITY_META: Record<Priority, PriorityMeta>` — 每個優先度的 label / activeClass /
  badgeClass / columnBg 集中於此。
- `PRIORITY_ORDER`、`getPriorityMeta()` 輔助匯出。
- AddTodoDialog 優先度面板、KanbanPage 欄位定義改為派生自此。

---

## 如何測試

1. **建置**：`npx vite build` 通過（3.0s）。
2. **漸層 SSOT**（手動）：暫改 `--ocean-gradient` 的值 → 全部頁面背景應一起變。
3. **優先度一致性**：開新增任務的優先度面板與看板，medium 應為相同的 amber。
4. **視覺回歸**：各頁背景與既有外觀一致（除 Kanban medium 由 amber 維持、
   Dialog medium 由 yellow→amber 對齊）。

---

## 後續維護 / 技術債

- glass 面板的 `backdrop-filter / border` inline style 仍有重複，可進一步收斂到
  `.glass-card`（已存在）或更多 utility，屬漸進式清理。
- 文字色階（`text-sky-50/100/300...`）可再對照 WCAG AA 全面驗證對比度（支柱 6）。
- 亮色模式尚未啟用（next-themes 已在相依），屬支柱 5。
