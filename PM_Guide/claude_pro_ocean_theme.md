# 海洋沉浸式主題系統 — PM 技術文件

## 海洋色彩系統 CSS 變數

### 主色板（`src/styles/index.css` `:root`）

| 變數名 | 值 | 用途 |
|---|---|---|
| `--ocean-deep` | `#0a1628` | 頁面最深背景（漸層起點） |
| `--ocean-mid` | `#1e3a5f` | 漸層中段 |
| `--ocean-surface` | `#0ea5e9` | sky-500，主強調色（CTA、選中態） |
| `--ocean-light` | `#38bdf8` | sky-400，次強調 |
| `--ocean-foam` | `#bae6fd` | sky-200，高亮文字 |
| `--ocean-pearl` | `#f0f9ff` | sky-50，主要內文 |
| `--coral` | `#f97316` | 珊瑚橘，高優先度、CTA |
| `--coral-light` | `#fdba74` | 珊瑚橘淺色 |
| `--seaweed` | `#10b981` | 海藻綠，完成狀態、低優先度 |
| `--seaweed-light` | `#6ee7b7` | 海藻綠淺色 |

### Glassmorphism 功能色

| 變數名 | 值 | 用途 |
|---|---|---|
| `--glass-bg` | `rgba(255,255,255,0.08)` | 卡片/面板預設背景 |
| `--glass-bg-hover` | `rgba(255,255,255,0.14)` | 懸停態背景 |
| `--glass-border` | `rgba(255,255,255,0.15)` | 預設邊框 |
| `--glass-border-hover` | `rgba(255,255,255,0.25)` | 懸停態邊框 |

### 文字色

| 變數名 | 值 | 用途 |
|---|---|---|
| `--text-primary` | `#f0f9ff` | 主要文字（sky-50） |
| `--text-secondary` | `#94a3b8` | 次要說明文字 |
| `--text-muted` | `#64748b` | 淡化標籤、佔位符 |

### 頁面漸層背景（inline style，所有頁面統一）

```
background: linear-gradient(180deg, #0a1628 0%, #1e3a5f 50%, #0c4a6e 100%)
```

---

## OceanBackground 動畫架構

**檔案**：`src/app/components/OceanBackground.tsx`  
**技術**：anime.js v4.4.1（named exports），React `useEffect` + `useRef`

### 第 1 層：SVG 波浪（3 層）

每層波浪由 **2 個相同 SVG path 並排**組成，透過 `translateX: [0, -700]` 無縫循環。

| 層級 | 速度 | 透明度 | 顏色 |
|---|---|---|---|
| 波浪 1 | 12 秒 | 0.3 | `rgba(14,165,233,0.3)` |
| 波浪 2 | 8 秒 | 0.2 | `rgba(56,189,248,0.2)` |
| 波浪 3 | 6 秒 | 0.15 | `rgba(186,230,253,0.15)` |

```ts
// anime.js v4 波浪動畫寫法
animate(wave1Ref.current, {
  translateX: [0, -700],
  duration: 12000,
  easing: 'linear',
  loop: true,
})
```

**無縫原理**：SVG viewBox 為 `0 0 700 80`，兩條 path 拼接為 1400px 寬，translateX 移動 -700px 後剛好回到起點，形成無縫循環。

### 第 2 層：浮動氣泡（18 顆）

使用 `useMemo` 預算 **確定性氣泡位置**（非 `Math.random()` in render，避免 hydration 問題）：

```ts
const bubbles = useMemo(() => Array.from({ length: 18 }, (_, i) => ({
  left: ((i * 37 + 13) % 100),
  size: 4 + (i * 7) % 10,
  delay: i * 600,
})), []);
```

動畫：
```ts
animate(bubbleEls, {
  translateY: () => [utils.random(0, 80), utils.random(-900, -600)],
  duration: () => utils.random(9000, 16000),
  delay: stagger(600, { start: 0 }),
  loop: true,
})
```

### 第 3 層：光線（3 道）

斜向白色漸層 div，呼吸式透明度動畫：

```ts
animate(ray, {
  opacity: [0.03, 0.09, 0.03],
  duration: 6000 + i * 2000,
  loop: true,
})
```

---

## 修改檔案清單

### 新建檔案
| 檔案 | 說明 |
|---|---|
| `src/app/components/OceanBackground.tsx` | 海洋動態背景主元件 |

### 覆蓋重寫
| 檔案 | 修改內容 |
|---|---|
| `src/app/components/BackgroundAnimation.tsx` | 改為 re-export OceanBackground |
| `src/app/components/BottomNav.tsx` | 深海背景 `rgba(10,22,40,0.85)` + sky 圖標 |
| `src/app/components/SearchBar.tsx` | glass bg + sky 配色 |
| `src/app/components/FilterChips.tsx` | glass 非選中態 + sky 選中態 |
| `src/app/pages/CalendarPage.tsx` | glass panel + ocean 事件點 |
| `src/app/pages/KanbanPage.tsx` | 日文欄位名 + ocean 配色 |
| `src/app/pages/StatsPage.tsx` | sky-500 圓環/柱狀圖 |
| `src/app/pages/Archive.tsx` | glass 卡片 + sky 文字 |
| `src/app/pages/TimelinePage.tsx` | sky-500 時間線 + ocean 預設色 |

### 追加修改
| 檔案 | 修改內容 |
|---|---|
| `src/styles/index.css` | CSS 變數 + `.glass-card` utility |
| `src/app/pages/TodoList.tsx` | ocean 主題（targeted edits） |
| `src/app/components/SubTaskList.tsx` | sky 配色（新建後套用主題） |

---

## 主要 CSS class 對照

### Glassmorphism 面板（inline style object）
```ts
const glassPanel = {
  background: 'rgba(255,255,255,0.06)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255,255,255,0.12)',
} as const;
```

### 文字色層級（Tailwind class）
| 用途 | class |
|---|---|
| 主標題 | `text-sky-50` |
| 次要標題 | `text-sky-100` |
| 標籤 / 數值 | `text-sky-400` |
| 淡化佔位符 | `text-sky-500` |

### 優先度徽章
| 優先度 | class |
|---|---|
| 高 | `bg-red-500/70 text-white` |
| 中 | `bg-yellow-500/70 text-white` |
| 低 | `bg-emerald-500/70 text-white` |

---

## anime.js v4 在本專案中的使用方式

### 安裝
```
pnpm add animejs
```

### Import（v4 named exports，非 v3 default export）
```ts
import { animate, stagger, utils } from 'animejs';
```

### 常用 API 對照（v3 → v4）

| v3 | v4 |
|---|---|
| `anime({ targets, ... })` | `animate(element, { ... })` |
| `anime.stagger(n)` | `stagger(n, options?)` |
| `anime.random(min, max)` | `utils.random(min, max)` |
| `loop: true` | `loop: true`（相同） |
| `easing: 'linear'` | `easing: 'linear'`（相同） |

### 注意事項
- `animate()` 第一個參數為 **DOM element 或 NodeList**，不是 selector string
- 在 React 中必須透過 `useRef` + `useEffect` 取得 DOM 後再呼叫
- 動畫回傳值為 Animation 物件，可呼叫 `.pause()` / `.play()` / `.cancel()`
- Cleanup：在 `useEffect` return 中呼叫 `animation.cancel()` 避免 memory leak
