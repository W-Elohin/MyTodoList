# 效能 — 路由分割與 vendor 快取

> 對應設計章程支柱 8（效能）。
> 分支：`claude-pro/perf-codesplit`
> 作者：Claude（後端 / 前端架構視角）
> 日期：2026-06-09

---

## 問題陳述

建置警告主 bundle 過大（578KB / gzip 184KB），所有頁面與 vendor 全擠在單一 chunk，
首屏要下載並解析全部，且每次 App 程式碼變動都讓使用者重新下載整包（含不常變的 vendor）。

---

## 稽核發現（先釐清，避免做白工）

- **Whisper 已經是懶載入**：`useWhisper.ensureWorker()` 只在使用語音時 `new Worker(...)`，
  且 `@huggingface/transformers` 在 worker 內 import，已被分割成獨立的
  `whisper.worker.js`（533KB）+ wasm（23MB），**本來就不在主 bundle**。不需也不該動它。
- **`@mui/material`、`react-slick` 完全沒被 src 使用**：已被 tree-shaking 排除，
  不在 bundle 內（屬冗餘相依，可日後從 package.json 清理，與本 PR 無關）。
- 真正的肥肉是「7 個頁面全部 eager import」+「vendor 與 app 程式碼混在一起」。

---

## 考慮過的方案

### 議題 A：頁面如何分割

- 方案 A1 — 全部頁面（含 My Day）都 lazy：My Day 是主視圖，lazy 會讓首屏多一次往返，
  反而拖慢最重要的畫面。否決。
- **方案 A2 — My Day eager，其餘 6 頁 route-level lazy** ✅ **選定**
  主視圖秒開，次要視圖按需載入。用 react-router v7 的 `lazy` 屬性，進入路由前解析 chunk。

### 議題 B：vendor 要不要拆

- **方案 B — manualChunks 把 react/react-dom/react-router 與 motion 拆成獨立 vendor chunk** ✅ **選定**
  這些 vendor 極少變動。拆出後其 hash 在 App 改版時保持不變，回訪者直接命中快取，
  免重新下載 ~325KB 的 vendor。

---

## 成果（建置實測）

| 項目 | 之前 | 之後 |
|---|---|---|
| 主 app chunk（index） | 578 KB / gzip 184 KB | **218 KB / gzip 71 KB** |
| vendor-react（可長期快取） | — | 230 KB / gzip 76 KB |
| vendor-motion（可長期快取） | — | 95 KB / gzip 31 KB |
| 6 個次要頁面 | 含在主 bundle | 各自 4–14 KB，按需載入 |

**誠實說明**：首次造訪的「總下載量」相近（vendor 仍需載入），真正的勝利在兩點：
1. **次要頁面延後**：首屏不再下載 Calendar/Kanban/Stats/Timeline/Archive/List（約 42 KB）。
2. **跨版快取**：App 程式碼（index，最常變動）與 vendor 解耦，改版後回訪者只需重抓 218KB 的
   app chunk，~325KB 的 vendor 直接命中快取。

---

## 技術實作細節

### `src/app/routes.tsx`
- My Day 維持 `Component: MyDayPage`（eager）。
- 其餘 6 路由改為 `lazy: async () => ({ Component: (await import('./pages/X')).X })`。

### `vite.config.ts`
- 新增 `build.rollupOptions.output.manualChunks`：
  `vendor-react`（react/react-dom/react-router）、`vendor-motion`（motion）。

---

## 如何測試

1. **建置**：`npx vite build` 通過（3.0s），輸出見上表多個 chunk。
2. **路由懶載入**（手動）：開 DevTools Network，從 My Day 點進「カレンダー」→
   應看到 `CalendarPage-*.js` 此時才載入。
3. **功能回歸**：各次要頁面進入後功能正常（含 lazy 解析）。

---

## 後續維護 / 技術債

- 可從 package.json 移除未使用的 `@mui/material`、`@emotion/*`、`react-slick`、
  `@mui/icons-material` 等冗餘相依（減少安裝體積與供應鏈面，與 bundle 無關）。
- recharts（僅 StatsPage 間接用）、react-day-picker（Calendar）、react-dnd（Kanban）
  已隨各自頁面 chunk 延後，無需額外處理。
- whisper wasm 23MB 屬語音功能本質成本，已隔離於 worker，僅在使用時下載。
