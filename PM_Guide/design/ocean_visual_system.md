# 海洋視覺系統與設計 Token

> 合併自原 `03_design_tokens.md`、`claude_pro_ocean_theme.md`，
> 並更新里程碑 [20](../milestones/20_commercialization_ux_polish.md) 的亮/暗雙主題。
> 單一真實來源：`src/styles/index.css`

---

## 問題（初版）

- 頁面漸層在 8 個檔案硬編，微調易遺漏。
- 優先度色彩在 Kanban / AddTodoDialog drift（amber vs yellow）。
- shadcn `theme.css` 的 `.dark` 與海洋主題未整合。

## 方案演進

1. **PR #3**：`--ocean-gradient` + `priority.ts` SSOT。
2. **里程碑 20**：`:root`（亮色海洋）+ `.dark`（暗色海洋）完整 token；語意 utility class。

---

## CSS 變數一覽（`src/styles/index.css`）

### 海洋主色（亮 / 暗由選擇器切換）

| 變數 | 用途 |
|---|---|
| `--ocean-deep` / `--ocean-mid` / `--ocean-abyss` | 漸層與背景層次 |
| `--ocean-surface` / `--ocean-light` | 強調色、CTA、圖表 |
| `--ocean-wave-1` ~ `--ocean-wave-3` | OceanBackground SVG 波浪 |
| `--ocean-ray` / `--ocean-bubble` | 光線與氣泡 |
| `--ocean-gradient` | 全站頁面漸層 |

### 功能色

| 變數 | 用途 |
|---|---|
| `--coral` / `--coral-light` | 高優先度、強調 |
| `--seaweed` / `--seaweed-light` | 完成、低優先度 |
| `--glass-bg` / `--glass-border` | Glassmorphism 卡片 |
| `--text-primary` / `--text-secondary` / `--text-muted` | 語意文字色 |
| `--nav-bg` / `--nav-text` / `--nav-active-bg` | 導航列 |
| `--focus-ring` / `--chart-accent` / `--chart-muted` | a11y 焦點、圖表 |

### 語意 class

```css
.ocean-bg          /* 頁面漸層背景 */
.ocean-heading     /* 主標題文字 */
.ocean-body        /* 次要文字 */
.ocean-muted       /* 輔助文字 */
.ocean-glass-panel /* 玻璃卡片面板 */
```

---

## 主題切換

- `next-themes` + `ThemeProvider`（`defaultTheme="dark"`，`enableSystem`）。
- `index.html` inline script 防 FOUC。
- `OceanBackground` 全部色值改為 `var(--*)` 派生。

---

## 優先度 SSOT

仍見 `src/app/utils/priority.ts`：`PRIORITY_META` 供 Kanban 欄位、AddTodoDialog、標籤一致使用。

---

## 測試

1. 設定頁切換ライト/ダーク：漸層、文字、玻璃卡片應同步。
2. 亮色正文 `#0c4a6e`、暗色 `#f0f9ff` 對背景對比 ≥ 4.5:1。
3. `pnpm run build` 通過。
