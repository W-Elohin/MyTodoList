import type { GameProfile } from '../types/gamification';
import { createDefaultProfile, levelFromXp } from './gamification';

const GAME_KEY = 'gameProfile';

function isGameProfile(value: unknown): value is GameProfile {
  if (typeof value !== 'object' || value === null) return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.xp === 'number' &&
    typeof p.coins === 'number' &&
    typeof p.level === 'number' &&
    typeof p.protagonist === 'object' &&
    Array.isArray(p.ownedItems)
  );
}

function safeRead(): GameProfile {
  try {
    const raw = localStorage.getItem(GAME_KEY);
    if (!raw) return createDefaultProfile();
    const parsed: unknown = JSON.parse(raw);
    if (!isGameProfile(parsed)) {
      console.warn('[gameStorage] 資料格式不符，已回退至預設值');
      return createDefaultProfile();
    }
    // 確保 level 與 xp 一致（防止手動改 localStorage 後不同步）
    return { ...parsed, level: levelFromXp(parsed.xp) };
  } catch {
    return createDefaultProfile();
  }
}

function safeWrite(profile: GameProfile): void {
  try {
    localStorage.setItem(GAME_KEY, JSON.stringify(profile));
  } catch (err) {
    console.error('[gameStorage] 寫入失敗', err);
  }
}

export const gameStorage = {
  getProfile(): GameProfile {
    return safeRead();
  },

  saveProfile(profile: GameProfile): void {
    safeWrite(profile);
  },

  reset(): void {
    safeWrite(createDefaultProfile());
  },
};
