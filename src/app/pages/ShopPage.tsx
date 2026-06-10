import { motion } from 'motion/react';
import { Store, Coins, Check, ShoppingBag } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { SHOP_ITEMS } from '../data/shopCatalog';
import { buttonMotionProps } from '../utils/animations';

export function ShopPage() {
  const { profile, purchaseItem } = useGame();

  return (
    <div>
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <Store size={32} className="text-[var(--ocean-surface)]" aria-hidden />
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold ocean-heading">ショップ</h1>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl ocean-glass-panel text-sm ocean-heading">
          <Coins size={16} className="text-amber-400" />
          {profile.coins}
        </div>
      </div>

      <p className="text-sm ocean-body mb-6">
        タスクを完了して集めたコインで、部屋の装飾を購入できます。
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SHOP_ITEMS.map((item, index) => {
          const owned = profile.ownedItems.includes(item.id);
          const canAfford = profile.coins >= item.price;

          return (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="ocean-glass-panel p-5 flex flex-col"
            >
              <div
                className="h-24 rounded-xl mb-4 flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(14,165,233,0.12), rgba(16,185,129,0.08))',
                  border: '1px solid rgba(14,165,233,0.15)',
                }}
              >
                <ShoppingBag size={32} className="text-sky-400/70" aria-hidden />
              </div>

              <h2 className="font-semibold ocean-heading mb-1">{item.nameJa}</h2>
              <p className="text-xs ocean-body mb-3 flex-1">{item.descriptionJa}</p>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium flex items-center gap-1 ocean-heading">
                  <Coins size={14} className="text-amber-400" />
                  {item.price}
                </span>

                {owned ? (
                  <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                    <Check size={14} />
                    所持済み
                  </span>
                ) : (
                  <motion.button
                    type="button"
                    {...buttonMotionProps}
                    disabled={!canAfford}
                    onClick={() => purchaseItem(item.id)}
                    className="px-4 py-2 rounded-xl text-xs font-medium transition-opacity disabled:opacity-40"
                    style={{
                      background: 'linear-gradient(135deg, rgba(14,165,233,0.35), rgba(16,185,129,0.25))',
                      border: '1px solid rgba(14,165,233,0.3)',
                    }}
                  >
                    購入
                  </motion.button>
                )}
              </div>
            </motion.article>
          );
        })}
      </div>
    </div>
  );
}
