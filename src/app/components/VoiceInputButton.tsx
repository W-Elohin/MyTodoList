import { useEffect, useRef, useState } from 'react';
import { Mic, Square, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface VoiceInputButtonProps {
  isReady: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  error: string | null;
  onToggle: () => void;
  onSuccess?: () => void;
  showSuccess: boolean;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function VoiceInputButton({
  isReady,
  isRecording,
  isProcessing,
  error,
  onToggle,
  onSuccess,
  showSuccess,
}: VoiceInputButtonProps) {
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRecording) {
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  useEffect(() => {
    if (showSuccess) onSuccess?.();
  }, [showSuccess, onSuccess]);

  const disabled = !isReady || isProcessing;

  return (
    <motion.div layout className="flex flex-col items-center gap-2">
      <motion.div
        animate={!isRecording && !isProcessing && !showSuccess ? { scale: [0.95, 1.05, 0.95] } : { scale: 1 }}
        transition={!isRecording && !isProcessing && !showSuccess ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : {}}
        className="relative"
      >
        {isRecording && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className="absolute inset-0 rounded-full border-2 border-red-400"
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
              />
            ))}
          </>
        )}

        <motion.button
          type="button"
          disabled={disabled}
          onClick={onToggle}
          whileTap={{ scale: 0.92 }}
          className={`relative z-10 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors ${
            isRecording
              ? 'bg-red-500 text-white'
              : showSuccess
              ? 'bg-green-500 text-white'
              : isProcessing
              ? 'bg-gray-200 text-gray-500'
              : 'bg-white text-gray-700 border border-gray-200'
          }`}
        >
          <AnimatePresence mode="wait">
            {showSuccess ? (
              <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                <Check size={24} strokeWidth={3} />
              </motion.span>
            ) : isProcessing ? (
              <motion.span key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Loader2 size={24} className="animate-spin" />
              </motion.span>
            ) : isRecording ? (
              <motion.span key="stop" initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}>
                <Square size={20} fill="currentColor" />
              </motion.span>
            ) : (
              <motion.span key="mic" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Mic size={24} />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </motion.div>

      <AnimatePresence mode="wait">
        {isRecording && (
          <motion.span
            key="timer"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm font-mono text-red-500 tabular-nums"
          >
            {formatDuration(elapsed)}
          </motion.span>
        )}
        {isProcessing && (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-1"
          >
            <div className="flex gap-1 h-4 items-end">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-blue-500"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.12 }}
                />
              ))}
            </div>
            <span className="text-xs text-gray-500">AI 辨識中...</span>
          </motion.div>
        )}
        {error && !isRecording && !isProcessing && (
          <motion.span key="err" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-red-500">
            {error}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
