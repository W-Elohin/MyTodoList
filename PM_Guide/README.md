# PM_Guide 文件索引

產品決策、功能實作紀錄與 agent 任務檔案的統一入口。
每份支柱文件含：**問題 → 考慮過的方案 → 選定與理由 → 實作 → 測試**。

---

## 起點

| 文件 | 說明 |
|---|---|
| [00_DESIGN_CHARTER.md](00_DESIGN_CHARTER.md) | 產品北極星、資訊架構、研究依據（最高指導原則） |
| [milestones/overnight_summary.md](milestones/overnight_summary.md) | 2026-06-09 整夜自主開發總結 |
| [milestones/20_commercialization_ux_polish.md](milestones/20_commercialization_ux_polish.md) | 商用化體驗收尾（亮暗主題、設定頁、a11y、RWD） |

---

## pillars/ — 功能支柱決策（01–09）

| # | 文件 | 主題 |
|---|---|---|
| 01 | [pillars/01_robustness_storage_errorboundary.md](pillars/01_robustness_storage_errorboundary.md) | Storage 容錯 + ErrorBoundary |
| 02 | [pillars/02_ia_myday_primary.md](pillars/02_ia_myday_primary.md) | My Day 設為主角、逾期浮現 |
| 03 | [pillars/03_design_tokens.md](pillars/03_design_tokens.md) | 漸層與優先度 SSOT（初版） |
| 04 | [pillars/04_completion_feedback.md](pillars/04_completion_feedback.md) | 完成反饋（confetti + 觸覺） |
| 05 | [pillars/05_smart_focus.md](pillars/05_smart_focus.md) | 智慧聚焦排序 |
| 06 | [pillars/06_performance_codesplit.md](pillars/06_performance_codesplit.md) | 路由分割、vendor 快取 |
| 07 | [pillars/07_accessibility.md](pillars/07_accessibility.md) | 可訪問性（lang、aria、減少動態、焦點環） |
| 08 | [pillars/08_data_backup_hardening.md](pillars/08_data_backup_hardening.md) | 備份匯入驗證 |
| 09 | [pillars/09_unify_completion.md](pillars/09_unify_completion.md) | 各視圖統一完成體驗 |

---

## design/ — 視覺與佈局

| 文件 | 說明 |
|---|---|
| [design/ocean_visual_system.md](design/ocean_visual_system.md) | 海洋色票、Glass、亮/暗 token（合併原 03 參考 + ocean_theme） |
| [design/responsive_overhaul.md](design/responsive_overhaul.md) | 響應式 AppShell 階段 A/B/C（合併原 10–13） |
| [design/creature_and_motion.md](design/creature_and_motion.md) | 角色插畫、空狀態、慶祝、頁面過場（合併原 14–17） |

---

## agents/ — 多 Agent 任務紀錄

| 文件 | 說明 |
|---|---|
| [agents/task_log.md](agents/task_log.md) | Cursor / Claude / Codex 各分支任務摘要 |
| [agents/prompts.md](agents/prompts.md) | 歷史 agent 完整開發指示（索引） |

---

## 目錄結構

```
PM_Guide/
├── README.md                 ← 本索引
├── 00_DESIGN_CHARTER.md
├── pillars/                  ← 01–09 功能支柱
├── design/                   ← 視覺、RWD、動畫
├── milestones/               ← 里程碑與階段總結
└── agents/                   ← 多 agent 任務與 prompt
```
