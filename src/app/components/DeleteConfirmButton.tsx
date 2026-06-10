import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { springTransition } from '../utils/animations';

interface DeleteConfirmButtonProps {
  isPending: boolean;
  onClick: () => void;
}

export function DeleteConfirmButton({ isPending, onClick }: DeleteConfirmButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.04 }}
      transition={springTransition}
      className={`flex-shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
        isPending
          ? 'bg-red-500/30 text-red-200 border border-red-400/40'
          : 'text-red-400/80 hover:text-red-300 hover:bg-red-500/10'
      }`}
    >
      <AnimatePresence mode="wait">
        {isPending ? (
          <motion.span
            key="confirm"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
          >
            削除？
          </motion.span>
        ) : (
          <motion.span key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <X size={18} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export function useDeleteConfirm() {
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const requestDelete = (id: string, onConfirm: (id: string) => void) => {
    if (pendingDeleteId === id) {
      onConfirm(id);
      setPendingDeleteId(null);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      return;
    }
    setPendingDeleteId(id);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setPendingDeleteId(null), 2000);
  };

  return { pendingDeleteId, requestDelete };
}
