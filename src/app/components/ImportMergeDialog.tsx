import { motion } from 'motion/react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertCircle, X } from 'lucide-react';

interface ImportMergeDialogProps {
  isOpen: boolean;
  fileName: string;
  onMerge: () => void;
  onReplace: () => void;
  onCancel: () => void;
}

export function ImportMergeDialog({
  isOpen,
  fileName,
  onMerge,
  onReplace,
  onCancel,
}: ImportMergeDialogProps) {
  return (
    <Dialog.Root open={isOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-gradient-to-b from-sky-950/80 to-sky-900/80 border border-sky-400/20 rounded-3xl shadow-2xl p-8"
          >
            <div className="flex items-start gap-3 mb-6">
              <AlertCircle className="w-6 h-6 text-sky-400 flex-shrink-0 mt-1" />
              <Dialog.Title className="text-xl font-bold text-sky-50 flex-1">
                データをインポート
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  onClick={onCancel}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors text-sky-300"
                  aria-label="閉じる"
                >
                  <X size={20} />
                </button>
              </Dialog.Close>
            </div>

            <Dialog.Description className="text-sky-300 mb-6 text-base">
              <p className="mb-4">ファイル <span className="font-mono text-sky-200">{fileName}</span> をインポートします。</p>
              <p className="text-sm">既存データとの処理方法を選択してください：</p>
            </Dialog.Description>

            <div className="space-y-3 mb-6">
              <button
                onClick={onMerge}
                className="w-full px-4 py-3 rounded-2xl font-medium text-base transition-all bg-sky-500/30 hover:bg-sky-500/40 text-sky-100 border border-sky-400/40 hover:border-sky-400/60"
              >
                <div className="font-semibold">マージする</div>
                <div className="text-xs text-sky-300 mt-1">既存データと組み合わせます</div>
              </button>

              <button
                onClick={onReplace}
                className="w-full px-4 py-3 rounded-2xl font-medium text-base transition-all bg-red-500/20 hover:bg-red-500/30 text-red-100 border border-red-400/30 hover:border-red-400/50"
              >
                <div className="font-semibold">置き換える</div>
                <div className="text-xs text-red-300 mt-1">既存データをすべて削除します</div>
              </button>
            </div>

            <button
              onClick={onCancel}
              className="w-full px-4 py-2 rounded-xl text-sky-300 hover:bg-white/10 transition-colors text-sm"
            >
              キャンセル
            </button>
          </motion.div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
