import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Command } from 'lucide-react';

const SearchBar = ({ value, onChange, resultCount }) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);

  // Keyboard shortcut: Cmd/Ctrl + K to focus search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Escape to clear and blur
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        onChange('');
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onChange]);

  return (
    <div className="mb-4">
      <div className={`relative flex items-center bg-white border rounded-lg transition-all ${
        isFocused ? 'border-[#1e73be] ring-2 ring-[#1e73be]/20' : 'border-gray-200'
      }`}>
        <Search className="w-5 h-5 text-gray-400 ml-3" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search poems, tags, categories..."
          className="flex-1 px-3 py-3 bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none"
        />
        {value ? (
          <button
            onClick={() => onChange('')}
            className="p-2 mr-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <div className="hidden sm:flex items-center gap-1 mr-3 text-xs text-gray-400">
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 font-mono">
              <Command className="w-3 h-3 inline" />
            </kbd>
            <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 font-mono">K</kbd>
          </div>
        )}
      </div>
      {resultCount !== null && value && (
        <p className="mt-2 text-sm text-gray-500">
          Found {resultCount} poem{resultCount !== 1 ? 's' : ''} matching "{value}"
        </p>
      )}
    </div>
  );
};

export default SearchBar;
