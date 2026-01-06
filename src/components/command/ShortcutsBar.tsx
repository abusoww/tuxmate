'use client';

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

// Neovim-style statusline - looks cool and shows all the keyboard shortcuts
export function ShortcutsBar({
    searchQuery,
    onSearchChange,
    searchInputRef,
    selectedCount,
    distroName,
    showAur,
    selectedHelper,
    setSelectedHelper,
}: ShortcutsBarProps) {

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape' || e.key === 'Enter') {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
        }
    };

    return (
        <div className="bg-[var(--bg-tertiary)] border border-[var(--border-primary)] font-mono text-xs rounded-lg overflow-hidden">
            <div className="flex items-stretch justify-between">
                {/* LEFT SECTION */}
                <div className="flex items-stretch">
                    {/* Mode Badge - like nvim NORMAL/INSERT (hidden on mobile) */}
                    <div className="hidden md:flex bg-[var(--text-primary)] text-[var(--bg-primary)] px-3 py-1 font-bold items-center whitespace-nowrap">
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
                        <div className="flex items-center px-3 py-1 text-[var(--text-muted)] border-r border-[var(--border-primary)]/30 whitespace-nowrap">
                            [{selectedCount} app{selectedCount !== 1 ? 's' : ''}]
                        </div>
                    )}

                    {/* AUR Helper Switch */}
                    {showAur && (
                        <div className="flex items-stretch border-r border-[var(--border-primary)]/30">
                            <button
                                onClick={() => setSelectedHelper('yay')}
                                className={`px-3 flex items-center gap-1.5 text-[10px] font-medium transition-colors border-r border-[var(--border-primary)]/30 whitespace-nowrap ${selectedHelper === 'yay' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'}`}
                            >
                                <span className="font-mono opacity-50">1</span>
                                yay
                            </button>
                            <button
                                onClick={() => setSelectedHelper('paru')}
                                className={`px-3 flex items-center gap-1.5 text-[10px] font-medium transition-colors whitespace-nowrap ${selectedHelper === 'paru' ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] font-bold' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'}`}
                            >
                                <span className="font-mono opacity-50">2</span>
                                paru
                            </button>
                        </div>
                    )}
                </div>

                {/* RIGHT SECTION - Compact Shortcuts (hidden on mobile) */}
                <div className="hidden md:flex items-stretch">
                    <div className="hidden sm:flex items-center gap-3 px-3 py-1 text-[var(--text-muted)] text-[10px] border-l border-[var(--border-primary)]/30">
                        {/* Navigation */}
                        <span className="hidden lg:inline"><b className="text-[var(--text-secondary)]">←↓↑→ </b>/<b className="text-[var(--text-secondary)]"> hjkl</b> Navigation</span>
                        <span className="hidden lg:inline opacity-30">·</span>
                        {/* Actions */}
                        <span><b className="text-[var(--text-secondary)]">/</b> search</span>
                        <span className="opacity-30">·</span>
                        <span><b className="text-[var(--text-secondary)]">Space</b> toggle</span>
                        <span className="opacity-30">·</span>
                        <span><b className="text-[var(--text-secondary)]">Tab</b> preview</span>
                        <span className="opacity-30">·</span>
                        <span><b className="text-[var(--text-secondary)]">?</b> help</span>
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
