import { useState } from 'react';
import { motion } from 'motion/react';

interface TodoCompleteButtonProps {
  onComplete: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
}

export function TodoCompleteButton({ onComplete, className = '' }: TodoCompleteButtonProps) {
  const [hovered, setHovered] = useState(false);
  const [completing, setCompleting] = useState(false);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    setCompleting(true);
    // 觸覺回饋：完成時的短促震動，強化「被獎勵」的體感（支援的裝置才有作用）
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      navigator.vibrate(15);
    }
    onComplete(e);
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      aria-label="完了にする"
      whileTap={{ scale: 0.9 }}
      className={`relative flex-shrink-0 w-7 h-7 rounded-full border-2 transition-colors mt-0.5 ${
        completing
          ? 'bg-sky-400 border-sky-400'
          : 'border-white/30 hover:border-sky-400/60 bg-transparent'
      } ${className}`}
    >
      <svg className="absolute inset-0 w-full h-full p-1" viewBox="0 0 24 24" fill="none">
        <motion.path
          d="M5 13l4 4L19 7"
          stroke="white"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: hovered && !completing ? 0.3 : 0 }}
          animate={{
            pathLength: completing ? 1 : 0,
            opacity: completing ? 1 : hovered ? 0.3 : 0,
          }}
          transition={{ duration: completing ? 0.35 : 0.15, ease: 'easeOut' }}
        />
      </svg>
    </motion.button>
  );
}
