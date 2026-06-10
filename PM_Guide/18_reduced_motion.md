# 尊重「減少動態」偏好（a11y）

> 對應可訪問性支柱。前庭敏感使用者開啟系統「減少動態」時，大量動畫可能造成不適。
> 分支：`claude-pro/reduced-motion`
> 日期：2026-06-10

## 問題
全站有許多 motion 動畫（漂浮角色、過場、背景、完成反饋）。未尊重作業系統的
`prefers-reduced-motion: reduce`，對前庭敏感使用者不友善。

## 方案
在 App 根層以 `<MotionConfig reducedMotion="user">` 包住全站——所有 framer-motion
元件自動遵守使用者偏好（開啟減少動態時，位移/縮放動畫被抑制，僅保留必要的透明度變化）。
單一處設定、零各元件改動。

## 測試
1. `npx vite build` 通過。
2. 系統開啟「減少動態」後 `npm run dev`：漂浮/過場等位移動畫應停止或大幅減弱。

## 後續
- 純 CSS 動畫（如 OceanBackground 的 anime.js、CSS keyframes）不受 MotionConfig 管轄，
  可後續加 `@media (prefers-reduced-motion: reduce)` 一併處理。
