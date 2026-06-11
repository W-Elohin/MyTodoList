# 健壯性強化 — 儲存層容錯 + 全域錯誤邊界

> 對應設計章程支柱 7（安全性與資料完整性）。
> 分支：`claude-pro/design-charter-research`
> 作者：Claude（Tech Lead / 後端與安全工程師視角）
> 日期：2026-06-09

---

## 問題陳述

稽核現有程式碼時發現兩個會導致「整頁白屏崩潰」的脆弱點，對一個純前端、
資料全存在 localStorage 的 App 而言，這是最高優先的資料完整性風險：

1. **`storage.ts` 的 `JSON.parse` 無任何防護**
   `localStorage.getItem(key)` 的結果直接丟給 `JSON.parse`。只要該鍵值因任何原因
   損毀（手動竄改、其他分頁寫入衝突、瀏覽器異常、舊版資料格式不相容），
   `JSON.parse` 就會拋出例外，且因為 `getTodos()` 在每個頁面的 render 路徑上被呼叫，
   例外會往上冒泡到 React，導致整個 App 白屏，使用者永遠進不來。

2. **沒有任何 React Error Boundary**
   任何元件在渲染期拋出的例外（例如某個 todo 結構不完整、某個 util 回傳 undefined）
   都會讓整棵元件樹卸載，使用者看到的是純白畫面，沒有任何回復路徑。

附帶：`storage.ts` 內含簡體中文註解（`默认类别` / `类别`），違反專案的繁體中文規範。

---

## 考慮過的方案

### 議題 A：如何處理損毀的 localStorage 資料

- **方案 A1 — 只加 try/catch，失敗就回傳空陣列**
  優點：最簡單。
  缺點：無法區分「沒資料」與「資料部分損毀」；也不擋「JSON 合法但結構錯誤」
  （例如 todos 變成一個物件而非陣列）的情況，下游 `.filter()` / `.map()` 仍會炸。

- **方案 A2 — try/catch + 型別守衛驗證結構** ✅ **選定**
  解析後用 type guard 驗證「確實是 Todo[] / Category[]」，不符就回退預設值並 `console.warn`。
  優點：同時擋住「解析失敗」與「結構不符」兩類問題，下游渲染拿到的一定是合法結構。
  缺點：要多寫型別守衛，程式碼略長。

- **方案 A3 — 引入 zod 之類的 schema 驗證庫**
  優點：宣告式、可擴充。
  缺點：為了兩個簡單結構引入新相依，增加 bundle 體積（本專案 bundle 已偏大），過度設計。

**為何選 A2**：在「健壯性」與「不增加相依、不過度設計」之間最佳平衡。
手寫型別守衛對這兩個簡單結構足夠，且零新增 bundle 成本。

### 議題 B：寫入失敗（QuotaExceededError / 隱私模式）

- **方案 B1 — 不處理**：維持現狀，無聲崩潰。否決。
- **方案 B2 — try/catch 包覆寫入，回傳 boolean 成功與否** ✅ **選定**
  捕捉配額用盡與 Safari 無痕模式封鎖 localStorage 的例外，記錄錯誤並回傳成功旗標，
  讓未來呼叫端有機會提示使用者（目前先記錄，不強制呼叫端處理，維持 API 相容）。

### 議題 C：API 相容性

- 既有呼叫端遍布 7 個頁面 + reminder service，全部使用
  `getTodos / saveTodos / getCategories / saveCategories`。
- **決策**：保持這四個方法的簽章與回傳型別完全不變，強化僅發生在內部。
  結果：所有呼叫端零修改，這次改動風險被限制在單一檔案的內部實作。

### 議題 D：錯誤邊界的回復體驗

- **方案 D1 — 顯示原始錯誤堆疊**：對開發有用，對使用者是雜訊。否決。
- **方案 D2 — Ocean 風格的友善回復畫面 + 重新載入按鈕** ✅ **選定**
  與產品主題一致（🌊 + 漸層背景 + 安撫文案「海面起了點波瀾」），
  明確告知「資料安全保存在本機」降低使用者焦慮，提供「重新載入」一鍵回復。
  `componentDidCatch` 集中 `console.error` 並預留遠端錯誤回報（Sentry）接口。

---

## 技術實作細節

### `src/app/utils/storage.ts`
- `safeRead<T>(key, fallback, validate)`：泛型安全讀取，解析 + 型別守衛驗證，
  任何失敗回退 fallback。
- `safeWrite(key, value)`：安全寫入，捕捉例外回傳 boolean。
- 型別守衛：`isTodo` / `isTodoArray` / `isCategory` / `isCategoryArray`，
  驗證必要欄位的型別（id/content/date/time/completed/createdAt 等）。
- `getCategories()`：區分「無資料（初次使用）」與「損毀」，兩者都回退並寫入預設類別。
- 簡體註解全數改為繁體。

### `src/app/components/ErrorBoundary.tsx`（新檔）
- Class component（Error Boundary 目前仍須用 class 實作）。
- `getDerivedStateFromError` 切換到錯誤畫面；`componentDidCatch` 記錄。
- 限制說明已寫進註解：只攔截渲染/生命週期/建構子錯誤，事件處理器與
  非同步程式碼仍需各自 try/catch。

### `src/app/App.tsx`
- 將最外層 `<>` 改為 `<ErrorBoundary>` 包覆 RouterProvider + Toaster + UpdatePrompt。

---

## 本分支也包含

`PM_Guide/00_DESIGN_CHARTER.md` — 整個自主開發計畫的設計章程：基於 Things 3 /
Todoist / Linear 的線上研究，定義產品北極星與「主流程 + 工具視圖」資訊架構決策（方案 C）。
這是後續所有功能的指導文件。

---

## 如何測試

1. **建置**：`npx vite build` 通過（3.1 秒，無型別錯誤）。
2. **儲存層容錯**（手動）：在 DevTools console 執行
   `localStorage.setItem('todos', '{bad json')` 後重新整理 → App 應正常載入（空清單），
   console 出現回退警告，而非白屏。
3. **錯誤邊界**（手動）：暫時在某頁 render 中 `throw new Error('test')` → 應看到
   Ocean 回復畫面與「重新載入」按鈕，而非白屏。

---

## 後續維護 / 技術債

- `safeWrite` 目前回傳 boolean 但呼叫端尚未利用 → 未來可在 UI 提示「儲存空間已滿」。
- `componentDidCatch` 的遠端回報接口待接上（Sentry 或自架）。
- 仍待處理（章程支柱）：bundle code-splitting、設計 token 收斂、My Day 資訊架構重組。
