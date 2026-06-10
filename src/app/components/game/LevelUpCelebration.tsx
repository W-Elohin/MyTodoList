import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Star } from 'lucide-react';
import { useConfetti } from '../../hooks/useConfetti';
import { useGame } from '../../context/GameContext';
import { gentleSpring } from '../../utils/animations';

export function LevelUpCelebration() {
  const { pendingLevelUp, clearLevelUp } = useGame();
  const confetti = useConfetti();

  useEffect(() => {
    if (pendingLevelUp == null) return;

    confetti.fire(window.innerWidth / 2, window.innerHeight * 0.35);
    const t1 = window.setTimeout(() => confetti.fire(window.innerWidth * 0.25, window.innerHeight * 0.5), 400);
    const t2 = window.setTimeout(() => confetti.fire(window.innerWidth * 0.75, window.innerHeight * 0.5), 700);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [pendingLevelUp, confetti]);

  return (
    <AnimatePresence>
      {pendingLevelUp != null && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="level-up-title"
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={clearLevelUp}
        >
          <div className="absolute inset-0 bg-[#0a1628]/75 backdrop-blur-sm" />

          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 16 }}
            transition={gentleSpring}
            className="relative w-full max-w-sm ocean-glass-panel p-8 text-center shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <motion.div
              className="mx-auto mb-4 w-20 h-20 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(14,165,233,0.4), rgba(16,185,129,0.3))',
                border: '1px solid rgba(14,165,233,0.35)',
              }}
              animate={{ rotate: [0, 4, -4, 0], scale: [1, 1.06, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Star size={36} className="text-sky-300" aria-hidden />
            </motion.div>

            <p className="text-xs font-medium tracking-widest text-sky-300/80 mb-2">LEVEL UP</p>
            <h2 id="level-up-title" className="text-3xl font-bold ocean-heading mb-2">
              レベル {pendingLevelUp}
            </h2>
            <p className="text-sm ocean-body mb-6">おめでとう！新しい冒険が始まります。</p>

            <button
              type="button"
              onClick={clearLevelUp}
              className="w-full py-3 rounded-xl font-medium text-sm transition-colors"
              style={{
                background: 'linear-gradient(135deg, rgba(14,165,233,0.35), rgba(16,185,129,0.25))',
                border: '1px solid rgba(14,165,233,0.3)',
                color: 'var(--ocean-heading)',
              }}
            >
              続ける
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
