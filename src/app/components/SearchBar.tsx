import type { ReactNode } from 'react';
import { Search, X } from 'lucide-react';
import { motion } from 'motion/react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="sticky top-0 z-20 -mx-1 px-1 pt-1 pb-3"
    >
      <motion.div
        layout
        className="flex items-center gap-2 rounded-2xl shadow-md px-4 py-2.5"
        style={{
          background: 'rgba(255,255,255,0.08)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.15)',
        }}
      >
        <Search size={18} className="text-sky-400 flex-shrink-0" />
        <input
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="タスク・カテゴリー・タグを検索..."
          className="flex-1 bg-transparent text-sm text-sky-50 placeholder:text-sky-400 focus:outline-none min-w-0"
        />
        {value && (
          <motion.button
            type="button"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => onChange('')}
            className="p-1 rounded-full text-sky-400 hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </motion.button>
        )}
      </motion.div>
    </motion.div>
  );
}

export function highlightText(text: string, query: string): ReactNode {
  if (!query.trim()) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'));

  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-sky-400/30 text-sky-100 rounded px-0.5">
        {part}
      </mark>
    ) : (
      part
    )
  );
}
