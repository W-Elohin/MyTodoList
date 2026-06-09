# 導入「合併 vs 取代」選項 — 資料安全優先

> 讓忙碌的日本使用者放心備份與復原，不怕誤刪資料。
> 分支：`claude-pro/import-merge-option`
> 日期：2026-06-10

---

## 問題陳述

現有導入功能直接**覆蓋所有資料**，無提示，無選項。使用者意外導入舊備份時會遺失現有工作。

## 解決方案概要

在導入前顯示對話框，讓使用者選擇：
1. **合併（Merge）** — 將導入資料與現有資料組合（去重，保留雙方）
2. **取代（Replace）** — 用導入資料完全覆蓋現有資料（舊行為，需明確確認）

## 技術實作

### 新文件：`src/app/components/ImportMergeDialog.tsx`

基於 Radix UI Dialog 的對話框組件，展示：
- 導入的檔名
- 兩個操作按鈕（視覺區別：取代用紅色警告樣式）
- 取消選項

### 修改：`src/app/pages/Archive.tsx`

**新增狀態：**
```typescript
const [importDialog, setImportDialog] = useState({ 
  isOpen: false, 
  data: null as ImportData | null, 
  fileName: '' 
});
```

**修改 `handleImport`：**
- 讀取檔案內容 ✓
- 驗證結構 ✓
- **新增：顯示對話框，不直接導入**
- 保存導入數據待用戶確認

**新增 `handleMergeTodos` 和 `handleMergeCategories`：**
使用 Map 按 ID 去重：
```typescript
// 現有資料保留，新資料補齊缺失部分
const merged = new Map<string, Todo>();
existing.forEach(t => merged.set(t.id, t));
imported.forEach(t => {
  if (!merged.has(t.id)) merged.set(t.id, t);
});
```

**新增 `handleImportMerge` 和 `handleImportReplace`：**
根據用戶選擇執行相應邏輯。

## 設計決策

### Q: 合併的去重策略？
**A: 優先保留現有資料。** 邏輯：
- 用戶導入舊備份或來自其他設備的備份
- 現有資料是最新的，應保留
- 導入資料的缺失部分（新分類等）補齊

### Q: 是否支援選擇性合併（例如只合併分類，替換任務）？
**A: 現階段不支援。** 未來可擴展，但目前：
- 需保持 UI 簡潔（年輕使用者快速決策）
- 兩個選項已涵蓋大多使用場景
- 若需細粒度控制，可在未來版本加入高級選項

### Q: 合併後的資料重複性？
**A: 依靠 ID 唯一性。** 前提：
- 匯出的備份含 ID（JSON 結構驗證已檢查）
- 若 ID 衝突，同一 ID 的任務視為同一項，現有保留

## 測試清單

### 開發環境測試
```bash
pnpm install
npm run dev
```

1. **合併測試**
   - 建立任務 A（id: 1）
   - 匯出備份 1
   - 建立任務 B（id: 2）
   - 匯入備份 1 → 選「合併」
   - 驗證：完成清單同時包含 A 和 B

2. **取代測試**
   - 建立任務 A, B, C
   - 匯出備份（含 A, B）
   - 建立任務 D
   - 匯入備份 → 選「取代」
   - 驗證：只有 A, B；D 已刪除

3. **分類合併**
   - 現有分類：「工作」、「生活」
   - 導入分類：「工作」、「購物」
   - 選「合併」
   - 驗證：現有「工作」保留，「購物」補齊

### 建置驗證
```bash
npm run build
# ✓ 2156 modules transformed
# ✓ built in 7.36s
```

## 使用者流程

```
1. 使用者點擊「匯入」按鈕
   ↓
2. 選擇 JSON 備份檔案
   ↓
3. 系統驗證檔案結構
   ↓
4. 對話框顯示：「選擇合併或取代？」
   ↓
5. 使用者確認
   ↓
6. 執行合併或取代邏輯
   ↓
7. 成功 toast + 頁面更新
```

## 後續維護

- **考慮項**：若合併資料量過大（1000+ 項任務），可加入進度提示
- **未來擴展**：可支援「預覽合併結果」，讓使用者在最終確認前檢視

## 設計章程對應

- **支柱 7（健壯性）**：保護資料安全，防止誤刪
- **使用者心理**：給予控制感，明確每個操作的後果

---

## 推送說明

- Branch: `claude-pro/import-merge-option`
- Files: 
  - `src/app/components/ImportMergeDialog.tsx` (新)
  - `src/app/pages/Archive.tsx` (修改)
  - `PM_Guide/11_import_merge_option.md` (本文)
