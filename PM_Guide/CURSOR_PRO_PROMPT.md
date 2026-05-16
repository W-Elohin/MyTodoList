# Cursor Pro 任務指示：🌊 海洋主題 UI 細節 + 空狀態插畫 + 表單簡化

## 角色與環境
你是「前端 UX 工程師」，在 IDE 中操作。
專案：React + Vite + TailwindCSS PWA。套件管理器 **pnpm**。
**已安裝 `animejs` (v4) 和 `@types/animejs`**。
import: `import anime from 'animejs'`

## 設計方向
海洋沉浸式主題——整個 App 像一個美麗的水下世界。
- 色彩：深海藍 `#0a1628`、海洋綠 `#0ea5e9`、珊瑚橙 `#f97316`、珍珠白 `#f0f9ff`
- 卡片：glassmorphism（`backdrop-blur-xl bg-white/10 border border-white/15`）
- 文字：淺色系 `text-sky-50`, `text-sky-200`
- 所有空狀態要有可愛的海洋 SVG 插畫

## Git
1. 確保 main 最新
2. 建立 `cursor-pro/feature-ocean-ui-polish`

## 任務 A：海洋風空狀態 SVG 插畫

用純 JSX/SVG 畫可愛的海洋生物，放到各頁面的空狀態：

| 頁面 | SVG 主角 | 文案 |
|------|---------|------|
| TodoList | 🐙 章魚坐在海底石頭上 | タスクがまだありません |
| MyDayPage | 🐢 海龜悠閒游泳 | 今日のタスクはありません・のんびりしましょう！ |
| KanbanPage | 🦀 螃蟹舉著空看板 | 看板にタスクがありません |
| CalendarPage | 🐳 鯨魚噴水 | この日のタスクはありません |

- 每個 SVG 用 anime.js 加微動畫（例如章魚觸手輕微擺動、海龜緩慢游動）
- 文字用 `text-sky-300` 柔和色

## 任務 B：AddTodoDialog 表單簡化

把 `src/app/components/AddTodoDialog.tsx` 改為步驟式設計：
1. 主畫面只顯示：内容 textarea + 日付 + 時間 + 提交按鈕
2. 底部一排 icon 按鈕（用 lucide-react）：
   - 📁 カテゴリー → 點擊展開分類選擇
   - ⚡ 優先度 → 點擊展開優先度
   - 🏷️ タグ → 點擊展開標籤
   - 🔄 繰り返し → 點擊展開重複設定
   - ☑️ サブタスク → 點擊展開子任務
3. 展開用 anime.js 做平滑的 slide down 動畫
4. Dialog 背景改為 glassmorphism 風格（配合海洋主題）

## 任務 C：今日頁情境化

更新 `src/app/pages/MyDayPage.tsx`：
1. 根據時段顯示不同問候語 + 海洋 emoji
   - 6-12: 「おはようございます 🌅 新しい一日の始まり！」
   - 12-18: 「お疲れ様です 🌊 午後も頑張りましょう！」
   - 18-24: 「お疲れ様でした 🌙 今日もよく頑張りました」
   - 0-6: 「夜更かしですか？🐙 早めに休みましょう」
2. 今日進度條：glassmorphism 風格，海洋綠色

## PM 文件
建立 `PM_Guide/cursor_pro_ocean_ui.md`

## Git
```
feat: add ocean-themed SVG illustrations, simplify form UX, contextual greetings
```
