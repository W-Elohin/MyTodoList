# MyTodoList 🌊

沉浸式海洋主題的任務管理 PWA。純前端、離線可用，資料保存在瀏覽器 localStorage。

## 產品北極星

> **打開 App 三秒內知道現在該做什麼；完成一件事時感覺被獎勵。**

設計理念與決策脈絡見 [`PM_Guide/00_DESIGN_CHARTER.md`](PM_Guide/00_DESIGN_CHARTER.md)，
文件索引見 [`PM_Guide/README.md`](PM_Guide/README.md)，
最新里程碑見 [`PM_Guide/milestones/20_commercialization_ux_polish.md`](PM_Guide/milestones/20_commercialization_ux_polish.md)。

## 主要功能

- **My Day 今日聚焦**（首頁）：逾期浮現、智慧聚焦推薦「現在最該做的事」、完成獎勵（勾選動畫 + 彩帶 + 觸覺）
- **多視圖**：完整清單、日曆、看板、統計、時間線、存檔（按需懶載入）
- **快速輸入**：自然語言解析、本地 Whisper 語音輸入
- **任務模型**：優先度、分類/標籤、子任務、遞迴、提醒
- **資料安全**：localStorage 容錯讀寫、全域錯誤邊界、JSON 備份匯出/匯入（含驗證）
- **PWA**：可安裝、離線、自動更新提示
- **設定頁**：亮/暗主題、通知、JSON 備份匯出/匯入

## 技術棧

- React 18 + TypeScript + Vite 6
- React Router v7（route-level lazy）
- Tailwind CSS v4 + Radix UI
- motion（動畫）、anime.js（海洋動態背景）
- @huggingface/transformers（Whisper，於 Web Worker 懶載入）

## 開發

```bash
npm i        # 安裝相依（專案使用 pnpm，npm 亦可）
npm run dev  # 啟動開發伺服器
npm run build  # 建置（vite build）
```

## 架構重點

- `src/app/pages/` — 各視圖；`/` = My Day（主角），其餘為工具視圖
- `src/app/utils/storage.ts` — localStorage 單一存取層（含型別守衛容錯）
- `src/app/utils/focus.ts` — 智慧聚焦的確定性排序邏輯
- `src/app/utils/priority.ts` — 優先度色彩 / 標籤單一真實來源
- `src/styles/index.css` — 設計 Token（`--ocean-gradient` 等）
- `PM_Guide/` — 決策文件（見 [`PM_Guide/README.md`](PM_Guide/README.md) 索引）

## 設計系統

海洋色票與亮/暗 token 見 [`PM_Guide/design/ocean_visual_system.md`](PM_Guide/design/ocean_visual_system.md)。

---

原始設計稿：https://www.figma.com/design/2NgGmbMZom2hinOc2ivK1G/MyTodoList
