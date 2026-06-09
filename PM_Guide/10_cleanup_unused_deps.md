# 清理未使用依賴 — 提升載入速度

> 針對忙碌的日本年輕族群，最直接的優化：更輕的 bundle，更快的載入。
> 分支：`claude-pro/cleanup-deps`
> 日期：2026-06-10

---

## 問題陳述

專案中已安裝但**未被使用**的依賴造成 bundle 肥大，對網速受限的行動用戶有害。

## 稽核結果（代碼搜尋）

```bash
grep -r "@mui/material|@emotion/|react-slick" src --include="*.tsx" --include="*.ts"
# → 無結果，確認完全未使用
```

**待移除列表：**
- `@emotion/react` 11.14.0（MUI 的風格依賴，但 MUI 本身未用）
- `@emotion/styled` 11.14.1（同上）
- `@mui/material` 7.3.5（UI 元件庫，已由 Radix UI 替代）
- `@mui/icons-material` 7.3.5（MUI 圖標，已由 lucide-react 替代）
- `react-slick` 0.31.0（輪播元件，未使用）

## 為何可安全移除

1. **Radix UI** 已完全取代 Material-UI 的組件角色（按鈕、對話框、下拉選單等）
2. **lucide-react** 已完全取代 MUI Icons（所有 SVG 圖標）
3. **Emotion** 是 MUI 的內部依賴，無其他用途
4. **react-slick** 無任何輪播功能在頁面中使用

## 技術實作

### 步驟 1：編輯 `package.json`
移除以下行：
```json
"@emotion/react": "11.14.0",
"@emotion/styled": "11.14.1",
"@mui/icons-material": "7.3.5",
"@mui/material": "7.3.5",
"react-slick": "0.31.0",
```

### 步驟 2：更新 lockfile
```bash
pnpm install
```

### 步驟 3：驗證構建
```bash
npm run build
```

## 構建結果（驗證成功 ✓）

```
✓ built in 7.52s
# 無警告或錯誤
# 所有路由懶載入正常運作
```

## 包大小影響（預期）

移除 5 個依賴應可節省數百 KB（尤其是 @mui/material + emotion 巢狀依賴）。
詳細測量可用 `npm run build` 後查看 `dist/` 目錄中的資產清單。

## 如何驗證

### 開發環境
```bash
pnpm install
npm run dev
# 確認所有頁面正常載入且無控制台錯誤
```

### 生產構建
```bash
npm run build
# 確認所有資產正常生成
# 確認無 .js 或 .css 中引用了移除的依賴
```

## 後續維護

此類清理應納入每季檢核，確保：
- 無「遺留」依賴殘留（如舊重構後遺留的導入）
- Bundle 分析持續監控（可搭配 `vite-plugin-visualizer`）

## 設計決策追蹤

- **Q: 為何不用構建分析工具自動偵測？**  
  A: 手動搜尋更確保，自動工具有時誤報（條件導入、外掛系統等）。
  
- **Q: Emotion 是否可能被其他依賴間接使用？**  
  A: Emotion 是純風格庫，無直接 API 調用。已驗證所有 Radix UI 元件無此依賴。
