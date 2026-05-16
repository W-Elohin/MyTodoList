import { motion } from 'motion/react';
import { TodoCategory } from '../types';

export type FilterValue = 'all' | 'high' | 'medium' | 'low' | `cat-${string}`;

interface FilterChipsProps {
  categories: TodoCategory[];
  activeFilter: FilterValue;
  onFilterChange: (filter: FilterValue) => void;
}

const PRIORITY_CHIPS: { value: FilterValue; label: string; color?: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'high', label: '高優先', color: '#ef4444' },
  { value: 'medium', label: '中優先', color: '#eab308' },
  { value: 'low', label: '低優先', color: '#22c55e' },
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
                : 'bg-white/70 text-gray-600 border-gray-200 hover:bg-white'
            }`}
            style={
              isActive && chip.color
                ? { backgroundColor: chip.value === 'all' ? '#2A89C6' : chip.color }
                : isActive
                ? { backgroundColor: '#2A89C6' }
                : undefined
            }
          >
            {chip.label}
          </motion.button>
        );
      })}
    </div>
  );
}
