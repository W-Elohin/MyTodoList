# Codex Pro 任務指示：🌊 統計頁海洋等級 + Pomodoro + 看板改善

## 角色與環境
你是「功能開發工程師」，在 IDE 中操作。
專案：React + Vite + TailwindCSS PWA。套件管理器 **pnpm**。
**已安裝 `animejs` (v4) 和 `@types/animejs`**。
import: `import anime from 'animejs'`

## 設計方向
海洋沉浸式主題。全 App 都是深海風格。
- 色彩：深海藍 `#0a1628`、海洋綠 `#0ea5e9`、珊瑚橙 `#f97316`、珍珠白 `#f0f9ff`
- 卡片：glassmorphism（`backdrop-blur-xl bg-white/10 border border-white/15`）
- 文字：`text-sky-50`, `text-sky-200`
- 統計圖表也要配合海洋色系

## Git
1. 確保 main 最新
2. 建立 `codex-pro/feature-ocean-stats-pomodoro`

## 任務 A：海洋等級系統（StatsPage 升級）

### 用海洋生物做等級
根據累積完成任務數，使用者的「海洋等級」會成長：
| 累積完成 | 等級 | 圖示 |
|---------|------|------|
| 0-10 | プランクトン（浮游生物）| 🦠 |
| 11-30 | イソギンチャク（海葵）| 🪸 |
| 31-60 | クマノミ（小丑魚）| 🐠 |
| 61-100 | タツノオトシゴ（海馬）| 🐡 |
| 101-200 | イルカ（海豚）| 🐬 |
| 201-500 | クジラ（鯨魚）| 🐋 |
| 500+ | 海の王者（海之霸者）| 🔱 |

- 在 StatsPage 頂部以大圖示 + 等級名 + 到下一等級的進度條顯示
- 進度條用海洋綠色漸層
- 用 anime.js 做等級圖示的入場浮動動畫

### 成就徽章（海洋版）
- 🐚 初めての一歩：完成第一個任務
- 🌊 三日坊主卒業：streak 3 天
- 🏄 波乗りマスター：streak 7 天
- ⚓ 百戦錬磨：累積 100 個
- 用 glassmorphism 卡片展示，未解鎖的灰色 + 鎖頭

### 所有圖表顏色
- 圓形進度條：海洋綠 `#0ea5e9`
- Bar chart：漸層 `#0ea5e9` → `#06b6d4`
- 空狀態：「まだデータがありません。タスクを完成させて海の冒険を始めましょう！🐙」

## 任務 B：Pomodoro 計時器

建立 `src/app/components/PomodoroTimer.tsx`：
- 浮動元件，固定在畫面右下角（FAB 上方）
- 外觀：glassmorphism 圓形，像一個水中泡泡
- 用 SVG circle 畫圓形進度
- 顏色：工作模式 `#0ea5e9`，休息模式 `#06b6d4`
- 時間到時用 anime.js 做泡泡爆裂動畫
- 可最小化為一個小圓形 icon

## 任務 C：看板頁面改善

在 `KanbanPage.tsx` 中：
1. 欄位標題用海洋色系指示器
2. 卡片改為 glassmorphism 風格
3. 用 anime.js 做卡片入場的交錯動畫（stagger）
4. 完成動畫：卡片像氣泡一樣向上飄走

## PM 文件
建立 `PM_Guide/codex_pro_ocean_stats_pomodoro.md`

## Git
```
feat: add ocean level system, Pomodoro timer, and kanban improvements
```
