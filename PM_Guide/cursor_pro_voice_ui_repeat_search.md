# Cursor Pro 任務記錄：語音 UI/UX + 繰り返し任務 + 搜尋/篩選

## 負責 AI
**Cursor Pro**

## 開發分支
`cursor-pro/feature-voice-ui-repeat-search`

---

## 任務 A：語音輸入 UI 動態特效

### 設計邏輯（各狀態視覺回饋）

| 狀態 | 視覺 | 互動 |
|------|------|------|
| **待機** | 白底麥克風 + `scale 0.95→1.05` 呼吸燈 | 點擊開始錄音 |
| **錄音中** | 紅底 + 三層 ring 水波擴散 + Square 停止圖示 + `mm:ss` 計時 | 點擊停止 |
| **AI 處理中** | 旋轉 Loader + 三點跳動 +「AI 辨識中...」 | 按鈕 disabled |
| **辨識完成** | 綠色 Check 短暫動畫（約 1.2s） | 自動 NLP 填表 |

### NLP 整合流程
1. `useWhisper` 回傳 `transcript`
2. 呼叫 `parseIntent(transcript)`（`nlpParser.ts`，目前為 stub，含簡易中日關鍵字）
3. 自動填入 `cleanedContent` → textarea、`date`、`priority`
4. `sonner` Toast 提示「已自動設定：日期/優先度」

### 相關檔案
- `src/app/components/VoiceInputButton.tsx` — 麥克風動畫元件
- `src/app/components/AddTodoDialog.tsx` — 整合語音與表單
- `src/app/hooks/useWhisper.ts` — Stub（Web Speech API 後備；Claude Pro 將替換 Whisper Worker）
- `src/app/utils/nlpParser.ts` — Stub `parseIntent`
- `src/app/App.tsx` — 加入 `<Toaster />`

---

## 任務 B：繰り返し（重複任務）系統

### 資料結構 (`types.ts`)
```ts
recurrence?: {
  type: 'daily' | 'weekly' | 'monthly' | 'weekdays' | 'custom';
  interval?: number;
  daysOfWeek?: number[]; // 0=日 … 6=土
}
```

### 運算邏輯 (`recurrence.ts`)
- `getNextOccurrence(todo)`：依 `type` 從當前 `date` 計算下一次 `YYYY-MM-DD`
  - `daily`：+ interval 天
  - `weekdays`：跳至下一個週一至週五
  - `weekly` / `custom`（有 daysOfWeek）：找下一個符合的星期
  - `monthly`：+ interval 月
- `getRecurrenceLabel(recurrence)`：卡片顯示用日文標籤

### 完成邏輯 (`TodoList.tsx`)
勾選含 `recurrence` 的任務時：
1. 當前實例標記 `completed: true`
2. 若 `getNextOccurrence` 有值，建立新 Todo（新 id、新日期、未完成）
3. 列表卡片顯示 `Repeat` 圖示 + 重複標籤

### UI (`AddTodoDialog.tsx`)
日期下方：毎日 / 毎週 / 毎月 / 平日のみ / カスタム；カスタム 展開間隔與曜日多選（Framer Motion 展開動畫）

---

## 任務 C：全局搜尋與篩選

### 架構
```
TodoList
├── SearchBar（sticky 頂部搜尋欄）
├── FilterChips（水平 chip：全部 / 優先度 / 各 Category）
└── useMemo(filteredTodos) — 搜尋 + 篩選合併
```

- **搜尋**：比對 `content`、`category.name`、`tags[].name`；`highlightText()` 高亮匹配片段
- **篩選**：`FilterValue = 'all' | 'high' | 'medium' | 'low' | 'cat-{id}'`
- 搜尋與篩選可同時生效

### 相關檔案
- `src/app/components/SearchBar.tsx`
- `src/app/components/FilterChips.tsx`
- `src/app/pages/TodoList.tsx`

---

## 修改檔案清單

| 檔案 | 變更 |
|------|------|
| `src/app/types.ts` | 新增 `TodoRecurrence`、`recurrence` 欄位 |
| `src/app/utils/recurrence.ts` | **新建** |
| `src/app/utils/nlpParser.ts` | **新建** stub |
| `src/app/hooks/useWhisper.ts` | **新建** stub |
| `src/app/components/VoiceInputButton.tsx` | **新建** |
| `src/app/components/SearchBar.tsx` | **新建** |
| `src/app/components/FilterChips.tsx` | **新建** |
| `src/app/components/AddTodoDialog.tsx` | 語音 UI、繰り返し、NLP |
| `src/app/pages/TodoList.tsx` | 搜尋/篩選、重複完成邏輯 |
| `src/app/App.tsx` | Sonner Toaster |
| `PM_Guide/cursor_pro_voice_ui_repeat_search.md` | **新建** 本文件 |

## 未修改（依指示）
- `routes.ts`
- `BottomNav.tsx`

## 狀態
✅ 開發完成，`pnpm run build` 通過。
