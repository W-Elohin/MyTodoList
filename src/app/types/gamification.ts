/** 主角類型：動物（海洋主題）或人類（探險家） */
export type ProtagonistType = 'animal' | 'human';

export interface ProtagonistConfig {
  type: ProtagonistType;
  /** 動物：dolphin / turtle 等；人類：boy_explorer / girl_explorer 等 */
  variant: string;
  name?: string;
}

export interface GameProfile {
  xp: number;
  coins: number;
  level: number;
  protagonist: ProtagonistConfig;
  /** 已擁有的商店物品 ID */
  ownedItems: string[];
  /** 小屋裝飾槽位 → 物品 ID */
  equippedHome: Record<string, string>;
  totalTasksCompleted: number;
  /** 連續完成天數（規劃用） */
  streakDays: number;
  lastActiveDate?: string;
}

export interface CompletionReward {
  xp: number;
  coins: number;
  leveledUp: boolean;
  newLevel?: number;
}
