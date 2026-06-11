# 角色插畫、空狀態與動態過場

> 合併自原 `14_real_creature_art.md`、`15_creature_empty_states.md`、
> `16_myday_celebration.md`、`17_page_transitions.md`。
> 日期：2026-06-10

---

## 1. 角色插畫改用原圖（14）

**問題**：手繪 SVG 臨摹參考圖品質差。

**方案**：建置前去背 PNG（`scripts/remove-bg.mjs`）+ `CreatureImage` 元件直接使用。

**檔案**：`src/app/components/creatures/CreatureImage.tsx`、`public/creatures/*.png`

---

## 2. 空狀態擴充（15）

**方案**：沿用 `EmptyStateWrapper` 版型。

| 頁面 | 角色 | 情境 |
|---|---|---|
| Archive | narwhal | 無已完成任務 |
| Stats | pufferfish (96px) | 分類統計為空 |

---

## 3. My Day 全完成慶祝（16）

**問題**：「無任務」與「全做完」共用同一空狀態。

**方案**：

- `todayTotal > 0` 且全完成 → 海豚 + 「今日のタスク、全部完了！」
- 無任務 → 海龜 + 「今日のタスクはありません」

---

## 4. 視圖切換過場（17）

**方案**：`AppShell` 內 `AnimatePresence mode="wait"` 包住 `Outlet`，
`pathname` 為 key，淡入 + 輕微上滑（0.25s）。

**檔案**：`src/app/components/AppShell.tsx`

---

## 與 a11y 的關係

- framer-motion：`MotionConfig reducedMotion="user"`（見 [pillars/07_accessibility.md](../pillars/07_accessibility.md)）。
- OceanBackground anime.js：另加 `prefers-reduced-motion` 守衛，靜態背景。
