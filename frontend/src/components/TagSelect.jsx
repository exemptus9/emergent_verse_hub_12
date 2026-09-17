import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronDown, Plus } from 'lucide-react';

const TagSelect = ({ label, selected, options, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(
    (opt) =>
      opt.toLowerCase().includes(search.toLowerCase()) &&
      !selected.includes(opt)
  );

  const trimmed = search.trim();
  const isNew =
    trimmed &&
    !options.some((o) => o.toLowerCase() === trimmed.toLowerCase()) &&
    !selected.some((s) => s.toLowerCase() === trimmed.toLowerCase());

  const addItem = (item) => {
    onChange([...selected, item]);
    setSearch('');
    inputRef.current?.focus();
  };

  const removeItem = (item) => {
    onChange(selected.filter((s) => s !== item));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (isNew) {
        addItem(trimmed);
      } else if (filtered.length > 0) {
        addItem(filtered[0]);
      }
    }
    if (e.key === 'Backspace' && !search && selected.length > 0) {
      removeItem(selected[selected.length - 1]);
    }
  };

  return (
    <div ref={ref} className="relative">
      <label className="text-sm font-medium leading-none mb-1 block">{label}</label>
      <div
        className="flex flex-wrap items-center gap-1.5 min-h-[40px] px-3 py-1.5 mt-1 border border-gray-200 rounded-md bg-white cursor-text focus-within:ring-2 focus-within:ring-[#1e73be]/20 focus-within:border-[#1e73be]"
        onClick={() => { setOpen(true); inputRef.current?.focus(); }}
        data-testid={`tag-select-${label.toLowerCase()}`}
      >
        {selected.map((item) => (
          <span
            key={item}
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-[#1e73be]/10 text-[#1e73be] border border-[#1e73be]/20"
          >
            {item}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeItem(item); }}
              className="hover:text-red-500 transition-colors"
              data-testid={`remove-${label.toLowerCase()}-${item}`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        <input
          ref={inputRef}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={selected.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[80px] outline-none text-sm bg-transparent py-1"
          data-testid={`tag-select-input-${label.toLowerCase()}`}
        />
        <ChevronDown className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </div>

      {open && (filtered.length > 0 || isNew) && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
          {isNew && (
            <button
              type="button"
              onClick={() => addItem(trimmed)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-[#1e73be]/5 flex items-center gap-2 text-[#1e73be] font-medium"
              data-testid={`create-new-${label.toLowerCase()}`}
            >
              <Plus className="w-3.5 h-3.5" />
              Create "{trimmed}"
            </button>
          )}
          {filtered.map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => addItem(opt)}
              className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-gray-700"
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TagSelect;
