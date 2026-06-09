import { Todo } from '../types';

export type Priority = NonNullable<Todo['priority']>; // 'low' | 'medium' | 'high'

/**
 * 優先度的單一真實來源。
 * 標籤與配色原本散落於 AddTodoDialog / KanbanPage / Archive / TodoList，
 * 各自硬編紅/黃/綠的 Tailwind class。集中於此確保語意一致、好維護。
 *
 * 配色語意對齊設計章程：高=紅（警示）、中=黃、低=海藻綠（success 色系）。
 */
export interface PriorityMeta {
  /** 日文短標籤（高 / 中 / 低） */
  label: string;
  /** 選中態實心徽章 class */
  activeClass: string;
  /** 看板欄位 / 點綴用的純色 badge class */
  badgeClass: string;
  /** 看板欄位淡背景（rgba 字串，供 inline style 使用） */
  columnBg: string;
}

export const PRIORITY_META: Record<Priority, PriorityMeta> = {
  high: {
    label: '高',
    activeClass: 'bg-red-500/80 text-white',
    badgeClass: 'bg-red-500',
    columnBg: 'rgba(239,68,68,0.1)',
  },
  medium: {
    label: '中',
    activeClass: 'bg-amber-500/80 text-white',
    badgeClass: 'bg-amber-500',
    columnBg: 'rgba(245,158,11,0.1)',
  },
  low: {
    label: '低',
    activeClass: 'bg-emerald-500/80 text-white',
    badgeClass: 'bg-emerald-500',
    columnBg: 'rgba(16,185,129,0.1)',
  },
};

/** 由低到高的順序，供選擇器一致排列 */
export const PRIORITY_ORDER: Priority[] = ['low', 'medium', 'high'];

export function getPriorityMeta(p: Priority): PriorityMeta {
  return PRIORITY_META[p];
}
