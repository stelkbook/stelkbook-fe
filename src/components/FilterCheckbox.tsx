'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ChevronDown, X, Filter, Check, Tag, Sparkles, Search } from 'lucide-react';
import { generateAutomaticTags, getAllPossibleTags } from '@/utils/taggingSystem';

interface Book {
  id?: number;
  judul?: string;
  deskripsi?: string;
  kategori?: string;
  kelas?: string;
  mapel?: string;
  penerbit?: string;
  penulis?: string;
  tags?: string[] | string;
  [key: string]: any;
}

export interface FilterState {
  kelas: string[];
  mapel: string[];
  penerbit: string[];
  penulis: string[];
  kategori?: string[];
  tags?: string[];
}

interface FilterCheckboxProps {
  books: Book[];
  onFilterChange: (filters: FilterState) => void;
  hiddenFilters?: (keyof FilterState)[];
  isSiswa?: boolean;
}

const FilterCheckbox: React.FC<FilterCheckboxProps> = ({ books, onFilterChange, hiddenFilters = [], isSiswa = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [sectionSearch, setSectionSearch] = useState<Record<string, string>>({});
  const [selectedFilters, setSelectedFilters] = useState<FilterState>({
    kelas: [],
    mapel: [],
    penerbit: [],
    penulis: [],
    kategori: [],
    tags: []
  });
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (category: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Get all possible tags for suggestions
  const allPossibleTags = useMemo(() => getAllPossibleTags(), []);

  // Filter suggestions based on input
  const tagSuggestions = useMemo(() => {
    if (!tagInput.trim()) return [];
    const input = tagInput.toLowerCase();
    return allPossibleTags
      .filter(tag => tag.toLowerCase().includes(input) && !selectedFilters.tags?.includes(tag))
      .slice(0, 5);
  }, [tagInput, allPossibleTags, selectedFilters.tags]);

  // Extract unique options with counts
  const options = useMemo(() => {
    const extractOptions = (key: keyof Book, fallbackKey?: keyof Book) => {
      const counts: Record<string, number> = {};
      books.forEach(book => {
        let value = book[key];
        
        // Special logic for tags: include automatic tags if isSiswa is true
        if (key === 'tags' && isSiswa) {
          const autoTags = generateAutomaticTags(book.judul || '', book.deskripsi || '');
          const existingTags = Array.isArray(value) 
            ? value 
            : (typeof value === 'string' ? value.split(',').map(t => t.trim()) : []);
          
          // Combine existing and auto tags, remove duplicates
          const combinedTags = Array.from(new Set([...existingTags, ...autoTags]));
          combinedTags.forEach(tag => {
            if (tag) counts[tag] = (counts[tag] || 0) + 1;
          });
          return; // Skip standard processing for tags if isSiswa
        }
        
        // Fallback logic for 'kelas' using 'kategori' if 'kelas' is missing
        if (!value && fallbackKey) {
          value = book[fallbackKey];
        }
        
        if (Array.isArray(value)) {
          value.forEach(v => {
            if (typeof v === 'string' && v) {
              counts[v] = (counts[v] || 0) + 1;
            }
          });
        } else if (typeof value === 'string' && value) {
          // Handle comma-separated tags if any
          if (key === 'tags' && value.includes(',')) {
            value.split(',').forEach(v => {
              const trimmed = v.trim();
              if (trimmed) counts[trimmed] = (counts[trimmed] || 0) + 1;
            });
          } else {
            counts[value] = (counts[value] || 0) + 1;
          }
        }
      });
      return Object.entries(counts).sort((a, b) => b[1] - a[1]); // Sort by count desc
    };

    return {
      kelas: extractOptions('kelas', 'kategori'),
      mapel: extractOptions('mapel'),
      penerbit: extractOptions('penerbit'),
      penulis: extractOptions('penulis'),
      kategori: extractOptions('kategori'),
      tags: extractOptions('tags')
    };
  }, [books, isSiswa]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update parent when filters change
  useEffect(() => {
    onFilterChange(selectedFilters);
  }, [selectedFilters, onFilterChange]);

  const toggleFilter = (category: keyof FilterState, value: string) => {
    setSelectedFilters(prev => {
      const current = prev[category] || [];
      const updated = current.includes(value)
        ? current.filter(item => item !== value)
        : [...current, value];
      return { ...prev, [category]: updated };
    });
  };

  const addTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if (tagInput.trim()) {
      if (!selectedFilters.tags?.includes(tagInput.trim())) {
        toggleFilter('tags', tagInput.trim());
      }
      setTagInput('');
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(e);
    }
  };

  const resetFilters = () => {
    setSelectedFilters({
      kelas: [],
      mapel: [],
      penerbit: [],
      penulis: [],
      kategori: [],
      tags: []
    });
    setSectionSearch({});
  };

  const activeFilterCount = Object.values(selectedFilters).flat().filter(Boolean).length;

  const renderSection = (title: string, category: keyof FilterState, items: [string, number][]) => {
    if (items.length === 0 && category !== 'tags') return null;

    const isSelected = (value: string) => selectedFilters[category]?.includes(value);
    const isCollapsed = collapsedSections[category];
    const searchQuery = sectionSearch[category] || '';
    
    // Filter items based on section search query
    const filteredItems = items.filter(([value]) => 
      value.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const showSearchBar = category === 'penerbit' || category === 'penulis' || category === 'mapel' || category === 'kelas';

    return (
      <div className="mb-6 border-b border-gray-100 pb-4 last:border-0 last:pb-0">
        <div 
          className="flex items-center justify-between mb-3 cursor-pointer group/header"
          onClick={() => toggleSection(category)}
        >
          <h3 className="text-[11px] font-bold text-gray-900 uppercase tracking-widest flex items-center gap-2 group-hover/header:text-red-600 transition-colors">
            <span className="w-1 h-3 bg-red-600 rounded-full"></span>
            {title}
          </h3>
          <ChevronDown 
            size={14} 
            className={`text-gray-400 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`} 
          />
        </div>
        
        {!isCollapsed && (
          <div className="animate-in fade-in slide-in-from-top-1 duration-200">
            {/* Inline Section Search Bar */}
            {showSearchBar && (
              <div className="mb-3 relative group/search">
                <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within/search:text-red-500 transition-colors">
                  <Search size={12} />
                </div>
                <input
                  type="text"
                  placeholder={`Cari ${title.toLowerCase()}...`}
                  value={searchQuery}
                  onChange={(e) => setSectionSearch(prev => ({ ...prev, [category]: e.target.value }))}
                  className="w-full pl-8 pr-3 py-1.5 text-[11px] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all placeholder:text-gray-400 bg-gray-50/30 focus:bg-white"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSectionSearch(prev => ({ ...prev, [category]: '' }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X size={10} strokeWidth={3} />
                  </button>
                )}
              </div>
            )}

            {category === 'tags' ? (
              <div className="space-y-4">
                <div className="relative group">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-red-500 transition-colors">
                    <Tag size={13} />
                  </div>
                  <input
                    type="text"
                    placeholder="Tambah Tag Baru"
                    value={tagInput}
                    onChange={(e) => {
                      setTagInput(e.target.value);
                      setShowTagSuggestions(true);
                    }}
                    onFocus={() => setShowTagSuggestions(true)}
                    onKeyDown={handleTagKeyDown}
                    className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all placeholder:text-gray-400 bg-gray-50/30 focus:bg-white"
                  />
                  
                  {/* Tag Suggestions Dropdown */}
                  {showTagSuggestions && tagSuggestions.length > 0 && (
                    <div className="absolute z-[60] left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                      {tagSuggestions.map(suggestion => (
                        <button
                          key={suggestion}
                          onClick={() => {
                            toggleFilter('tags', suggestion);
                            setTagInput('');
                            setShowTagSuggestions(false);
                          }}
                          className="w-full text-left px-4 py-2 text-xs hover:bg-red-50 text-gray-700 hover:text-red-700 font-medium transition-colors flex items-center justify-between"
                        >
                          {suggestion}
                          <Sparkles size={10} className="text-amber-400" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Selected Tags */}
                {selectedFilters.tags && selectedFilters.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 animate-in fade-in duration-300">
                    {selectedFilters.tags.map(tag => (
                      <span 
                        key={tag} 
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-600 text-white text-[11px] font-bold rounded-full shadow-sm hover:bg-red-700 transition-colors cursor-default"
                      >
                        {tag}
                        <button onClick={() => toggleFilter('tags', tag)} className="hover:bg-white/20 rounded-full p-0.5 transition-colors">
                          <X size={10} strokeWidth={3} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Popular/Available Tags */}
                {items.length > 0 && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-2">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                        {isSiswa ? 'Tag yang Disarankan' : 'Tag Terpopuler'}
                      </p>
                      {isSiswa && <Sparkles size={10} className="text-amber-400 animate-pulse" />}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {items.slice(0, 15).map(([value, count]) => (
                        <button
                          key={value}
                          onClick={() => !isSelected(value) && toggleFilter('tags', value)}
                          disabled={isSelected(value)}
                          className={`text-[10px] px-3 py-1.5 rounded-lg font-semibold transition-all duration-200 flex items-center gap-1.5 ${
                            isSelected(value)
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-transparent'
                              : 'bg-white text-gray-600 hover:text-red-600 hover:border-red-200 border border-gray-200 hover:shadow-sm active:scale-95'
                          }`}
                        >
                          {value}
                          <span className={`text-[8px] px-1 rounded-md ${
                            isSelected(value) ? 'bg-gray-200' : 'bg-gray-100 text-gray-400'
                          }`}>
                            {count}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : category === 'kategori' ? (
              <div className="flex flex-wrap gap-2">
                {filteredItems.map(([value, count]) => (
                  <button
                    key={value}
                    onClick={() => toggleFilter('kategori', value)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all duration-200 ${
                      isSelected(value)
                        ? 'bg-red-50 border-red-200 text-red-700 shadow-sm'
                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {isSelected(value) && <Check size={12} strokeWidth={3} />}
                    {value}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${
                      isSelected(value) ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="max-h-48 overflow-y-auto space-y-0.5 pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                {filteredItems.length > 0 ? (
                  filteredItems.map(([value, count]) => (
                    <label key={value} className="flex items-center group cursor-pointer py-2 px-2 rounded-lg hover:bg-red-50/50 transition-colors">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          className="peer h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500 cursor-pointer transition-all"
                          checked={isSelected(value)}
                          onChange={() => toggleFilter(category, value)}
                        />
                      </div>
                      <span className={`ml-3 text-sm flex-grow transition-colors ${
                        isSelected(value) ? 'text-red-700 font-bold' : 'text-gray-600 group-hover:text-gray-900'
                      }`}>
                        {value}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md transition-colors ${
                        isSelected(value) ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {count}
                      </span>
                    </label>
                  ))
                ) : (
                  <div className="py-8 text-center animate-in fade-in duration-300">
                    <Search size={20} className="mx-auto text-gray-200 mb-2 opacity-20" />
                    <p className="text-[11px] text-gray-400 font-medium">Tidak ada hasil ditemukan.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg shadow-sm transition-all duration-200 ${
          activeFilterCount > 0 
            ? 'bg-red-50 border-red-200 text-red-700 ring-1 ring-red-100' 
            : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
        }`}
      >
        <Filter size={16} className={activeFilterCount > 0 ? 'text-red-600' : 'text-gray-500'} />
        <span className="font-semibold text-sm">Filter</span>
        {activeFilterCount > 0 && (
          <span className="bg-red-600 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full">
            {activeFilterCount}
          </span>
        )}
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'text-gray-400'}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between p-4 border-b border-gray-50 bg-gray-50/50">
            <h2 className="font-bold text-gray-800 text-sm">Filter Buku</h2>
            <div className="flex items-center gap-3">
              {activeFilterCount > 0 && (
                <button 
                  onClick={resetFilters}
                  className="text-[11px] text-red-500 hover:text-red-700 font-bold flex items-center gap-1 transition-colors"
                >
                  <X size={12} strokeWidth={3} /> RESET
                </button>
              )}
              <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={18} />
              </button>
            </div>
          </div>

          <div className="p-4 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
            {!hiddenFilters.includes('kategori') && renderSection('Categories', 'kategori', options.kategori)}
            {!hiddenFilters.includes('tags') && renderSection('Tags', 'tags', options.tags)}
            {!hiddenFilters.includes('kelas') && renderSection('Kelas', 'kelas', options.kelas)}
            {!hiddenFilters.includes('mapel') && renderSection('Mata Pelajaran', 'mapel', options.mapel)}
            {!hiddenFilters.includes('penerbit') && renderSection('Penerbit', 'penerbit', options.penerbit)}
            {!hiddenFilters.includes('penulis') && renderSection('Penulis', 'penulis', options.penulis)}

            {Object.values(options).every(opt => opt.length === 0) && (
              <div className="text-center py-8">
                <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Filter size={20} className="text-gray-300" />
                </div>
                <p className="text-xs text-gray-500">Tidak ada filter tersedia.</p>
              </div>
            )}
          </div>
          
          <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[10px] text-gray-400 font-medium">
              {activeFilterCount} filter dipilih
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="px-5 py-2 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all shadow-md hover:shadow-lg active:scale-95"
            >
              TERAPKAN
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterCheckbox;
