# 完成反饋微互動 — 把「被獎勵」帶到主視圖

> 對應設計章程支柱 4（完成反饋微互動）與北極星「完成一件事時感覺被獎勵」。
> 分支：`claude-pro/completion-feedback`
> 作者：Claude（UI-UX 設計師視角）
> 日期：2026-06-09

---

## 問題陳述

稽核發現：完整的完成體驗（`TodoCompleteButton` 描繪式勾選動畫 + `useConfetti` 彩帶）
**只接在次要的 `/list`（TodoList）頁面**。而資訊架構重組後，**主視圖是 My Day（`/`）**，
它卻只用樸素的 `<button>` 圓圈、完成時毫無反饋、項目瞬間消失。

使用者最常停留的主畫面，反而是獎勵感最薄弱的地方 — 直接違反北極星。

---

## 考慮過的方案

### 議題 A：如何讓 My Day 有完成獎勵

- 方案 A1 — 在 My Day 自己重寫一套動畫：重複造輪子、易與 /list drift。否決。
- **方案 A2 — 複用既有的 `TodoCompleteButton` + `useConfetti`** ✅ **選定**
  既有元件已驗證、視覺一致，直接接線即可。符合 DRY 與設計一致性。

### 議題 B：完成後項目立刻從清單消失，感覺突兀

- 方案 B1 — 完成後保留在清單（劃線）：My Day 是「今日聚焦」，已完成留著會稀釋焦點。否決。
- **方案 B2 — 延遲 320ms 再重整**，讓勾選描繪動畫播完，再由 AnimatePresence 退場 ✅ **選定**
  320ms 對齊 `TodoCompleteButton` 的 0.35s 描繪時長，動畫完整、退場順暢。

### 議題 C：要不要加觸覺回饋

- **方案 C — 在 `TodoCompleteButton` 加 `navigator.vibrate(15)`** ✅ **選定**
  完成時 15ms 短震，在行動裝置強化「被獎勵」體感。
  放在按鈕元件內 → 所有使用處（My Day、/list）一次受惠。
  以 feature detection 包覆（`typeof navigator.vibrate === 'function'`），
  不支援的裝置（桌機）自動無作用，零風險。

---

## 技術實作細節

### `src/app/pages/MyDayPage.tsx`
- import `TodoCompleteButton` 與 `useConfetti`。
- `handleToggleComplete(id, e?)`：未完成→完成時 `confetti.fire(e.clientX, e.clientY)`，
  從點擊位置噴發；只在「將變為完成」時觸發（避免取消完成也放彩帶）。
- 今日清單與逾期區的完成鈕都改為 `TodoCompleteButton`。
- 完成後 `setTimeout(loadTodos, 320)` 延遲重整。

### `src/app/components/TodoCompleteButton.tsx`
- `handleClick` 內加 `navigator.vibrate(15)`（feature-detected）。

---

## 如何測試

1. **建置**：`npx vite build` 通過（3.0s）。
2. **My Day 完成獎勵**（手動）：在 `/` 完成一項 → 應見勾選描繪動畫 + 彩帶從點擊處噴發，
   約 0.3s 後項目順暢退場。
3. **逾期完成**：逾期區完成一項 → 同樣有獎勵動畫。
4. **觸覺**（行動裝置）：完成時應感到短震；桌機無作用且無錯誤。

---

## 後續維護 / 技術債

- Calendar / Kanban / Timeline 等頁面的完成互動尚未統一到 `TodoCompleteButton`，
  可後續一併收斂（與設計 Token 收斂同精神）。
- confetti 顏色（`useConfetti` 的 COLORS）目前是通用調，未來可改用海洋色票更扣主題。
- `useConfetti` 每個使用它的頁面都會建立一個 canvas；若多頁同時掛載可考慮共用單例。
