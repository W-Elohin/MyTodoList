import { motion } from 'motion/react';

interface EmptyStateWrapperProps {
  illustration: React.ReactNode;
  title: string;
  subtitle: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyStateWrapper({
  illustration,
  title,
  subtitle,
  actionLabel,
  onAction,
}: EmptyStateWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center text-center py-12 px-4"
    >
      <motion.div layout className="mb-6">{illustration}</motion.div>
      <h3 className="text-lg font-semibold text-sky-200">{title}</h3>
      <p className="text-sm text-sky-400 mt-2 max-w-xs">{subtitle}</p>
      {actionLabel && onAction && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.97 }}
          onClick={onAction}
          className="mt-6 px-5 py-2.5 rounded-full bg-sky-500/20 border border-sky-400/30 text-sky-200 text-sm font-medium hover:bg-sky-500/30 transition-colors"
        >
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  );
}
