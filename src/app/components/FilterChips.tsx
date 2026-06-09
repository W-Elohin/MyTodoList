import { motion } from 'motion/react';
import { TodoCategory } from '../types';

export type FilterValue = 'all' | 'high' | 'medium' | 'low' | `cat-${string}`;

interface FilterChipsProps {
  categories: TodoCategory[];
  activeFilter: FilterValue;
  onFilterChange: (filter: FilterValue) => void;
}

const PRIORITY_CHIPS: { value: FilterValue; label: string; color?: string }[] = [
  { value: 'all', label: 'すべて' },
  { value: 'high', label: '高', color: '#ef4444' },
  { value: 'medium', label: '中', color: '#eab308' },
  { value: 'low', label: '低', color: '#22c55e' },
];

export function FilterChips({ categories, activeFilter, onFilterChange }: FilterChipsProps) {
  const chips: { value: FilterValue; label: string; color?: string }[] = [
    ...PRIORITY_CHIPS,
    ...categories.map((c) => ({ value: `cat-${c.id}` as FilterValue, label: c.name, color: c.color })),
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1 scrollbar-hide">
      {chips.map((chip) => {
        const isActive = activeFilter === chip.value;
        return (
          <motion.button
            key={chip.value}
            type="button"
            whileTap={{ scale: 0.95 }}
            onClick={() => onFilterChange(chip.value)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all border ${
              isActive
                ? 'shadow-md border-transparent text-white'
                : 'text-sky-300 hover:bg-white/10'
            }`}
            style={
              isActive && chip.color
                ? { backgroundColor: chip.value === 'all' ? '#0ea5e9' : chip.color, borderColor: 'transparent' }
                : isActive
                ? { backgroundColor: '#0ea5e9', borderColor: 'transparent' }
                : { background: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)' }
            }
          >
            {chip.label}
          </motion.button>
        );
      })}
    </div>
  );
}
