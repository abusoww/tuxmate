'use client';

import { forwardRef } from 'react';
import { X } from 'lucide-react';

interface ShortcutsBarProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    searchInputRef: React.RefObject<HTMLInputElement | null>;
    selectedCount: number;
    distroName: string;
    showAur: boolean;
    selectedHelper: 'yay' | 'paru';
    setSelectedHelper: (helper: 'yay' | 'paru') => void;
}

/**
 * ShortcutsBar - Neovim-style statusline with search on left, shortcuts on right
 * Uses theme-aware colors for dark/light mode compatibility
 */
export const ShortcutsBar = forwardRef<HTMLInputElement, ShortcutsBarProps>(
    function ShortcutsBar({
        searchQuery,
        onSearchChange,
        searchInputRef,
        selectedCount,
        distroName,
        showAur,
        selectedHelper,
        setSelectedHelper,
    }, ref) {

        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Escape' || e.key === 'Enter') {
                e.preventDefault();
                (e.target as HTMLInputElement).blur();
            }
        };

        const helperShortcuts = showAur ? [
            { key: '1', label: 'yay' },
            { key: '2', label: 'paru' },
        ] : [];



        return (
            <div className="bg-[var(--bg-tertiary)] border border-[var(--border-primary)] font-mono text-xs rounded-lg overflow-hidden">
                <div className="flex items-stretch justify-between">
                    {/* LEFT SECTION */}
                    <div className="flex items-stretch">
                        {/* Mode Badge - like nvim NORMAL/INSERT */}
                        <div className="bg-[var(--text-primary)] text-[var(--bg-primary)] px-3 py-1 font-bold flex items-center">
                            {distroName.toUpperCase()}
                        </div>

                        {/* Search Section */}
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-[var(--bg-secondary)] border-r border-[var(--border-primary)]/30">
                            <span className="text-[var(--text-muted)]">/</span>
                            <input
                                ref={searchInputRef}
                                type="text"
                                value={searchQuery}
                                onChange={(e) => onSearchChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="search..."
                                className="
                                    w-20 sm:w-28
                                    bg-transparent
                                    text-[var(--text-primary)]
                                    placeholder:text-[var(--text-muted)]/50
                                    outline-none
                                "
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => onSearchChange('')}
                                    className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </div>

                        {/* App count */}
                        {selectedCount > 0 && (
                            <div className="flex items-center px-3 py-1 text-[var(--text-muted)] border-r border-[var(--border-primary)]/30">
                                [{selectedCount} app{selectedCount !== 1 ? 's' : ''}]
                            </div>
                        )}

                        {/* AUR Helper Switch */}
                        {showAur && (
                            <div className="flex items-stretch border-r border-[var(--border-primary)]/30">
                                <button
                                    onClick={() => setSelectedHelper('yay')}
                                    className={`px-3 flex items-center gap-2 text-[10px] font-medium transition-colors border-r border-[var(--border-primary)]/30 ${selectedHelper === 'yay' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'}`}
                                >
                                    <span className="font-mono opacity-70">1</span>
                                    yay
                                </button>
                                <button
                                    onClick={() => setSelectedHelper('paru')}
                                    className={`px-3 flex items-center gap-2 text-[10px] font-medium transition-colors ${selectedHelper === 'paru' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'}`}
                                >
                                    <span className="font-mono opacity-70">2</span>
                                    paru
                                </button>
                            </div>
                        )}
                    </div>

                    {/* RIGHT SECTION - Shortcuts */}
                    <div className="flex items-stretch">
                        <div className="hidden sm:flex items-center gap-4 px-4 py-1 text-[var(--text-muted)] text-[11px] font-medium border-l border-[var(--border-primary)]/30">
                            {/* Navigation Group */}
                            <div className="hidden lg:flex items-center gap-1.5 transition-opacity hover:opacity-100">
                                <span className="font-mono text-[10px] tracking-widest text-[var(--text-muted)]">NAV</span>
                                <div className="flex items-center gap-1 font-mono text-[var(--text-primary)]">
                                    <span>↓←↑→</span>
                                    <span className="opacity-50">/</span>
                                    <span>hjkl</span>
                                </div>
                            </div>

                            {/* Separator */}
                            <div className="w-px h-3 bg-[var(--border-primary)]/40 hidden lg:block"></div>

                            {/* Actions Group */}
                            <div className="flex items-center gap-4">
                                {[...helperShortcuts,
                                { key: '/', label: 'Search' },
                                { key: 'Space', label: 'Toggle' },
                                { key: 'y', label: 'Copy' },
                                { key: 'd', label: 'Download' },
                                { key: 'c', label: 'Clear' },
                                { key: 't', label: 'Theme' }
                                ].map(({ key, label }) => (
                                    <div key={key} className="flex items-center gap-1.5 group cursor-help transition-colors hover:text-[var(--text-primary)]">
                                        <span className={`font-mono font-bold transition-colors ${showAur && (key === '1' || key === '2') ? 'text-[#1793d1]' : 'text-[var(--text-primary)] group-hover:text-[#1793d1]'}`}>
                                            {key}
                                        </span>
                                        <span className="opacity-60 group-hover:opacity-100 transition-opacity">{label}</span>
                                    </div>
                                ))}

                                <div className="flex items-center gap-4 border-l border-[var(--border-primary)]/40 pl-4">
                                    <div className="flex items-center gap-1.5 transition-colors hover:text-[var(--text-primary)]">
                                        <span className="font-mono font-bold text-[var(--text-primary)]">Esc</span>
                                        <span className="opacity-60">Back</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 transition-colors hover:text-[var(--text-primary)]">
                                        <span className="font-mono font-bold text-[var(--text-primary)]">Tab</span>
                                        <span className="opacity-60">Preview</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* End badge - like nvim line:col */}
                        <div className="bg-[var(--text-primary)] text-[var(--bg-primary)] px-3 py-1 flex items-center font-bold text-xs tracking-wider">
                            TUX
                        </div>
                    </div>
                </div>
            </div>
        );
    }
);
