# OceanBackground 尊重減少動態（補齊 a11y）

> 接續 PM_Guide 18：MotionConfig 只管 framer-motion，anime.js 背景動畫需另外處理。
> 分支：`claude-pro/oceanbg-reduced-motion`
> 日期：2026-06-10

## 問題
OceanBackground 用 anime.js 驅動波浪/氣泡/光線動畫，不受 App 層 MotionConfig 管轄。
前庭敏感使用者開啟「減少動態」時，這些持續動畫仍會播放。

## 方案
在 `OceanBackground` 的 `useEffect` 開頭加守衛：偵測
`window.matchMedia('(prefers-reduced-motion: reduce)').matches` 為真時直接 return，
不啟動任何 anime.js 動畫——背景維持靜態 SVG（仍有海洋漸層與波浪造型，只是不動）。

## 測試
1. `npx vite build` 通過。
2. 系統開啟「減少動態」後 `npm run dev`：背景波浪/氣泡/光線應靜止；關閉則照常律動。

## 後續
- a11y 動畫治理至此涵蓋 framer-motion（#18）與 anime.js（本次）兩大來源。
