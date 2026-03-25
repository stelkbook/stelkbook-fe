import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export type SortOption = 'asc' | 'desc' | null;

interface SortFilterProps {
  onSortChange: (option: SortOption) => void;
  currentSort: SortOption;
  label?: string;
}

const SortFilter: React.FC<SortFilterProps> = ({
  onSortChange,
  currentSort,
  label = 'Sort by'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSortSelect = (option: SortOption) => {
    onSortChange(option);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors min-h-[44px]"
      >
        <span className="text-gray-700 font-medium">{label}</span>
        <ChevronDown 
          size={20} 
          className={`text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-100">
          <button
            className={`w-full text-left px-4 py-3 transition-colors ${
              currentSort === 'asc' 
                ? 'bg-red-600 text-white font-medium hover:bg-red-700' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => handleSortSelect('asc')}
          >
            Judul A-Z
          </button>
          <button
            className={`w-full text-left px-4 py-3 transition-colors ${
              currentSort === 'desc' 
                ? 'bg-red-600 text-white font-medium hover:bg-red-700' 
                : 'text-gray-700 hover:bg-gray-50'
            }`}
            onClick={() => handleSortSelect('desc')}
          >
            Judul Z-A
          </button>
        </div>
      )}
    </div>
  );
};

export default SortFilter;
