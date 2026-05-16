# Claude Pro 任務指示：Dark Mode 主題系統

## 角色與環境
你是本專案的「主題系統工程師」，擁有 Terminal 操作權限。
專案：React + Vite + TailwindCSS PWA Todo App，套件管理器 **pnpm**。

## 第一步：Git
```bash
cd /Users/ne/Desktop/Projects/MyTodoList
git checkout main
git pull  # 確保拿到最新
git checkout -b claude-pro/feature-dark-mode
```

## 任務：完整 Dark Mode 主題系統

### 1. 建立主題 Context (`src/app/contexts/ThemeContext.tsx`)
```tsx
// 提供 theme ('light' | 'dark'), toggleTheme() 方法
// 初始值讀取 localStorage 的 'theme' key，若無則跟隨系統 prefers-color-scheme
// 切換時在 <html> 加上/移除 class="dark"
// 儲存選擇到 localStorage
```

### 2. 更新全局樣式 (`src/styles/index.css`)
在 TailwindCSS 中加入 dark mode 的 CSS 變數或利用 `dark:` variant：
- 背景色：`#F4F0ED` → dark: `#1a1a2e`
- 卡片：`white` → dark: `#16213e`
- 文字：`gray-800` → dark: `gray-100`
- 邊框：`gray-200` → dark: `gray-700`
- 所有頁面的 `style={{ backgroundColor: '#F4F0ED' }}` 需要支援 dark

### 3. 更新所有頁面和元件
需要加上 `dark:` class 的檔案（至少）：
- `TodoList.tsx` - 背景、卡片、文字
- `MyDayPage.tsx` - 背景、空狀態文字
- `CalendarPage.tsx` - 背景、日曆格子
- `KanbanPage.tsx` - 背景、欄位
- `StatsPage.tsx` - 背景、圖表
- `Archive.tsx` - 背景、卡片
- `AddTodoDialog.tsx` - 對話框背景、輸入框
- `BottomNav.tsx` - 導覽列
- `SearchBar.tsx` - 搜尋框
- `FilterChips.tsx` - 篩選按鈕
- `BackgroundAnimation.tsx` - 背景動畫顏色

### 4. 加入切換按鈕
在 BottomNav 或頁面頂部加一個 Sun/Moon 圖示切換按鈕。
使用 lucide-react 的 `Moon` 和 `Sun` icon。

### 5. 確保 Tailwind dark mode 設定
在 `tailwind.config` 或 `index.css` 中確保 `darkMode: 'class'` 已啟用。
（TailwindCSS v4 可能用 `@custom-variant dark (&:where(.dark, .dark *))` 語法）

## PM 文件
建立 `PM_Guide/claude_pro_dark_mode.md`，記錄：
- 主題系統架構（Context + CSS 變數）
- 修改了哪些檔案
- 顏色對照表（亮色 vs 暗色）

## Git
```bash
git add .
git commit -m "feat: add dark mode theme system"
```
