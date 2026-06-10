# MyTodoList 產品與技術指南

> 本文件供新加入的開發者快速理解產品願景、技術決策與工作流程。最後更新：2026-06-11（遊戲化迭代 #2）

---

## 產品願景

MyTodoList 不只是待辦清單，而是**以海洋為主題的遊戲化生活管理 App**。使用者透過完成真實任務獲得經驗值與金幣，升級角色、裝飾專屬小屋，形成正向回饋循環，目標是達到可商業化的留存與付費潛力。

### 北極星指標
- 打開 App 三秒內知道今天該做什麼（My Day 首頁）
- 完成任務時有明確獎勵感（動畫 + XP + 慶祝）
- 長期使用有成長與收集動機（等級、商店、小屋）

---

## 決策紀錄

| 決策 | 狀態 | 內容 | 理由 |
|------|------|------|------|
| **UI 語言** | ✅ 已決 | **日文（日本語）** | 使用者指定商業化目標市場為日本；現有 My Day、設定頁已以日文為主，統一可降低認知負擔 |
| **主角類型** | ⏳ 預設 | 設定頁同時提供**動物 + 人類**選項 | 使用者尚未決定最終偏好；先保留雙軌，收集使用數據後再收斂 |
| **小屋視覺** | ✅ 已決 | 2.5D 精靈圖 + 分層視差 | 效能好、與現有海洋 PNG 一致、開發快（見下方取捨表） |
| **付費模式** | ⏳ TBD | 尚未實作任何真實付費 | 候選：裝飾內購、訂閱、買斷；迭代 #2 僅用遊戲內金幣，不接 Stripe / IAP |

### UI 語言規範
- **所有使用者可見字串**必須為日文
- 開發者註解、PM 文件可維持繁中
- **禁止在 UI 或資產中使用 emoji**（含問候語、空狀態、側欄品牌）

---

## 遊戲化設計

### 核心循環
```
完成任務 → 獲得 XP / 金幣 → 升級 / 解鎖 → 購買裝飾 → 自訂小屋 → 更高動機完成任務
```

### 已實作（迭代 #1 + #2）
| 功能 | 說明 |
|------|------|
| XP 系統 | 完成任務獲得經驗值，高優先度與逾期任務有加成 |
| 等級 | 依累積 XP 計算等級 |
| 金幣 | 完成任務獲得金幣，可在商店消費 |
| GameContext | 全域遊戲狀態，localStorage 持久化；含購買、裝備、主角設定 |
| LevelBadge UI | My Day 顯示等級、XP 進度條、金幣；快捷連結マイルーム / ショップ |
| **ShopPage** | 6 件裝飾骨架商品，金幣購買、已擁有判斷、自動裝備至槽位 |
| **HomePage** | 2.5D 透視房間預覽，4 個裝飾槽位 + 主角站立 |
| **LevelUpCelebration** | 升級全螢幕慶祝 + 多點 confetti（取代僅 toast） |
| **主角選擇** | 設定頁：6 種動物 + 4 種人類（人類暫用佔位符） |

### 規劃中
| 功能 | 說明 |
|------|------|
| 成就 | 連續天數、里程碑徽章 |
| 每日簽到 | 額外金幣與連續獎勵 |
| 裝備編輯 | 手動更換槽位裝飾（目前購買後自動裝備） |
| 真實美術 | 商店 / 小屋裝飾 PNG（見 asset-prompts.json） |
| 付費整合 | 待商業化決策後實作 |

### 主角與視覺風格取捨

| 方案 | 優點 | 缺點 | 建議階段 |
|------|------|------|----------|
| **2.5D 精靈圖** | 效能好、與現有海洋 PNG 一致、開發快 | 互動深度有限 | **現階段首選** |
| **可愛 3D（react-three-fiber）** | 沉浸感強、房間旋轉自由 | Bundle 大、行動裝置效能壓力、美術成本高 | 商業化 Phase 2 |
| **Live2D / Spine** | 角色表情豐富 | 需專用工具鏈、授權成本 | 有預算後考慮 |

---

## 動畫策略

### 技術棧
- **motion**（原 Framer Motion v12）：React 元件動畫、頁面過場、手勢
- **animejs**：海洋背景波浪與氣泡（`OceanBackground.tsx`）
- **Canvas confetti**：任務完成與升級慶祝粒子（`useConfetti.ts`）

### 設計原則
1. **尊重 `prefers-reduced-motion`**：`App.tsx` 已包 `MotionConfig reducedMotion="user"`
2. **有意義的動畫**：CRUD 各有不同過場
3. **彈簧物理**：按鈕與互動使用 spring
4. **共用 variants**：`src/app/utils/animations.ts`

### 動畫對照表
| 場景 | 效果 |
|------|------|
| 頁面切換 | 淡入 + 輕微上滑 + spring |
| 待辦完成 | confetti + XP toast |
| **升級** | 全螢幕慶祝 + 三波 confetti |
| 角色圖 | 漂浮 + 輕微搖擺 |

---

## 技術棧 rationale

| 選擇 | 原因 |
|------|------|
| React 18 + Vite | 快速 HMR、ESM 原生 |
| React Router 7 | lazy code split 次要頁面 |
| Tailwind CSS 4 | 設計 token 在 CSS 變數 |
| localStorage | 離線優先 PWA |
| motion 12 | 已安裝、API 穩定 |

---

## 資產管線

完整清單見 **`docs/asset-prompts.json`**。

### 命名慣例
- 檔名：英文小寫 + 連字號
- JSON 鍵：繁體中文物件名（與生成 prompt 對應）

---

## Git 工作流程

### 分支
- 主功能分支：`feature/gamification-foundation`
- 迭代 #2 在同一分支延續

### 提交慣例
- 每個邏輯單元一個 commit
- 不提交 `dist/`（除非部署需要）

---

## 目錄結構（遊戲化相關）

```
docs/
  asset-prompts.json
  PM_Guide.md
src/app/
  context/GameContext.tsx
  components/game/
    LevelBadge.tsx
    LevelUpCelebration.tsx
  data/
    shopCatalog.ts
    protagonists.ts
  pages/
    HomePage.tsx
    ShopPage.tsx
    SettingsPage.tsx   # 含主角選擇
  types/gamification.ts
  utils/gamification.ts
  utils/gameStorage.ts
  utils/animations.ts
```

---

## 導航（迭代 #2）

| 路由 | 標籤（日文） | 說明 |
|------|-------------|------|
| `/` | 今日 | My Day 首頁 |
| `/home` | マイルーム / ルーム | 2.5D 小屋預覽 |
| `/shop` | ショップ | 金幣商店 |
| `/settings` | 設定 | 含主人公選擇 |

手機 BottomNav：今日、ルーム、ショップ、リスト、設定（5 項）。カンバン / カレンダー / 統計 保留在 Sidebar（≥md）。

---

## 待使用者決策

1. **主角類型收斂**：動物 vs 人類 vs 雙軌長期並存？
2. **付費模式**：裝飾內購、訂閱去廣告、或買斷？
3. **人類主角美術**：探險家 / 潛水員 PNG 何時生成？

---

## 相關文件

- 歷史里程碑：`PM_Guide/pillars/`、`PM_Guide/milestones/`
- 設計規範：`PM_Guide/design/`
