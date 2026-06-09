# 階段C（其一）：視覺精緻化 — 焦點環 + confetti 海洋色

> 對應 PM_Guide 10 的階段 C。改善現有暗色主題的質感與一致性（不做高風險全站反轉）。
> 分支：`claude-pro/ui-polish`
> 日期：2026-06-10

---

## 問題

1. **焦點環不一致**：依賴瀏覽器預設 outline，與海洋主題不搭、各元件不一。
   鍵盤使用者體驗與「精緻感」皆扣分。
2. **confetti 用通用彩虹色**（#FF6B6B 等），與全站海洋色票脫節，慶祝動畫像外掛。

## 方案

- **全站 `:focus-visible`**：海洋強調色（`--ocean-surface`）2px outline + offset + 圓角。
  用 `:focus-visible` 而非 `:focus`，只在鍵盤導航顯示，滑鼠點擊不打擾。
- **confetti 改海洋色票**：sky 藍系 + coral 珊瑚 + seaweed 海藻綠 + foam 泡沫白，
  與 `--ocean-*` / `--coral` / `--seaweed` 一致。

### 為何這樣選
- 焦點環放全域單一定義 → 一致、好維護、a11y 與美感雙贏。
- confetti 色票對齊主題 → 慶祝動畫成為「海洋世界」的一部分，而非突兀的彩色紙屑。

## 技術實作

- `src/styles/index.css`：新增 `:focus-visible { outline: 2px solid var(--ocean-surface); outline-offset: 2px; border-radius: .5rem; }`。
- `src/app/hooks/useConfetti.ts`：`COLORS` 改為海洋色票陣列。

## 如何測試

1. `npx vite build`（已通過，3.0s）。
2. 鍵盤 Tab 走訪：焦點元件出現一致的海洋藍焦點環；滑鼠點擊不顯示。
3. 完成任務：彩帶為藍/橘/綠/白海洋色系。

## 後續（階段 C / 其他）

- 卡片層次（陰影/邊框）系統化、hover/active 一致化。
- 亮/暗模式（task #6）—— 屬較大且需視覺驗證的獨立工作。
