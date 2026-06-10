# 視圖切換過場動畫

> 對應整體質感提升（Duolingo 級的流暢感）。
> 分支：`claude-pro/page-transitions`
> 日期：2026-06-10

## 問題
切換視圖（今日/清單/看板/…）是硬切，缺乏流暢過場，質感不足。

## 方案
在 AppShell（單一處）以 `AnimatePresence mode="wait"` 包住 `Outlet`，
以 `location.pathname` 為 key，進場淡入+上滑、離場淡出+上滑（0.25s easeOut）。
集中於佈局層，各頁零改動、低風險。

## 測試
1. `npx vite build` 通過。
2. `npm run dev`：切換底部導航/側邊欄項目，內容應平滑淡入切換。

## 後續
- 可依方向做左右滑動（需判斷導航前後關係），目前統一上滑即可。
