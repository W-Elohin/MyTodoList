# Claude Pro 任務指示：🌊 海洋主題系統 + Dark Mode

## 角色與環境
你是「主題系統工程師」，擁有 Terminal 操作權限。
專案：React + Vite + TailwindCSS PWA。套件管理器 **pnpm**。
**已安裝 `animejs` (v4) 和 `@types/animejs`**。

## 設計方向
我們要打造一個**沉浸式海洋主題** App。使用者打開 App 就像潛入深海——
- 背景：深藍漸層 → 淺藍，帶有動態的海浪/氣泡效果
- 卡片：半透明玻璃形態 (glassmorphism)，像水中的泡泡
- 色彩主調：深海藍 `#0a1628`、海洋綠 `#0ea5e9`、珊瑚橙 `#f97316`、珍珠白 `#f0f9ff`
- 動態：用 **anime.js** 做浮動氣泡、波浪等環境動畫

## Git
```bash
cd /Users/ne/Desktop/Projects/MyTodoList
git checkout main && git pull
git checkout -b claude-pro/feature-ocean-theme
```

## 任務 1：海洋動態背景 (`src/app/components/OceanBackground.tsx`)
取代現有的 `BackgroundAnimation.tsx`：
- 用 anime.js 製作**動態海浪**（2-3 層 SVG wave，不同速度、不同透明度）
- 隨機浮動的小氣泡（15-20 顆），從底部緩慢上升
- 偶爾有小魚影子游過（用 CSS/SVG 剪影）
- 所有動畫用 `anime()` 的 timeline 和 loop 功能
- anime.js v4 import: `import anime from 'animejs'`

## 任務 2：全局色彩系統
更新 `src/styles/index.css`，建立 CSS 變數系統：
```css
:root {
  --bg-primary: linear-gradient(180deg, #0a1628 0%, #1e3a5f 50%, #0ea5e9 100%);
  --bg-card: rgba(255, 255, 255, 0.08);
  --bg-card-hover: rgba(255, 255, 255, 0.12);
  --text-primary: #f0f9ff;
  --text-secondary: #94a3b8;
  --border-glass: rgba(255, 255, 255, 0.15);
  --accent: #0ea5e9;
  --accent-warm: #f97316;
}
```

## 任務 3：更新所有頁面背景與卡片
將所有頁面的 `style={{ backgroundColor: '#F4F0ED' }}` 和 `bg-white` 改為使用海洋主題：
- 頁面背景用 `var(--bg-primary)` 漸層
- 卡片改為 glassmorphism：`backdrop-blur-xl bg-white/10 border border-white/15`
- 文字改為淺色：`text-sky-50`, `text-sky-200`
- 所有頁面用 `<OceanBackground />` 取代 `<BackgroundAnimation />`
- 需改的檔案：TodoList, MyDayPage, CalendarPage, KanbanPage, StatsPage, Archive, AddTodoDialog, BottomNav, SearchBar, FilterChips

## 任務 4：BottomNav 升級
- 改為半透明深色底 + backdrop-blur
- active tab 加上海洋光暈效果
- icon 使用 `text-sky-300 / text-sky-100`

## PM 文件
建立 `PM_Guide/claude_pro_ocean_theme.md`

## Git
```bash
git add . && git commit -m "feat: implement immersive ocean theme with anime.js animations"
```
