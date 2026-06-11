# 多 Agent 任務紀錄

> 合併自各 `*_pro_*.md` 任務檔。完整技術細節見各分支 commit 與對應 pillars/design 文件。

---

## Cursor Pro

| 分支 | 主題 | 狀態 | 摘要 |
|---|---|---|---|
| `cursor-pro/feature-my-day` | My Day 專注視圖 | ✅ | `MyDayPage`、路由、BottomNav「今日」 |
| `cursor-pro/feature-ocean-ui-polish` | 海洋 UI + 表單改造 | ✅ | SVG 插畫、AddTodoDialog 重構、微互動 |
| `cursor-pro/feature-voice-ui-repeat-search` | 語音 UI + 重複 + 搜尋 | ✅ | `VoiceInputButton`、recurrence、SearchBar、FilterChips |

**關鍵檔案**：`VoiceInputButton.tsx`、`SearchBar.tsx`、`FilterChips.tsx`、`utils/recurrence.ts`

---

## Claude Pro

| 分支 | 主題 | 狀態 | 摘要 |
|---|---|---|---|
| `claude-pro/feature-tags` | 多重標籤 | ✅ | `Todo.tags[]`、AddTodoDialog 多選 |
| `claude-pro/*` (整夜 loop) | 支柱 01–09 | ✅ | 見 [overnight_summary](../milestones/overnight_summary.md) |
| `claude-pro/ui-responsive` | 響應式 AppShell | ✅ | 見 [responsive_overhaul](../design/responsive_overhaul.md) |
| `claude-pro/real-creature-art` | 角色 PNG | ✅ | 見 [creature_and_motion](../design/creature_and_motion.md) |
| `claude-pro/*` (voice) | Whisper Worker + 子任務 | ✅ | `whisper.worker.ts`、`SubTaskList` |

**關鍵檔案**：`workers/whisper.worker.ts`、`hooks/useWhisper.ts`、`components/SubTaskList.tsx`

---

## Codex Pro

| 分支 | 主題 | 狀態 | 摘要 |
|---|---|---|---|
| `codex-pro/feature-priority` | 優先度系統 | ✅ | `priority` 欄位、三色按鈕、各視圖標籤 |
| `codex-pro/*` | Kanban + Stats + 提醒 | ✅ | `KanbanPage`、`StatsPage`、`statsCalculator.ts`、`reminder.ts` |

---

## Cursor（里程碑 20）

| 主題 | 狀態 | 文件 |
|---|---|---|
| 商用化體驗收尾 | ✅ | [20_commercialization_ux_polish](../milestones/20_commercialization_ux_polish.md) |
