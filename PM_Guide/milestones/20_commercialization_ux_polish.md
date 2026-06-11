# 里程碑：商用化體驗收尾

> 對應計畫「上架型、本地優先 App」的第一個里程碑。
> 目標：把 PWA 打磨到可公開發佈（Beta/上架前）的品質，**不引入後端**。
> 日期：2026-06-10
> 狀態：✅ 完成（`pnpm run build` 通過）

---

## 北極星與範圍

維持產品北極星「打開三秒知道該做什麼、完成即被獎勵」與**本地優先**架構。

語言策略：**保留日文 UI 為主**，只修不一致處，不導入 i18n 框架。

---

## 考慮過的方案

### 商用化路線

| 方案 | 優點 | 缺點 | 決定 |
|---|---|---|---|
| 訂閱制雲端 SaaS | 跨裝置同步、變現完整 | 需後端/帳號/金流，工程量大 | 延後 |
| **上架型 App（本地優先）** | 重用現有 PWA、符合隱私敘事 | 無跨裝置同步 | ✅ 選定 |
| 團隊協作產品 | 差異化 | 超出目前範圍 | 延後 |
| 僅作品集打磨 | 最快 | 無商用路徑 | 否決 |

### 語言策略

| 方案 | 決定 |
|---|---|
| 導入 i18n（繁中+日文） | 工程量大，暫不需要 |
| **保留日文 UI，修不一致** | ✅ 選定 |
| 全改繁中 | 與目標市場不符 |

### 亮/暗模式

| 方案 | 優點 | 缺點 | 決定 |
|---|---|---|---|
| 只加開關、沿用暗色 token | 快 | 亮色體驗差 | 否決 |
| **設計亮色海洋變體 + next-themes** | 兩主題皆可用、可上架審查 | 需逐頁驗證對比度 | ✅ 選定 |
| 只做暗色 | 零風險 | 不符合現代 App 期待 | 否決 |

---

## 實作摘要

### 1. 語言一致性

- UI 中文殘留改日文：`AI 認識中...`、`自動設定しました`、`カンバン`、`今日の完了率` 等。
- `reminder.ts` 通知 body：`タスクの期限です`。
- `index.html` 維持 `lang="ja"`。

### 2. 亮/暗主題系統

- `src/styles/index.css`：`:root`（亮色海洋）與 `.dark`（暗色海洋）完整 token。
- 語意 class：`.ocean-heading`、`.ocean-body`、`.ocean-muted`、`.ocean-glass-panel`。
- `src/app/components/ThemeProvider.tsx`：`next-themes`，`defaultTheme="dark"`，`enableSystem`。
- `src/app/components/OceanBackground.tsx`：波浪/氣泡/光線改為 CSS 變數派生。
- `index.html`：防主題閃爍 inline script。

### 3. 設定頁 `/settings`

- `src/app/pages/SettingsPage.tsx`：主題切換、通知權限、JSON 備份匯出/匯入、關於。
- 路由與導航：`Sidebar` + `BottomNav`（6 項，含統計與設定）。

### 4. 無障礙（WCAG AA 導向）

- `:focus-visible` 使用 `--focus-ring`（亮/暗各自對比足夠的色）。
- 語音按鈕、導航、看板優先度按鈕補 `aria-label`。
- 看板改鍵盤可操作：優先度切換按鈕 +「完了にする」，取代整卡點擊。

### 5. 響應式精緻化（階段 B/C 收尾）

- `AppShell` 內容區：`lg:max-w-5xl xl:max-w-6xl`。
- My Day / Stats / Settings 標題字級階梯 `text-2xl → md:text-3xl → lg:text-4xl`。
- Stats / Settings `lg:grid-cols-2` 多欄佈局。
- 主視圖卡片改用 `.ocean-glass-panel`，隨主題變數切換。

---

## 修改檔案清單

| 檔案 | 變更 |
|---|---|
| `src/styles/index.css` | 亮/暗海洋 token、語意 class、focus-visible |
| `src/app/components/ThemeProvider.tsx` | **新建** |
| `src/app/components/OceanBackground.tsx` | CSS 變數化 |
| `src/app/components/AppShell.tsx` | 加寬斷點、ocean-bg |
| `src/app/components/BottomNav.tsx` | 主題變數導航色、設定入口 |
| `src/app/components/Sidebar.tsx` | 主題變數、設定入口 |
| `src/app/components/VoiceInputButton.tsx` | 日文文案、aria-label |
| `src/app/components/AddTodoDialog.tsx` | 日文 toast |
| `src/app/pages/SettingsPage.tsx` | **新建** |
| `src/app/pages/MyDayPage.tsx` | 語意色、響應式字級 |
| `src/app/pages/StatsPage.tsx` | 語意色、grid、圖表 token |
| `src/app/pages/KanbanPage.tsx` | 鍵盤優先度、語意色 |
| `src/app/App.tsx` | ThemeProvider |
| `src/app/routes.tsx` | `/settings` lazy route |
| `src/app/utils/reminder.ts` | 日文通知 |
| `index.html` | suppressHydrationWarning、主題 script |

---

## 如何測試

1. `pnpm run build` 通過。
2. **設定頁**：切換ライト/ダーク/システム，背景與文字應同步變化。
3. **三寬度**：mobile 375 / tablet 768 / desktop 1280 目視無跑版。
4. **備份**：設定頁匯出 JSON → 清空或修改 → 匯入還原。
5. **鍵盤**：Tab 走訪底部導航、看板優先度按鈕，焦點環可見。
6. **對比度**：亮色主題正文 `#0c4a6e` on `#e0f7ff` 漸層 ≥ 4.5:1；暗色 `#f0f9ff` on `#0a1628` ≥ 4.5:1。

---

## 後續路線圖（本次未做）

- **里程碑二**：Capacitor（iOS/Android）/ Tauri（桌面）上架打包、原生通知。
- **里程碑三**：單機付費 / 一次性內購。
- **里程碑四**：Vitest + Playwright + CI + 錯誤監控。
- **里程碑五**：隱私政策、使用條款（商店審查）。
