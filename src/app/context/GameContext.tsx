import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { toast } from 'sonner';
import type { Todo } from '../types';
import type { CompletionReward, GameProfile, ProtagonistConfig } from '../types/gamification';
import { getShopItem } from '../data/shopCatalog';
import { calculateCompletionReward, levelFromXp } from '../utils/gamification';
import { gameStorage } from '../utils/gameStorage';

interface GameContextValue {
  profile: GameProfile;
  awardCompletion: (todo: Todo) => CompletionReward;
  refresh: () => void;
  purchaseItem: (itemId: string) => boolean;
  equipItem: (slotId: string, itemId: string | null) => void;
  setProtagonist: (config: ProtagonistConfig) => void;
  pendingLevelUp: number | null;
  clearLevelUp: () => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<GameProfile>(() => gameStorage.getProfile());
  const [pendingLevelUp, setPendingLevelUp] = useState<number | null>(null);

  const refresh = useCallback(() => {
    setProfile(gameStorage.getProfile());
  }, []);

  const clearLevelUp = useCallback(() => {
    setPendingLevelUp(null);
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

    toast.success(`+${reward.xp} XP · +${reward.coins} コイン`, { duration: 2000 });

    if (reward.leveledUp && reward.newLevel) {
      setPendingLevelUp(reward.newLevel);
    }

    return reward;
  }, []);

  const purchaseItem = useCallback((itemId: string): boolean => {
    const item = getShopItem(itemId);
    if (!item) {
      toast.error('商品が見つかりません');
      return false;
    }

    const current = gameStorage.getProfile();
    if (current.ownedItems.includes(itemId)) {
      toast.info('すでに所持しています');
      return false;
    }
    if (current.coins < item.price) {
      toast.error('コインが足りません');
      return false;
    }

    const updated: GameProfile = {
      ...current,
      coins: current.coins - item.price,
      ownedItems: [...current.ownedItems, itemId],
    };

    if (item.slotId && !updated.equippedHome[item.slotId]) {
      updated.equippedHome = { ...updated.equippedHome, [item.slotId]: itemId };
    }

    gameStorage.saveProfile(updated);
    setProfile(updated);
    toast.success(`${item.nameJa} を購入しました`);
    return true;
  }, []);

  const equipItem = useCallback((slotId: string, itemId: string | null) => {
    const current = gameStorage.getProfile();
    const equippedHome = { ...current.equippedHome };

    if (itemId) {
      if (!current.ownedItems.includes(itemId)) return;
      equippedHome[slotId] = itemId;
    } else {
      delete equippedHome[slotId];
    }

    const updated = { ...current, equippedHome };
    gameStorage.saveProfile(updated);
    setProfile(updated);
  }, []);

  const setProtagonist = useCallback((config: ProtagonistConfig) => {
    const current = gameStorage.getProfile();
    const updated = { ...current, protagonist: config };
    gameStorage.saveProfile(updated);
    setProfile(updated);
    toast.success('主人公を変更しました');
  }, []);

  const value = useMemo(
    () => ({
      profile,
      awardCompletion,
      refresh,
      purchaseItem,
      equipItem,
      setProtagonist,
      pendingLevelUp,
      clearLevelUp,
    }),
    [profile, awardCompletion, refresh, purchaseItem, equipItem, setProtagonist, pendingLevelUp, clearLevelUp]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame は GameProvider 内で使用してください');
  return ctx;
}
