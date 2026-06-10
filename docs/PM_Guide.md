# MyTodoList 產品與技術指南

> 本文件供新加入的開發者快速理解產品願景、技術決策與工作流程。最後更新：2026-06-10（遊戲化基礎迭代）

---

## 產品願景

MyTodoList 不只是待辦清單，而是**以海洋為主題的遊戲化生活管理 App**。使用者透過完成真實任務獲得經驗值與金幣，升級角色、裝飾專屬小屋，形成正向回饋循環，目標是達到可商業化的留存與付費潛力。

### 北極星指標
- 打開 App 三秒內知道今天該做什麼（My Day 首頁）
- 完成任務時有明確獎勵感（動畫 + XP + 慶祝）
- 長期使用有成長與收集動機（等級、商店、小屋）

---

## 遊戲化設計

### 核心循環
```
完成任務 → 獲得 XP / 金幣 → 升級 / 解鎖 → 購買裝飾 → 自訂小屋 → 更高動機完成任務
```

### 已實作（本迭代）
| 功能 | 說明 |
|------|------|
| XP 系統 | 完成任務獲得經驗值，高優先度與逾期任務有加成 |
| 等級 | 依累積 XP 計算等級，升級時 toast 提示 |
| 金幣 | 完成任務獲得金幣，為未來商店預留 |
| GameContext | 全域遊戲狀態，localStorage 持久化 |
| LevelBadge UI | My Day 頁面顯示等級、XP 進度條、金幣 |

### 規劃中
| 功能 | 說明 |
|------|------|
| 主角選擇 | 動物或人類，使用者尚未決定偏好 |
| 小屋系統 | 2.5D 房間，放置已購買裝飾 |
| 商店 | 用金幣購買裝飾與服裝 |
| 成就 | 連續天數、里程碑徽章 |
| 每日簽到 | 額外金幣與連續獎勵 |

### 主角與視覺風格取捨

| 方案 | 優點 | 缺點 | 建議階段 |
|------|------|------|----------|
| **2.5D 精靈圖** | 效能好、與現有海洋 PNG 一致、開發快 | 互動深度有限 | **現階段首選** |
| **可愛 3D（react-three-fiber）** | 沉浸感強、房間旋轉自由 | Bundle 大、行動裝置效能壓力、美術成本高 | 商業化 Phase 2 |
| **Live2D / Spine** | 角色表情豐富 | 需專用工具鏈、授權成本 | 有預算後考慮 |

**決策**：先以 2.5D 精靈圖 + 分層視差建立小屋，驗證遊戲循環後再評估 3D。

---

## 動畫策略

### 技術棧
- **motion**（原 Framer Motion v12）：React 元件動畫、頁面過場、手勢
- **animejs**：海洋背景波浪與氣泡（`OceanBackground.tsx`）
- **Canvas confetti**：任務完成慶祝粒子（`useConfetti.ts`）

### 設計原則
1. **尊重 `prefers-reduced-motion`**：`App.tsx` 已包 `MotionConfig reducedMotion="user"`
2. **有意義的動畫**：CRUD 各有不同過場（新增彈入、完成縮放消失、刪除滑出）
3. **彈簧物理**：按鈕與互動使用 spring，比線性 ease 更有質感
4. **共用 variants**：`src/app/utils/animations.ts` 統一過場常數，避免各頁重複定義

### 動畫對照表
| 場景 | 效果 |
|------|------|
| 頁面切換 | 淡入 + 輕微上滑 + spring |
| 待辦新增 | 彈簧 scale + slide up |
| 待辦完成 | 勾選描邊 + 項目 scale 縮小淡出 |
| 待辦刪除 | 向右滑出 + 淡出 |
| 按鈕 | hover scale 1.03、tap scale 0.94 |
| 角色圖 | 漂浮 + 輕微搖擺 |
| 升級 | toast + confetti |

---

## 技術棧 rationale

| 選擇 | 原因 |
|------|------|
| React 18 + Vite | 快速 HMR、ESM 原生、與現有程式碼一致 |
| React Router 7 | 檔案式路由、lazy code split 次要頁面 |
| Tailwind CSS 4 | 設計 token 在 CSS 變數，主題切換方便 |
| localStorage | 離線優先 PWA，無後端時零成本持久化 |
| motion 12 | 已安裝、API 穩定、與 React 19 相容 |

---

## 資產管線

### 資產清單
完整清單見 **`docs/asset-prompts.json`**，依類別分組（僅物件名稱，供 ChatGPT 等工具生成圖像）。

### 生成流程（建議）
1. 從 `asset-prompts.json` 選取類別
2. 用 ChatGPT / DALL-E 生成透明 PNG（角色、裝飾）或 SVG（UI 圖示）
3. 角色圖去背 → 放入 `src/assets/creatures/` 或 `src/assets/game/`
4. 執行 `scripts/remove-bg.mjs`（若需要）
5. 在 `CreatureImage` 或新元件中引用

### 命名慣例
- 檔名：英文小寫 + 連字號，如 `coral-lamp.png`
- JSON 鍵：繁體中文物件名（與生成 prompt 對應）

---

## Git 工作流程

### 分支命名
```
feature/<功能簡述>     新功能（例：feature/gamification-foundation）
fix/<問題簡述>         Bug 修復
docs/<文件簡述>        僅文件變更
refactor/<範圍>        重構
```

### 提交慣例
- 每個邏輯單元一個 commit，訊息用英文或繁中皆可，說明「為什麼」
- 不提交 `dist/`（建置產物）除非部署需要
- 不提交 `.env` 或密鑰

### 本功能分支
- 分支：`feature/gamification-foundation`
- 從 `main` 分出，完成後 PR 合併

---

## 目錄結構（遊戲化相關）

```
docs/
  asset-prompts.json    # 資產生成清單
  PM_Guide.md           # 本文件
src/app/
  context/GameContext.tsx
  components/game/LevelBadge.tsx
  types/gamification.ts
  utils/gamification.ts
  utils/gameStorage.ts
  utils/animations.ts
```

---

## 待使用者決策

1. **主角類型**：動物（延續海洋主題）還是人類（探險家）？或兩者都提供？
2. **語言**：目前 UI 混用日文與中文，商業化前是否統一為繁體中文？
3. **付費模式**：裝飾內購、訂閱去廣告、或買斷？

---

## 相關文件

- 歷史里程碑：`PM_Guide/pillars/`、`PM_Guide/milestones/`
- 設計規範：`PM_Guide/design/`
