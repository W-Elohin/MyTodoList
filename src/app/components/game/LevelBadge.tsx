import { motion } from 'motion/react';
import { Coins, Star } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useGame } from '../../context/GameContext';
import { xpProgressInLevel } from '../../utils/gamification';
import { gentleSpring } from '../../utils/animations';

export function LevelBadge() {
  const { profile } = useGame();
  const navigate = useNavigate();
  const progress = xpProgressInLevel(profile.xp, profile.level);

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={gentleSpring}
      className="mb-4 p-3 rounded-2xl ocean-glass-panel"
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center font-bold text-lg ocean-heading"
          style={{
            background: 'linear-gradient(135deg, rgba(14,165,233,0.35), rgba(16,185,129,0.25))',
            border: '1px solid rgba(14,165,233,0.3)',
          }}
          whileHover={{ scale: 1.05, rotate: 2 }}
          transition={gentleSpring}
        >
          {profile.level}
        </motion.div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium ocean-body flex items-center gap-1">
              <Star size={12} className="text-sky-400" />
              レベル {profile.level}
            </span>
            <span className="text-xs ocean-muted flex items-center gap-1">
              <Coins size={12} className="text-amber-400" />
              {profile.coins}
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="flex-1 text-xs py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors ocean-body"
        >
          マイルーム
        </button>
        <button
          type="button"
          onClick={() => navigate('/shop')}
          className="flex-1 text-xs py-1.5 rounded-lg border border-white/10 hover:bg-white/5 transition-colors ocean-body"
        >
          ショップ
        </button>
      </div>
    </motion.div>
  );
}
