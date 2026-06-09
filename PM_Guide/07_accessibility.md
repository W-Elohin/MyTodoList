# 可訪問性 A11y — 螢幕閱讀器與鍵盤可達性

> 對應設計章程支柱 6（可訪問性）。
> 分支：`claude-pro/a11y`
> 作者：Claude（前端 / 無障礙視角）
> 日期：2026-06-09

---

## 問題陳述

稽核發現幾個基礎但影響大的無障礙缺陷：

1. **`<html lang="en">`**：但整個 UI 是日文。螢幕閱讀器會用英文發音引擎念日文，
   體驗錯亂。這是最廉價、影響最大的修正。
2. **多個只有圖標的按鈕沒有可存取名稱**：Folder（存檔）、Plus（新增）、Pencil（編輯）、
   完成圈（TodoCompleteButton）。螢幕閱讀器只會念「按鈕」，使用者不知道作用。
3. **底部導航缺少 `aria-current`**：螢幕閱讀器無法得知目前在哪個分頁。

---

## 考慮過的方案

### 議題：圖標按鈕如何提供可存取名稱

- 方案 1 — 在圖標上加 `<title>`：可行但分散、易漏。
- **方案 2 — 在 `<button>` 上加 `aria-label`** ✅ **選定**
  語意最明確、集中在互動元素上、與既有少數已加 aria-label 的按鈕一致。
  通用元件（TodoCompleteButton）加一次，所有使用處受惠。

---

## 技術實作細節

| 檔案 | 修改 |
|---|---|
| `index.html` | `lang="en"` → `lang="ja"` |
| `MyDayPage.tsx` | Folder「アーカイブを開く」、Plus「新しいタスクを追加」、今日清單 Pencil「編集」 |
| `TodoCompleteButton.tsx` | `aria-label="完了にする"`（所有使用處受惠） |
| `BottomNav.tsx` | 每個分頁 `aria-label`，作用中分頁 `aria-current="page"` |

（逾期區的 Pencil 與完成圈在前一支柱已具 aria-label。）

---

## 如何測試

1. **建置**：`npx vite build` 通過（3.0s）。
2. **lang**：檢視 `<html lang="ja">`，VoiceOver/TalkBack 應以日文發音。
3. **螢幕閱讀器**（手動）：逐一 focus 圖標按鈕，應念出對應的日文名稱而非僅「按鈕」。
4. **鍵盤**：Tab 可走訪所有互動元素；底部導航作用中分頁回報 current。

---

## 後續維護 / 技術債

- 全面 WCAG AA 對比度量測（文字色階 `text-sky-300/400/500` 於漸層背景）尚待逐一驗證，
  屬需視覺工具輔助的後續工作。
- 焦點可見環（focus-visible ring）目前依賴瀏覽器預設，可後續設計符合海洋主題的自訂焦點樣式。
- Dialog（AddTodoDialog）的焦點陷阱與 Esc 關閉行為待確認（Radix 多半已內建）。
