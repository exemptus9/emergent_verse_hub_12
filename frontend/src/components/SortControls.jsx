import React from 'react';
import { ArrowUpDown, Star, Calendar, TrendingUp, ArrowDown, ArrowUp, Eye } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const SortControls = ({ sortBy, onSortChange, compact = false }) => {
  const sortOptions = [
    { value: 'newest', label: 'Newest First', icon: Calendar, description: 'Most recent poems' },
    { value: 'oldest', label: 'Oldest First', icon: Calendar, description: 'Oldest poems first' },
    { value: 'rating-high', label: 'Highest Rated', icon: Star, description: 'Best rated poems' },
    { value: 'rating-low', label: 'Lowest Rated', icon: ArrowDown, description: 'Lowest rated first' },
    { value: 'most-rated', label: 'Most Rated', icon: TrendingUp, description: 'Most ratings' },
    { value: 'most-viewed', label: 'Most Viewed', icon: Eye, description: 'Most views' },
  ];

  const currentOption = sortOptions.find(opt => opt.value === sortBy);

  if (compact) {
    return (
      <Select value={sortBy} onValueChange={onSortChange}>
        <SelectTrigger className="w-[160px] bg-white">
          <SelectValue placeholder="Sort" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                <option.icon className="w-4 h-4 text-gray-500" />
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="flex items-center justify-between gap-3 mb-6 p-4 bg-white rounded-lg border border-gray-200">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-gray-600">
          <ArrowUpDown className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:inline">Sort by:</span>
        </div>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-[180px] bg-white">
            <SelectValue placeholder="Select sort order" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                <div className="flex items-center gap-2">
                  <option.icon className="w-4 h-4 text-gray-500" />
                  <div>
                    <span>{option.label}</span>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Quick sort buttons for desktop */}
      <div className="hidden md:flex items-center gap-1">
        {sortOptions.slice(0, 3).map((option) => (
          <button
            key={option.value}
            onClick={() => onSortChange(option.value)}
            className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
              sortBy === option.value
                ? 'bg-[#1e73be] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={option.description}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SortControls;
