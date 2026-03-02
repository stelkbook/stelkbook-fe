import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Star, ArrowDownAZ, ArrowUpZA } from 'lucide-react';

export type SortOption = 'asc' | 'desc' | 'rating-high' | 'rating-low' | null;

interface SortFilterProps {
  onSortChange: (option: SortOption) => void;
  currentSort: SortOption;
  label?: string;
}

const SortFilter: React.FC<SortFilterProps> = ({
  onSortChange,
  currentSort,
  label = 'Urutkan'
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

  const getSortLabel = () => {
    switch (currentSort) {
      case 'asc': return 'Judul A-Z';
      case 'desc': return 'Judul Z-A';
      case 'rating-high': return 'Rating Tertinggi';
      case 'rating-low': return 'Rating Terendah';
      default: return label;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg shadow-sm transition-all duration-200 min-h-[44px] ${
          currentSort 
            ? 'bg-red-50 border-red-200 text-red-700 ring-1 ring-red-100' 
            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        <span className="font-semibold text-sm">{getSortLabel()}</span>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'text-gray-400'}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 space-y-1">
            <button
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                currentSort === 'asc' 
                  ? 'bg-red-600 text-white font-bold shadow-md' 
                  : 'text-gray-700 hover:bg-red-50 hover:text-red-700'
              }`}
              onClick={() => handleSortSelect('asc')}
            >
              <ArrowDownAZ size={16} />
              Judul A-Z
            </button>
            <button
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                currentSort === 'desc' 
                  ? 'bg-red-600 text-white font-bold shadow-md' 
                  : 'text-gray-700 hover:bg-red-50 hover:text-red-700'
              }`}
              onClick={() => handleSortSelect('desc')}
            >
              <ArrowUpZA size={16} />
              Judul Z-A
            </button>
            <div className="h-px bg-gray-100 my-1 mx-2"></div>
            <button
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                currentSort === 'rating-high' 
                  ? 'bg-red-600 text-white font-bold shadow-md' 
                  : 'text-gray-700 hover:bg-red-50 hover:text-red-700'
              }`}
              onClick={() => handleSortSelect('rating-high')}
            >
              <Star size={16} className={currentSort === 'rating-high' ? 'fill-white' : 'fill-yellow-400 text-yellow-400'} />
              Rating Tertinggi
            </button>
            <button
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all ${
                currentSort === 'rating-low' 
                  ? 'bg-red-600 text-white font-bold shadow-md' 
                  : 'text-gray-700 hover:bg-red-50 hover:text-red-700'
              }`}
              onClick={() => handleSortSelect('rating-low')}
            >
              <Star size={16} className={currentSort === 'rating-low' ? 'fill-white opacity-50' : 'text-gray-300'} />
              Rating Terendah
            </button>
          </div>
          {currentSort && (
            <div className="bg-gray-50 p-2 border-t border-gray-100">
              <button 
                onClick={() => handleSortSelect(null)}
                className="w-full py-1.5 text-[10px] text-gray-500 hover:text-red-600 font-bold uppercase tracking-wider transition-colors"
              >
                Reset Urutan
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SortFilter;
