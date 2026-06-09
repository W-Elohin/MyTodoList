import { Todo } from '../types';

/**
 * 智慧聚焦排序 — 算出「現在最該做的事」。
 *
 * 設計章程北極星：打開 App 三秒內知道現在該做什麼。
 * 與其讓使用者自己掃描整份清單，由系統依明確、可解釋的規則排序並推薦。
 *
 * 排序規則（由重到輕，皆為可解釋的確定性邏輯，非黑箱）：
 *   1. 逾期優先：date < today 的未完成任務最該先處理。
 *   2. 優先度：high > medium > low > 未設定。
 *   3. 時間：同優先度下，較早的時間先做。
 *   4. 建立時間：最後以 createdAt 穩定排序，確保結果可重現。
 */

const PRIORITY_WEIGHT: Record<NonNullable<Todo['priority']>, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

function priorityWeight(p?: Todo['priority']): number {
  return p ? PRIORITY_WEIGHT[p] : 0;
}

export interface RankableContext {
  /** 今日日期字串 YYYY-MM-DD */
  today: string;
}

/** 兩個任務的比較子：回傳負值代表 a 更該先做 */
export function compareByFocus(a: Todo, b: Todo, ctx: RankableContext): number {
  const aOverdue = a.date < ctx.today ? 1 : 0;
  const bOverdue = b.date < ctx.today ? 1 : 0;
  if (aOverdue !== bOverdue) return bOverdue - aOverdue; // 逾期者排前

  const pw = priorityWeight(b.priority) - priorityWeight(a.priority);
  if (pw !== 0) return pw; // 高優先度排前

  if (a.time !== b.time) return a.time < b.time ? -1 : 1; // 較早時間排前

  return a.createdAt - b.createdAt; // 穩定排序
}

/**
 * 從未完成任務中取出焦點清單（預設前 3 件）。
 * 只考慮「今日與逾期」的未完成任務 —— 未來的任務不該佔據今日焦點。
 */
export function getFocusTasks(todos: Todo[], today: string, limit = 3): Todo[] {
  return todos
    .filter((t) => !t.completed && t.date <= today)
    .sort((a, b) => compareByFocus(a, b, { today }))
    .slice(0, limit);
}
