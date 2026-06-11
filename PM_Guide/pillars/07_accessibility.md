# 可訪問性 A11y

> 合併自原 `07_accessibility.md`、`18_reduced_motion.md`、`19_oceanbg_reduced_motion.md`，
> 並補里程碑 [20](../milestones/20_commercialization_ux_polish.md) 的 WCAG 收尾。
> 對應設計章程支柱 6。

---

## 問題陳述

1. `<html lang="en">` 但 UI 為日文 → 已改 `lang="ja"`。
2. 圖標按鈕缺可存取名稱 → `aria-label`。
3. 底部導航缺 `aria-current` → 已補。
4. 大量動畫未尊重 `prefers-reduced-motion`。
5. 焦點環依賴瀏覽器預設，與主題不一致。
6. 看板整卡點擊完成，鍵盤使用者難以改優先度。

---

## 方案與實作

### 螢幕閱讀器與語意

| 檔案 | 修改 |
|---|---|
| `index.html` | `lang="ja"` |
| `MyDayPage.tsx` | Folder / Plus / Pencil `aria-label` |
| `TodoCompleteButton.tsx` | `aria-label="完了にする"` |
| `BottomNav.tsx` | `aria-label`、`aria-current="page"`、`aria-label` on `<nav>` |
| `Sidebar.tsx` | `aria-label="メインナビゲーション"` |
| `VoiceInputButton.tsx` | 錄音/停止/處理狀態 `aria-label` |

### 減少動態（18 + 19）

- **framer-motion**：`App.tsx` 根層 `<MotionConfig reducedMotion="user">`。
- **anime.js 背景**：`OceanBackground` 偵測 `prefers-reduced-motion: reduce` 時不啟動動畫。

### 焦點與鍵盤（13 + 20）

- 全站 `:focus-visible { outline: 2px solid var(--focus-ring); }`。
- 亮/暗主題各自設定 `--focus-ring` 確保對比。
- **看板**：優先度切換按鈕 +「完了にする」獨立按鈕（`KanbanPage.tsx`）。
- **設定頁**：主題 `role="radiogroup"` + `aria-checked`。

### 對比度（里程碑 20）

| 主題 | 正文 | 背景 | 目標 |
|---|---|---|---|
| 亮色 | `#0c4a6e` | `#e0f7ff` 漸層 | ≥ 4.5:1 |
| 暗色 | `#f0f9ff` | `#0a1628` 漸層 | ≥ 4.5:1 |

語意色改為 `--text-primary` 等 token，避免硬編 `text-sky-50` 在亮色下不可讀。

---

## 如何測試

1. `pnpm run build` 通過。
2. VoiceOver / TalkBack：圖標按鈕念出日文名稱。
3. 系統開啟「減少動態」：過場與背景動畫停止或大幅減弱。
4. 僅鍵盤 Tab：焦點環可見；看板可改優先度並完成任務。
5. 設定頁切換主題後文字仍清晰可讀。

---

## 後續

- AddTodoDialog 焦點陷阱與 Esc 行為（Radix 內建，待 E2E 確認）。
- 全站 `text-sky-*` 硬編逐步遷移至語意 class（低優先）。
