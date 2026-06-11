# 響應式全面翻新（階段 A / B / C）

> 合併自原 `10_UI_OVERHAUL_RESPONSIVE.md`、`11_responsive_appshell.md`、
> `12_stageB_content_responsive.md`、`13_stageC_visual_polish.md`，
> 並補上里程碑 [20_commercialization_ux_polish.md](../milestones/20_commercialization_ux_polish.md) 的收尾實作。
> 日期：2026-06-10

---

## 一、問題診斷

- 7 個頁面硬編 `max-w-md`（~448px），桌面呈現細欄飄空白。
- 自有頁面幾乎零 `sm:/md:/lg:` 斷點。
- 各頁重複 `min-h-screen + BackgroundAnimation + BottomNav` 外殼。

## 二、研究結論（導航光譜）

| 尺寸 | 導航 | 理由 |
|---|---|---|
| 手機 | 底部 Tab Bar | 拇指熱區 |
| 平板 ≥768px | 側邊 Rail | 善用寬度 |
| 桌面 ≥1024px | 完整 Sidebar | 常駐導航 + 寬內容 |

---

## 階段 A：響應式 AppShell ✅

**分支**：`claude-pro/ui-responsive`（PR #11）

- 新建 `AppShell` layout route：統一海洋背景、導航、內容容器。
- `Sidebar`：`≥md` 顯示；`BottomNav`：`md:hidden`。
- 7 頁移除外殼，只保留內容。
- 容器：`max-w-md md:max-w-3xl lg:max-w-4xl`（初版）。

**測試**：mobile 375 / tablet 768 / desktop 1280 三寬度；`vite build` 通過。

---

## 階段 B：內容區響應式 ✅（部分）

**分支**：`claude-pro/ui-responsive-stageB`

- **My Day 雙欄**：有逾期時 `lg:grid-cols-2` 並排逾期與今日；無逾期維持單欄。
- **標題字級階梯**：`text-2xl md:text-3xl`（6 個次要視圖）。

**里程碑 20 追加**：

- `AppShell` 加寬至 `lg:max-w-5xl xl:max-w-6xl`。
- My Day / Stats / Settings：`lg:text-4xl` 標題階梯。
- Stats / Settings：`lg:grid-cols-2` 多欄卡片。

---

## 階段 C：視覺精緻化 ✅（部分）

**分支**：`claude-pro/ui-polish`

- 全站 `:focus-visible` 海洋色焦點環（後續改為 `--focus-ring` 支援亮暗）。
- confetti 改海洋色票（`useConfetti.ts`）。

**里程碑 20 追加**：

- `.ocean-glass-panel` 語意玻璃卡片，隨主題 token 切換。
- 主視圖文字改 `.ocean-heading` / `.ocean-body`，亮色主題可讀。

---

## 驗證清單

1. `pnpm run build` 通過。
2. mobile：單欄 + 底部導航，無水平溢出。
3. desktop：側欄 + 寬內容，My Day 逾期雙欄（有資料時）。
4. 鍵盤 Tab：焦點環一致可見。

## 後續

- Kanban 桌面全寬 opt-out（若 4 欄仍覺窄）。
- TodoList / Calendar 等頁面多欄 grid（低優先）。
