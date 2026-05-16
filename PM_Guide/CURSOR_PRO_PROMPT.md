# Cursor Pro 任務指示：表單 UX 簡化 + 今日頁情境化 + 空狀態設計

## 角色與環境
你是本專案的「前端 UX 工程師」，在 IDE 中操作。
專案：React + Vite + TailwindCSS PWA Todo App，套件管理器 **pnpm**。
動畫庫：`motion` (Framer Motion)，import 為 `from 'motion/react'`。圖標：`lucide-react`。

## Git
1. 確保在 `main` 分支並 pull 最新
2. 建立 `cursor-pro/feature-ux-polish`

## 任務 A：AddTodoDialog 表單 UX 簡化

### 問題
目前 `src/app/components/AddTodoDialog.tsx` 表單太長，需要大量捲動。

### 解決方案
1. **摺疊式設計**：將「カテゴリー」「優先度」「タグ」「繰り返し」「子任務」區塊改為可展開/收合的 accordion
2. 預設只顯示「内容」「日付」「時間」三個核心欄位
3. 底部加一排小 icon 按鈕（分類、優先度、標籤、重複、子任務），點擊展開對應區塊
4. 展開/收合用 Framer Motion `AnimatePresence` + `height: auto` 動畫
5. 讓 dialog 在 mobile 上也無需捲動就能看到提交按鈕

## 任務 B：今日頁情境化設計

### 問題
`src/app/pages/MyDayPage.tsx` 空狀態只有冷冰冰的文字。

### 解決方案
1. **時段問候語**：根據當前時間動態顯示
   - 6-12: 「おはようございます ☀️ 今日も頑張りましょう！」
   - 12-18: 「お疲れ様です 🌤️ 午後も引き続き！」
   - 18-24: 「お疲れ様でした 🌙 明日の準備はどうですか？」
   - 0-6: 「夜更かしですか？🌃 早めに休みましょう」
2. **今日進度條**：頂部顯示「今日の進捗 3/7 完了」+ 漂亮的進度條
3. **空狀態**：加上大型 emoji 插圖 + 激勵文案 + 直接新增按鈕

## 任務 C：所有頁面空狀態升級

### 各頁面空狀態設計
每個空狀態都要有：大 emoji + 主文案 + 副文案 + CTA 按鈕

| 頁面 | Emoji | 主文案 | 副文案 |
|------|-------|--------|--------|
| TodoList | 🎯 | タスクがありません | 右下の＋から追加しましょう |
| MyDayPage | ✨ | 今日のタスクはありません | 素晴らしい一日にしましょう！ |
| KanbanPage | 📋 | 看板にタスクがありません | タスクを追加して整理しましょう |
| CalendarPage | 📅 | この日のタスクはありません | タップして予定を追加 |

- emoji 要用 Framer Motion 做輕微的浮動動畫（上下 2px, 2s cycle）
- 整體用 `opacity: 0 → 1` 入場動畫

## PM 文件
建立 `PM_Guide/cursor_pro_ux_polish.md`，記錄你的設計決策。

## Git
```
feat: simplify form UX, add contextual greetings, and upgrade empty states
```
