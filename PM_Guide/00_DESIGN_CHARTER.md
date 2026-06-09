# 設計決策章程 — MyTodoList 產品北極星

> 本文件是自主開發 loop 的最高指導原則。每一個後續功能決策都必須回溯到這份章程。
> 作者：Claude（扮演 Tech Lead / UI-UX 設計師 / 後端與安全工程師）
> 建立日期：2026-06-09
> 狀態：v1（會隨研究持續更新）

---

## 一、為什麼要寫這份章程

前幾輪開發累積了豐富的功能（7 個視圖、語音輸入、NLP 解析、遞迴、看板、統計），
視覺上也有沉浸式 Ocean 主題。但**功能多 ≠ 好用**。在動手「精進」之前，
我先做了線上調查，確認業界頂級產品「真正怎麼做」，避免憑個人美感武斷決定。

**核心原則：所有 UI/UX 決策必須有研究依據，不能只憑直覺。**

---

## 二、線上研究發現（2026-06-09 第一輪）

### 研究對象與結論

| 產品 | 公認強項 | 可借鏡之處 |
|---|---|---|
| **Things 3** | 公認設計美感天花板：流暢動畫、考究字體排印、清晰視覺層級，「掃一眼就懂今天要做什麼」 | 「start date vs deadline」的區分、Headings/Areas 的克制式資訊分組、不臃腫 |
| **Todoist** | 極簡、零摩擦的快速輸入。打「submit report Friday at 5pm」按 enter 就完成 | 自然語言輸入把建立任務從 15-20 秒降到 3-5 秒；2026 新增 AI 語音轉任務「Ramble」 |
| **Linear** | SaaS 速度與鍵盤優先工作流的標竿；介面零雜訊，新手也看得懂結構 | 鍵盤捷徑、專業工具也能「快、乾淨、聚焦」 |

### 關鍵洞察（提煉成可執行原則）

1. **速度 = 留存**：頂級 App 的共同點不是功能多，而是「從腦袋到 App」的摩擦極低。
   自然語言輸入是最高槓桿的功能。我們已有 `nlpParser.ts`，要把它推到一級入口。

2. **克制勝過堆疊**：Things 3 用更少功能贏得更好口碑。我們現在 7 個視圖反而稀釋焦點，
   應該定義「主流程 + 次要視圖」的層級，而非平鋪 7 個入口。

3. **視覺層級服務於掃描**：好設計讓使用者「掃一眼就知道今天最重要的事」。
   首頁應該回答的問題是：「我現在該做什麼？」而非「我有哪些功能？」

4. **動畫要有意義**：流暢動畫的目的是引導注意力與提供反饋，不是裝飾。
   完成任務的反饋、過場、拖拽預覽都要服務於「確認使用者的操作成功了」。

---

## 三、產品北極星（North Star）

> **「打開 App 三秒內，使用者就知道現在該做什麼；完成一件事時，感覺被獎勵。」**

衡量指標（未來若有資料可驗證）：
- 建立一個任務的時間 < 5 秒
- 首頁首屏不需捲動就能看到「今日最重要的 1-3 件事」
- 完成任務有明確、令人滿足的反饋

---

## 四、資訊架構決策

### 現狀：7 個平級視圖
`/`(TodoList)、`/my-day`、`/calendar`、`/kanban`、`/stats`、`/timeline`、`/archive`

### 問題
平級的 7 個入口違反「克制」原則，使用者不知道從哪開始，也沒有明確主流程。

### 考慮過的方案

- **方案 A — 維持 7 視圖平鋪**
  優點：不動現有架構，零風險。
  缺點：違反研究結論，焦點分散，這正是「破檔」的根因。

- **方案 B — 砍到只剩 3 視圖（仿 Things 3 極簡）**
  優點：最聚焦。
  缺點：使用者已習慣現有功能，貿然砍掉破壞既有價值，且看板/統計確有差異化價值。

- **方案 C —「主流程 + 工具視圖」兩層架構** ✅ **選定**
  把「My Day（今日聚焦）」設為預設首頁與絕對主角，其餘視圖降為「切換得到、但不搶戲」的工具層。
  優點：保留所有既有功能（不破壞價值），同時建立清晰焦點層級，符合研究結論。
  缺點：需要重做導航與預設路由，工作量中等。

### 為何選 C
研究顯示頂級產品都有「明確主角 + 克制的次要功能」。方案 C 在「不丟棄既有投資」與
「建立焦點」之間取得最佳平衡，風險可控且方向正確。Things 3 的 Today、Todoist 的
Today 都是這個模式 — 業界已驗證。

### 落地細節（後續 iteration 執行）
1. 預設路由 `/` 改為 My Day 體驗（今日聚焦：逾期 + 今日 + 建議的 1-3 件要事）。
2. 完整清單、日曆、看板、統計、時間線、存檔降為次要視圖，從導航切換進入。
3. 自然語言快速輸入提升為全域一級入口（任何視圖都能秒加任務）。

---

## 五、設計 Token 系統（待建立）

現有 Ocean 配色散落在 inline style 與 Tailwind class，缺乏單一真實來源（single source of truth）。
下一步要把 `PM_Guide/claude_pro_ocean_theme.md` 記錄的色票收斂成 CSS 變數 + Tailwind theme，
確保亮/暗模式、對比度（WCAG AA）都從同一處派生。

---

## 六、待辦支柱（優先序，會隨研究調整）

1. **[研究先行] 資訊架構重組**：My Day 為主、其餘為輔（方案 C）。
2. **設計 Token 收斂**：色彩/間距/字體單一來源 + WCAG AA 對比度。
3. **快速輸入一級化**：NLP 輸入全域可用，仿 Todoist 零摩擦。
4. **完成反饋微互動**：有意義的完成動畫（已有 confetti，需打磨）。
5. **亮/暗模式無縫切換**：next-themes 已在相依，尚未啟用。
6. **離線優先架構**：目前 localStorage 同步寫入，需評估 IndexedDB + 容錯。
7. **安全性與資料完整性**：localStorage 無 schema 驗證、無錯誤邊界，JSON.parse 可能炸裂。
8. **效能**：主 bundle 578KB、whisper wasm 23MB，需 code-splitting 與 lazy load。

---

## 七、已發現的技術債 / 待修（稽核中持續累積）

- `src/app/utils/storage.ts`：含簡體中文註解（`默认类别` / `类别`），且 `JSON.parse`
  無 try/catch，localStorage 損毀會導致整頁崩潰。
- 建置警告：多個 chunk > 500KB，缺乏 code-splitting。
- 色彩系統散落 inline style，無單一真實來源。

---

## 八、工作方法論（自我約束）

1. **研究先行**：每個 UI/UX 決策前先查業界做法，寫進對應 PM_Guide。
2. **繁體中文**：所有產出一律繁體中文，禁用簡體。
3. **Git 紀律**：每個功能一條 branch，完成後寫 PM_Guide 再 merge。
4. **決策透明**：每份 PM_Guide 必含「考慮過的方案 / 選定方案 / 為何選它」。
5. **不破壞基線**：每次改動後確認 `vite build` 通過。

---

## 研究來源

- [8 Best To-Do List Apps (2026) — Efficient App](https://efficient.app/best/todo-list)
- [Todoist vs Things 3 (2026) — Morgen](https://www.morgen.so/blog-posts/todoist-vs-things-3)
- [35 Best UI/UX Design Examples for 2026 — Start Designs](https://www.startdesigns.com/blog/ui-ux-design-examples/)
- [Todoist's AI voice-to-tasks "Ramble" — TechCrunch](https://techcrunch.com/2026/01/21/todoists-app-now-lets-you-add-tasks-to-your-to-do-list-by-speaking-to-its-ai/)
- [Using Natural Language with Todoist — The Sweet Setup](https://thesweetsetup.com/using-natural-language-with-todoist/)
- [7 best to do list apps of 2026 — Zapier](https://zapier.com/blog/best-todo-list-apps/)
- [ToDo List UI challenges — CollectUI](https://collectui.com/challenges/to-do-list)
- [Todo List designs — Dribbble](https://dribbble.com/tags/todo_list)
