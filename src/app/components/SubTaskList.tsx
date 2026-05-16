import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SubTask } from '../types';

interface SubTaskListProps {
  subtasks: SubTask[];
  onToggle: (id: string) => void;
  onAdd: (content: string) => void;
  onDelete: (id: string) => void;
}

export function SubTaskList({ subtasks, onToggle, onAdd, onDelete }: SubTaskListProps) {
  const [newContent, setNewContent] = useState('');

  const handleAdd = () => {
    const trimmed = newContent.trim();
    if (trimmed) {
      onAdd(trimmed);
      setNewContent('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className="space-y-1.5">
      <AnimatePresence initial={false}>
        {subtasks.map((st) => (
          <motion.div
            key={st.id}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="flex items-center gap-2 group overflow-hidden"
          >
            <button
              type="button"
              onClick={() => onToggle(st.id)}
              className={`flex-shrink-0 w-4 h-4 rounded-full border-2 transition-all ${
                st.completed
                  ? 'bg-blue-500 border-blue-500'
                  : 'border-gray-300 hover:border-blue-400'
              }`}
            />
            <span
              className={`flex-1 text-sm break-words ${
                st.completed ? 'line-through text-gray-400' : 'text-gray-700'
              }`}
            >
              {st.content}
            </span>
            <button
              type="button"
              onClick={() => onDelete(st.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 flex-shrink-0"
            >
              <Trash2 size={13} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="flex gap-2 pt-1">
        <input
          type="text"
          value={newContent}
          onChange={(e) => setNewContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="サブタスクを追加..."
          className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 text-gray-800 placeholder:text-gray-400 bg-white"
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
        >
          <Plus size={15} />
        </button>
      </div>
    </div>
  );
}
