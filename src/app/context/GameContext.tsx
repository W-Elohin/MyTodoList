import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import type { Todo } from '../types';
import type { CompletionReward, GameProfile } from '../types/gamification';
import { calculateCompletionReward, levelFromXp } from '../utils/gamification';
import { gameStorage } from '../utils/gameStorage';

interface GameContextValue {
  profile: GameProfile;
  awardCompletion: (todo: Todo) => CompletionReward;
  refresh: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<GameProfile>(() => gameStorage.getProfile());

  const refresh = useCallback(() => {
    setProfile(gameStorage.getProfile());
  }, []);

  const awardCompletion = useCallback((todo: Todo): CompletionReward => {
    const current = gameStorage.getProfile();
    const reward = calculateCompletionReward(todo, current);

    const updated: GameProfile = {
      ...current,
      xp: current.xp + reward.xp,
      coins: current.coins + reward.coins,
      level: levelFromXp(current.xp + reward.xp),
      totalTasksCompleted: current.totalTasksCompleted + 1,
    };

    gameStorage.saveProfile(updated);
    setProfile(updated);

    toast.success(`+${reward.xp} 經驗值 · +${reward.coins} 金幣`, { duration: 2000 });

    if (reward.leveledUp && reward.newLevel) {
      toast.success(`升級了！等級 ${reward.newLevel}`, { duration: 3500 });
    }

    return reward;
  }, []);

  const value = useMemo(
    () => ({ profile, awardCompletion, refresh }),
    [profile, awardCompletion, refresh]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame 必須在 GameProvider 內使用');
  return ctx;
}
