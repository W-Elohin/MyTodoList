import { useMemo } from 'react';
import { motion } from 'motion/react';
import { Home, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router';
import { CreatureImage } from '../components/creatures/CreatureImage';
import { useGame } from '../context/GameContext';
import { HOME_SLOTS, getShopItem } from '../data/shopCatalog';
import { isCreatureVariant } from '../data/protagonists';
import { gentleSpring } from '../utils/animations';

function HumanProtagonistPlaceholder({ variant }: { variant: string }) {
  const isBoy = variant.includes('boy');
  return (
    <motion.div
      className="rounded-full flex items-center justify-center font-bold text-2xl ocean-heading"
      style={{
        width: 100,
        height: 100,
        background: isBoy
          ? 'linear-gradient(135deg, rgba(14,165,233,0.4), rgba(59,130,246,0.3))'
          : 'linear-gradient(135deg, rgba(16,185,129,0.35), rgba(52,211,153,0.25))',
        border: '2px solid rgba(255,255,255,0.2)',
      }}
      animate={{ y: [0, -8, 0] }}
      transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
    >
      {isBoy ? '探' : '冒'}
    </motion.div>
  );
}

export function HomePage() {
  const { profile } = useGame();
  const navigate = useNavigate();
  const { protagonist, equippedHome } = profile;

  const slotItems = useMemo(
    () =>
      HOME_SLOTS.map((slot) => ({
        slot,
        item: equippedHome[slot.id] ? getShopItem(equippedHome[slot.id]) : undefined,
      })),
    [equippedHome]
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <Home size={32} className="text-[var(--ocean-surface)]" aria-hidden />
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold ocean-heading">マイルーム</h1>
        </div>
        <button
          type="button"
          onClick={() => navigate('/shop')}
          className="text-xs px-3 py-1.5 rounded-xl border border-white/15 hover:bg-white/5 transition-colors ocean-body"
        >
          ショップへ
        </button>
      </div>

      {/* 2.5D 房間預覽：透視地板 + 分層視差 */}
      <motion.div
        className="relative mx-auto mb-6 rounded-2xl overflow-hidden"
        style={{ perspective: '800px', maxWidth: 480, aspectRatio: '4/3' }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={gentleSpring}
      >
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, #0c4a6e 0%, #164e63 45%, #134e4a 100%)',
          }}
        />

        {/* 後牆 */}
        <motion.div
          className="absolute left-[8%] right-[8%] top-[8%] h-[42%] rounded-t-lg"
          style={{
            background: 'linear-gradient(180deg, rgba(186,230,253,0.15), rgba(14,165,233,0.08))',
            border: '1px solid rgba(255,255,255,0.12)',
            transform: 'rotateX(2deg)',
          }}
          animate={{ opacity: [0.9, 1, 0.9] }}
          transition={{ duration: 4, repeat: Infinity }}
        />

        {/* 圓窗 */}
        <div
          className="absolute top-[14%] left-1/2 -translate-x-1/2 w-20 h-20 rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(186,230,253,0.35) 0%, rgba(14,165,233,0.1) 70%)',
            border: '2px solid rgba(186,230,253,0.3)',
            boxShadow: '0 0 24px rgba(14,165,233,0.2)',
          }}
        />

        {/* 地板（透視） */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[55%]"
          style={{
            background: 'linear-gradient(180deg, rgba(6,78,59,0.3), rgba(4,47,46,0.6))',
            transform: 'rotateX(52deg) translateY(20%)',
            transformOrigin: 'bottom center',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        />

        {/* 裝飾槽位 */}
        {slotItems.map(({ slot, item }, i) => (
          <motion.div
            key={slot.id}
            className="absolute z-10 flex flex-col items-center"
            style={{
              bottom: slot.bottom,
              top: slot.top,
              left: slot.left,
              right: slot.right,
              transform: slot.left === '50%' ? 'translateX(-50%)' : undefined,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 + i * 0.1 }}
          >
            {item ? (
              <div
                className="px-2 py-1 rounded-lg text-[10px] font-medium ocean-heading text-center max-w-[72px]"
                style={{
                  background: 'rgba(14,165,233,0.25)',
                  border: '1px solid rgba(14,165,233,0.35)',
                }}
              >
                {item.nameJa}
              </div>
            ) : (
              <div
                className="w-10 h-10 rounded-lg border border-dashed border-white/20 flex items-center justify-center"
                aria-label={`${slot.labelJa} 空きスロット`}
              >
                <Sparkles size={14} className="text-white/25" />
              </div>
            )}
          </motion.div>
        ))}

        {/* 主角 */}
        <div className="absolute bottom-[12%] left-1/2 -translate-x-1/2 z-20">
          {protagonist.type === 'animal' && isCreatureVariant(protagonist.variant) ? (
            <CreatureImage name={protagonist.variant} size={100} />
          ) : (
            <HumanProtagonistPlaceholder variant={protagonist.variant} />
          )}
        </div>
      </motion.div>

      <p className="text-sm ocean-body text-center mb-4">
        ショップで装飾を購入すると、自動的に部屋に飾られます。
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {HOME_SLOTS.map((slot) => {
          const itemId = equippedHome[slot.id];
          const item = itemId ? getShopItem(itemId) : undefined;
          return (
            <div key={slot.id} className="ocean-glass-panel p-3 text-center">
              <p className="text-xs ocean-muted mb-1">{slot.labelJa}</p>
              <p className="text-xs ocean-heading truncate">{item?.nameJa ?? '空き'}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
