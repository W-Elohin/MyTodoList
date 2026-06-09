# 資料備份強化 — 匯入驗證與一致 UX

> 對應設計章程支柱 7（安全性與資料完整性）。
> 分支：`claude-pro/data-backup`
> 作者：Claude（後端 / 安全視角）
> 日期：2026-06-09

---

## 稽核發現

匯出/匯入備份功能**已存在**於 Archive 頁（Download / Upload 圖標）。
不重複造輪子，改為強化既有實作的三個弱點：

1. **匯入驗證薄弱**：只檢查 `Array.isArray(data.todos)`，不驗證每筆 todo 的結構。
   一個損毀或惡意構造的備份檔（例如 todos 內含缺欄位的物件）會被存進 localStorage，
   接著在各頁 render 時炸裂 —— 等同繞過我們先前為 storage 層建立的防護。
2. **用原生 `alert()`**：與 App 既有的 sonner toast 風格不一致，體驗突兀且阻塞。
3. **匯出/匯入/返回按鈕只有 `title`、無 `aria-label`**：a11y 缺口。

---

## 考慮過的方案（匯入驗證）

- 方案 1 — 維持 `Array.isArray` 淺檢查：擋不住結構不符，否決。
- 方案 2 — 在 Archive 內另寫一套驗證：與 storage 的守衛邏輯重複、易 drift。否決。
- **方案 3 — 從 storage.ts 匯出既有型別守衛 `isTodoArray` / `isCategoryArray` 複用** ✅ **選定**
  匯入與儲存共用同一套驗證，邏輯單一來源、不 drift。
  todos 與 categories 任一通過即可匯入該部分；兩者皆不合法則拒絕並提示。

---

## 技術實作細節

### `src/app/utils/storage.ts`
- 將 `isTodoArray` / `isCategoryArray` 由內部函式改為 `export`（守衛邏輯不變）。

### `src/app/pages/Archive.tsx`
- `handleImport`：用 `isTodoArray(data?.todos)` / `isCategoryArray(data?.categories)` 嚴格驗證；
  兩者皆不合法 → `toast.error` 並中止；合法部分才寫入。
- 全部 `alert()` → `toast.success` / `toast.error`（沿用 App 既有 Toaster）。
- 匯出/匯入/返回按鈕補 `aria-label`（延續支柱 6）。

---

## 如何測試

1. **建置**：`npx vite build` 通過（2.8s）。
2. **正常匯出/匯入**（手動）：匯出後清空再匯入，資料完整還原，顯示成功 toast。
3. **惡意/損毀檔**：匯入 `{"todos":[{"foo":1}]}` 或非 JSON → 應顯示錯誤 toast、
   不污染既有資料、不崩潰。
4. **a11y**：螢幕閱讀器 focus 三個按鈕應念出日文名稱。

---

## 後續維護 / 技術債

- 匯入目前是「整批覆蓋」，未來可提供「合併 / 取代」選項與覆蓋前確認對話框。
- 可加入備份檔版本欄位（schema version），未來格式演進時做遷移。
- 自動定期提醒備份（localStorage 易因清快取遺失）可作為留存型功能。
