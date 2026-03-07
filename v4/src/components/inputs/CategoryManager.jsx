import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import useBudgetStore from '../../store/budgetStore.js';

/**
 * CategoryManager — inline "Add Category" component.
 * Shows a "+ Add Category" link that expands to an input.
 * Calls onSelect(name) after adding so the parent can auto-select the new category.
 */
export default function CategoryManager({ onSelect }) {
  const addCategory = useBudgetStore(s => s.addCategory);
  const [showInput, setShowInput] = useState(false);
  const [newCat, setNewCat] = useState('');

  function handleAdd() {
    const trimmed = newCat.trim();
    if (!trimmed) return;
    addCategory(trimmed);
    setNewCat('');
    setShowInput(false);
    onSelect?.(trimmed);
  }

  if (!showInput) {
    return (
      <button
        type="button"
        onClick={() => setShowInput(true)}
        className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors mt-1"
      >
        <Plus className="w-3 h-3" /> Add Category
      </button>
    );
  }

  return (
    <div className="flex gap-2 mt-1">
      <input
        autoFocus
        value={newCat}
        onChange={e => setNewCat(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') { e.preventDefault(); handleAdd(); }
          if (e.key === 'Escape') setShowInput(false);
        }}
        placeholder="New category name"
        className="card-neu-inset flex-1 px-3 py-1.5 text-sm text-slate-100 bg-transparent
                   focus:outline-none focus:ring-2 focus:ring-cyan-400/40"
      />
      <button
        type="button"
        onClick={handleAdd}
        className="px-3 py-1.5 bg-cyan-400 text-slate-900 rounded-xl text-xs font-semibold hover:bg-cyan-300 transition-colors"
      >
        Add
      </button>
      <button
        type="button"
        onClick={() => setShowInput(false)}
        className="px-2 py-1.5 text-slate-500 hover:text-slate-300 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
