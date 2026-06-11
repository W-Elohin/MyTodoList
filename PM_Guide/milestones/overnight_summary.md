# 整夜自主開發總結 — 給早上的你

> 日期：2026-06-09 夜 → 2026-06-10 晨
> 模式：`/loop` 自主開發（Tech Lead / UI-UX 設計師 / 後端與安全工程師）
> 一句話：以「研究先行 + 決策透明 + 每功能一 PR 一 PM_Guide」的紀律，把 MyTodoList
> 從「破檔」推進到有明確產品北極星、健壯、可訪問、效能優化的狀態。

---

## 產品北極星（一切決策的依據）

> **「打開 App 三秒內知道現在該做什麼；完成一件事時感覺被獎勵。」**

完整研究與決策見 [`00_DESIGN_CHARTER.md`](../00_DESIGN_CHARTER.md)（基於 Things 3 / Todoist / Linear 的線上調查）。

---

## 今夜合併的 PR（皆已併入 main，各附 PM_Guide）

| PR | 主題 | 支柱 | PM_Guide |
|---|---|---|---|
| #1 | 設計章程 + 健壯性（storage 容錯 + ErrorBoundary） | 7 | pillars/01 |
| #2 | 資訊架構重組：My Day 設為主角 + 逾期浮現 | 1 | pillars/02 |
| #3 | 設計 Token 收斂（漸層 + 優先度單一來源） | 2 | pillars/03 |
| #4 | 完成反饋微互動（勾選動畫 + confetti + 觸覺）帶到主視圖 | 4 | pillars/04 |
| #5 | My Day 智慧聚焦：推薦現在最該做的事 | 5 | pillars/05 |
| #6 | 效能：路由分割 + vendor 快取（主 bundle 578KB→218KB） | 8 | pillars/06 |
| #7 | 可訪問性：lang、aria-label、aria-current | 6 | pillars/07 |
| #8 | 資料備份強化：匯入驗證 + 一致 toast | 7 | pillars/08 |
| #9 | 文件：整夜總結 + README 正式化 | — | — |
| #10 | 統一完成體驗：Kanban 完成獎勵 | 4 | pillars/09 |

---

## 🔴 待你處理：PR #11（未合併，需視覺 review）

後半夜你給了關鍵批評：**沒有響應式、桌面是細欄飄空白、手機跑版、美感缺分析**。
我據此把 loop 轉向 **UI 全面翻新 + 響應式**，並完成第一階段：

- **[PR #11](https://github.com/W-Elohin/MyTodoList/pull/11) 響應式 AppShell**（手機底部導航 → 桌面側邊欄）。
- **刻意未自行合併**：這是全站佈局變更，而我在過夜環境無法截圖驗證（Preview MCP `EPERM`）。
  **請在 mobile(375)/tablet(768)/desktop(1280) 三寬度看過再合併。**
- 分析與計畫見 [`design/responsive_overhaul.md`](../design/responsive_overhaul.md)（已合併原 10–13）。
- 階段 B/C 與亮暗主題後續由 [20_commercialization_ux_polish.md](20_commercialization_ux_polish.md) 收尾。

**你早上的最短路徑**：開 #11 預覽 → 三寬度看一眼 → OK 就合併，回我一聲我接著做階段 B/C；
不 OK 就告訴我哪裡要調整。

---

## 關鍵 tech lead 判斷（需要你知道的取捨）

1. **亮/暗模式「刻意延後」**：完整光亮模式需逐頁視覺驗證，而過夜自主開發**無法做視覺 QA**。
   硬塞半成品會破壞沉浸式海洋暗色識別 → 留待你能親自 review 時再做。
   （`next-themes` 已在相依，隨時可啟用。）

2. **智慧聚焦用「規則排序」而非黑箱 AI**：可解釋、可重現、離線可用。透明才是好「智慧」。

3. **不重複造輪子**：稽核發現匯出/匯入、Whisper 懶載入、TodoCompleteButton 都已存在，
   改為強化既有實作而非重寫。

4. **未清理未使用相依**：`@mui/*`、`react-slick` 已被 tree-shake 不影響 bundle，
   但移除 package.json 條目需驗證 lockfile，過夜網路不穩下風險高於價值 → 留給你。

---

## 仍待辦（建議的下一步）

> 以下部分已由 [20_commercialization_ux_polish.md](20_commercialization_ux_polish.md) 完成：亮/暗模式、設定頁、WCAG 導向 a11y、RWD 收尾。

- 把完成體驗統一到 Calendar / Timeline（Kanban 已完成）
- 清理未使用相依（@mui、react-slick、emotion）並更新 lockfile
- 匯入「合併 vs 取代」選項與覆蓋前確認
- 上架打包（Capacitor / Tauri）

---

## 工作方法論（本次貫徹的紀律）

- 研究先行：UI/UX 決策前先查業界做法。
- 繁體中文，禁用簡體。
- 每功能一 branch、一 PR、一 PM_Guide（含「考慮過的方案 / 選定 / 為何」）。
- 每次改動後 `vite build` 必須通過。
- 自行 branch 並合併（經你授權），保持 main 線性、可在早上順序 review。
