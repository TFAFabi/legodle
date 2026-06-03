import React, { useState, useEffect, useRef } from 'react';
import { Search, CornerDownLeft } from 'lucide-react';
import { LegoSet } from '../types';

interface AutocompleteSearchProps {
  legoSets: LegoSet[];
  onGuess: (set: LegoSet) => void;
  disabled: boolean;
  guessedIds: Set<string>;
}

export default function AutocompleteSearch({ legoSets, onGuess, disabled, guessedIds }: AutocompleteSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<LegoSet[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close recommendations on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter recommendations matching query (excluding already guessed sets)
  useEffect(() => {
    if (query.trim() === '') {
      setSuggestions([]);
      setSelectedIndex(-1);
      return;
    }

    const cleanQuery = query.toLowerCase().trim();
    const filtered = legoSets.filter(
      (set) =>
        !guessedIds.has(set.id) &&
        (set.name.toLowerCase().includes(cleanQuery) ||
          set.id.includes(cleanQuery) ||
          set.theme.toLowerCase().includes(cleanQuery))
    );

    setSuggestions(filtered.slice(0, 5)); // Limit to max 5 recommendations for neat spacing
    setSelectedIndex(-1);
  }, [query, legoSets, guessedIds]);

  const handleSelect = (set: LegoSet) => {
    onGuess(set);
    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelect(suggestions[selectedIndex]);
      } else if (suggestions.length > 0) {
        // If query matches a single candidate exactly or there is a strong first candidate
        handleSelect(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* 3D-Look Brick input bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            ref={inputRef}
            type="text"
            value={query}
            disabled={disabled}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Game OVER! Check stats daily" : "Search LEGO set name, number or theme..."}
            className={`w-full h-14 bg-white border-2 text-neutral-800 border-[#e6bdbb] rounded-xl px-4 py-2 font-sans font-medium focus:outline-none focus:ring-4 focus:ring-red-100 focus:border-[#bb0026] text-sm md:text-base shadow-[inset_0_2px_4px_rgba(0,0,0,0.06),0_2px_0_rgba(255,255,255,1)] disabled:bg-neutral-100 disabled:cursor-not-allowed transition-all ${
              isOpen && suggestions.length > 0 ? 'rounded-b-none border-b-0' : ''
            }`}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-350 pointer-events-none flex items-center gap-1.5">
            <Search size={18} className="stroke-[2.5]" />
          </div>
        </div>

        {/* Tactile LEGO-style trigger button */}
        <button
          onClick={() => {
            if (suggestions.length > 0) {
              handleSelect(suggestions[selectedIndex >= 0 ? selectedIndex : 0]);
            }
          }}
          disabled={disabled || query.trim() === ''}
          className={`h-14 aspect-square bg-[#bb0026] text-white rounded-xl shadow-[0_4px_0_#92001b] border-b-2 border-[#92001b] hover:brightness-115 active:translate-y-1 active:shadow-none flex items-center justify-center transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed`}
          title="Submit Guess"
        >
          <CornerDownLeft size={20} className="stroke-[2.5]" />
        </button>
      </div>

      {/* Autocomplete suggestion drop down overlay panel */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-10 md:right-16 bg-white border-2 border-t-0 border-[#bb0026] rounded-b-xl shadow-xl z-50 overflow-hidden divide-y divide-neutral-100 animate-[fadeSlideIn_0.15s_ease-out]">
          {suggestions.map((set, index) => (
            <div
              key={set.id}
              onClick={() => handleSelect(set)}
              className={`p-3 cursor-pointer flex items-center justify-between text-left transition-colors ${
                index === selectedIndex ? 'bg-amber-50 text-cyan-900 border-l-4 border-amber-400' : 'hover:bg-neutral-50'
              }`}
            >
              <div className="flex flex-col">
                <span className="font-bold text-sm text-neutral-850">
                  {set.name}
                </span>
                <span className="text-xs text-neutral-500 font-medium mt-0.5">
                  {set.theme} &bull; {set.year}
                </span>
              </div>
              <div className="flex flex-col items-end flex-shrink-0 ml-2">
                <span className="bg-[#eceeef] text-neutral-700 text-[10px] font-black px-2 py-0.5 rounded-full border border-neutral-300">
                  #{set.id}
                </span>
                <span className="text-[10px] font-extrabold text-neutral-400 uppercase mt-1">
                  {set.piece_count} pcs
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
