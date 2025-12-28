'use client';

import { forwardRef } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBoxProps {
    query: string;
    onChange: (query: string) => void;
    onClear: () => void;
}

export const SearchBox = forwardRef<HTMLInputElement, SearchBoxProps>(
    function SearchBox({ query, onChange, onClear }, ref) {
        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter' || e.key === 'Escape') {
                e.preventDefault();
                (e.target as HTMLInputElement).blur();
            }
        };

        return (
            <div className="relative flex items-center">
                <Search className="absolute left-2.5 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" />
                <input
                    ref={ref}
                    type="text"
                    value={query}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Press / to search..."
                    className="
                        w-36 sm:w-44 pl-8 pr-7 py-1.5 
                        bg-[var(--bg-secondary)] 
                        border border-[var(--border-primary)] 
                        rounded-lg text-xs
                        text-[var(--text-primary)] 
                        placeholder:text-[var(--text-muted)]
                        outline-none
                        focus:border-[var(--accent-primary)]
                        transition-all duration-200
                    "
                />
                {query && (
                    <button
                        onClick={onClear}
                        className="absolute right-2 p-0.5 hover:bg-[var(--bg-hover)] rounded transition-colors"
                    >
                        <X className="w-3 h-3 text-[var(--text-muted)]" />
                    </button>
                )}
            </div>
        );
    }
);
