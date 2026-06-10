import type { Todo } from '../types';
import type { CompletionReward, GameProfile } from '../types/gamification';

const XP_BASE = 10;
const COINS_BASE = 5;

/** 升級所需累積 XP：level N 需要 N² × 50 */
export function xpForLevel(level: number): number {
  return level * level * 50;
}

/** 由累積 XP 推算等級 */
export function levelFromXp(xp: number): number {
  let level = 1;
  while (xp >= xpForLevel(level + 1)) {
    level++;
  }
  return level;
}

/** 目前等級內的 XP 進度（0–1） */
export function xpProgressInLevel(xp: number, level: number): number {
  const currentThreshold = xpForLevel(level);
  const nextThreshold = xpForLevel(level + 1);
  const range = nextThreshold - currentThreshold;
  if (range <= 0) return 1;
  return Math.min(1, Math.max(0, (xp - currentThreshold) / range));
}

/** 計算單次完成任務的獎勵 */
export function calculateCompletionReward(todo: Todo, profile: GameProfile): CompletionReward {
  let xp = XP_BASE;
  let coins = COINS_BASE;

  if (todo.priority === 'high') {
    xp += 5;
    coins += 5;
  } else if (todo.priority === 'medium') {
    xp += 2;
    coins += 2;
  }

  const today = new Date().toISOString().slice(0, 10);
  if (todo.date < today) {
    xp += 3;
    coins += 3;
  }

  const oldLevel = profile.level;
  const newXp = profile.xp + xp;
  const newLevel = levelFromXp(newXp);

  return {
    xp,
    coins,
    leveledUp: newLevel > oldLevel,
    newLevel: newLevel > oldLevel ? newLevel : undefined,
  };
}

export function createDefaultProfile(): GameProfile {
  return {
    xp: 0,
    coins: 0,
    level: 1,
    protagonist: { type: 'animal', variant: 'dolphin' },
    ownedItems: [],
    equippedHome: {},
    totalTasksCompleted: 0,
    streakDays: 0,
  };
}
