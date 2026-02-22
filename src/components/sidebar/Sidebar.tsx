'use client';

import { useState, useCallback } from 'react';
import { Check, Copy, Download, X, Search, ChevronDown, Github, Heart, Eye, Terminal, Trash2 } from 'lucide-react';
import { distros, type DistroId } from '@/lib/data';
import { generateInstallScript } from '@/lib/generateInstallScript';
import { analytics } from '@/lib/analytics';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { DistroIcon } from '@/components/distro/DistroIcon';
import { HowItWorks } from '@/components/header/HowItWorks';

interface SidebarProps {
    selectedDistro: DistroId;
    onDistroSelect: (id: DistroId) => void;
    selectedApps: Set<string>;
    selectedCount: number;
    clearAll: () => void;
    command: string;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    searchInputRef: React.RefObject<HTMLInputElement | null>;
    hasAurPackages: boolean;
    aurAppNames: string[];
    selectedHelper: 'yay' | 'paru';
    setSelectedHelper: (helper: 'yay' | 'paru') => void;
    hasUnfreePackages?: boolean;
    unfreeAppNames?: string[];
    onOpenDrawer: () => void;
    activeShortcut?: string | null;
}

export function Sidebar({
    selectedDistro,
    onDistroSelect,
    selectedApps,
    selectedCount,
    clearAll,
    command,
    searchQuery,
    onSearchChange,
    searchInputRef,
    hasAurPackages,
    aurAppNames,
    selectedHelper,
    setSelectedHelper,
    hasUnfreePackages,
    unfreeAppNames,
    onOpenDrawer,
    activeShortcut,
}: SidebarProps) {
    const [copied, setCopied] = useState(false);
    const [distroOpen, setDistroOpen] = useState(false);

    const showAur = selectedDistro === 'arch' && hasAurPackages;
    const currentDistro = distros.find(d => d.id === selectedDistro);
    const distroColor = currentDistro?.color || 'var(--accent)';

    const handleCopy = useCallback(async () => {
        if (selectedCount === 0) return;
        await navigator.clipboard.writeText(command);
        setCopied(true);
        const distroName = distros.find(d => d.id === selectedDistro)?.name || selectedDistro;
        analytics.commandCopied(distroName, selectedCount);
        setTimeout(() => setCopied(false), 3000);
    }, [command, selectedCount, selectedDistro]);

    const handleDownload = useCallback(() => {
        if (selectedCount === 0) return;
        const script = generateInstallScript({
            distroId: selectedDistro,
            selectedAppIds: selectedApps,
            helper: selectedHelper,
        });
        const isNix = selectedDistro === 'nix';
        const mimeType = isNix ? 'text/plain' : 'text/x-shellscript';
        const blob = new Blob([script], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = isNix ? 'configuration.nix' : `tuxmate-${selectedDistro}.sh`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        const distroName = distros.find(d => d.id === selectedDistro)?.name || selectedDistro;
        analytics.scriptDownloaded(distroName, selectedCount);
    }, [selectedCount, selectedDistro, selectedApps, selectedHelper]);

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape' || e.key === 'Enter') {
            e.preventDefault();
            (e.target as HTMLInputElement).blur();
        }
    };

    return (
        <aside className="sidebar fixed left-0 top-0 bottom-0 hidden lg:flex flex-col overflow-hidden"
            style={{
                width: '380px',
                zIndex: 20,
            }}
        >
            <div className="px-6 pt-7 pb-5">
                <div className="flex items-center gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src="/tuxmate.png"
                        alt="TuxMate Logo"
                        className="w-16 h-16 object-contain shrink-0"
                    />
                    <div className="flex flex-col items-start">
                        <h1 className="text-[28px] font-extrabold tracking-tight text-[var(--text-primary)] leading-none"
                            style={{ fontFamily: 'var(--font-heading)', transition: 'color 0.5s' }}>
                            TuxMate
                        </h1>
                        <p className="text-[11px] text-[var(--text-muted)] tracking-[0.14em] uppercase mt-2 font-medium leading-none"
                            style={{ transition: 'color 0.5s' }}>
                            Linux Bulk App Installer
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden sidebar-scroll">
                <div className="px-5 pb-5">
                    <div className="sidebar-search flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-[var(--border-primary)]/20 bg-transparent">
                        <Search className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0 opacity-40" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            placeholder="Search apps..."
                            className="flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/40 outline-none"
                        />
                        {searchQuery ? (
                            <button
                                onClick={() => onSearchChange('')}
                                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        ) : (
                            <kbd className="text-[10px] text-[var(--text-muted)]/40 border border-[var(--border-primary)]/30 rounded px-1.5 py-0.5 font-mono">/</kbd>
                        )}
                    </div>
                </div>

                <div className="px-5 pb-5 relative">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-2 px-1 font-semibold">Distribution</p>
                    <button
                        onClick={() => setDistroOpen(prev => !prev)}
                        className="sidebar-distro-btn w-full flex items-center gap-3.5 px-4 py-3 rounded-xl border border-[var(--border-primary)]/20 bg-[var(--bg-secondary)]/50"
                    >
                        <div className="w-7 h-7 flex items-center justify-center shrink-0 rounded-lg"
                            style={{ backgroundColor: `color-mix(in srgb, ${distroColor}, transparent 80%)` }}>
                            <DistroIcon url={currentDistro?.iconUrl || ''} name={currentDistro?.name || ''} size={20} />
                        </div>
                        <span className="flex-1 text-left text-sm font-semibold text-[var(--text-primary)]">
                            {currentDistro?.name}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${distroOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {distroOpen && (
                        <div className="absolute left-5 right-5 mt-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)]/30 overflow-hidden shadow-xl z-50"
                            style={{ animation: 'dropIn 0.2s ease-out' }}>
                            {distros.map((distro) => (
                                <button
                                    key={distro.id}
                                    onClick={() => {
                                        onDistroSelect(distro.id);
                                        setDistroOpen(false);
                                        analytics.distroSelected(distro.name);
                                    }}
                                    className={`w-full flex items-center gap-3 py-2.5 px-4 text-left transition-all duration-100 ${selectedDistro === distro.id
                                        ? ''
                                        : 'hover:bg-[var(--bg-hover)]'
                                        }`}
                                    style={{
                                        backgroundColor: selectedDistro === distro.id
                                            ? `color-mix(in srgb, ${distro.color}, transparent 85%)`
                                            : undefined,
                                    }}
                                >
                                    <div className="w-5 h-5 flex items-center justify-center">
                                        <DistroIcon url={distro.iconUrl} name={distro.name} size={18} />
                                    </div>
                                    <span className={`flex-1 text-sm ${selectedDistro === distro.id
                                        ? 'text-[var(--text-primary)] font-semibold'
                                        : 'text-[var(--text-secondary)]'
                                        }`}>{distro.name}</span>
                                    {selectedDistro === distro.id && (
                                        <Check className="w-4 h-4" style={{ color: distro.color }} strokeWidth={2.5} />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mx-5 mb-4 border-t border-[var(--border-primary)]/15" />
                <div className="px-5 pb-4">
                    <div className="flex items-center justify-between mb-2.5 px-1">
                        <div className="flex items-center gap-2">
                            <Terminal className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                            <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-semibold">Command</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {selectedCount > 0 && (
                                <span className="text-[12px] font-bold px-2 py-0.5 rounded-full"
                                    style={{
                                        backgroundColor: `color-mix(in srgb, ${distroColor}, transparent 82%)`,
                                        color: distroColor,
                                    }}>
                                    {selectedCount} app{selectedCount !== 1 ? 's' : ''}
                                </span>
                            )}
                        </div>
                    </div>

                    <div
                        className="sidebar-command-preview rounded-xl bg-[var(--bg-secondary)]/60 border border-[var(--border-primary)]/15 overflow-hidden cursor-pointer group"
                        onClick={() => selectedCount > 0 && onOpenDrawer()}
                    >
                        <div className="px-4 py-3.5">
                            <div className="flex items-start gap-2">
                                {selectedDistro !== 'nix' && selectedCount > 0 && (
                                    <span className="text-xs font-bold shrink-0 mt-0.5 select-none opacity-50" style={{ color: distroColor }}>$</span>
                                )}
                                <code className={`text-[13px] font-mono leading-[1.6] break-all ${selectedCount > 0 ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] opacity-50'
                                    }`}
                                    style={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                    }}
                                >
                                    {selectedCount > 0 ? command : 'Select apps to generate command...'}
                                </code>
                            </div>
                        </div>
                        {selectedCount > 0 && (
                            <div className="px-4 py-2 bg-[var(--bg-tertiary)]/50 border-t border-[var(--border-primary)]/15 flex items-center justify-center gap-1.5 text-[10px] text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">
                                <Eye className="w-3 h-3" />
                                <span>Click for full preview</span>
                                <kbd className="ml-1 text-[9px] border border-[var(--border-primary)]/30 rounded px-1 py-px font-mono opacity-50">Tab</kbd>
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-5 pb-3">
                    <div className="grid grid-cols-2 gap-2.5 mb-2.5">
                        <button
                            data-action="copy"
                            onClick={handleCopy}
                            disabled={selectedCount === 0}
                            className={`sidebar-action-btn flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all ${selectedCount === 0
                                ? 'opacity-30 cursor-not-allowed bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                                : copied
                                    ? 'text-white shadow-lg'
                                    : activeShortcut === 'y'
                                        ? 'bg-[var(--bg-hover)] opacity-80 shadow-inner scale-[0.98]'
                                        : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                                }`}
                            style={{
                                backgroundColor: copied ? distroColor : undefined,
                            }}
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4 opacity-60" />}
                            <span>{copied ? 'Copied!' : 'Copy'}</span>
                        </button>
                        <button
                            data-action="download"
                            onClick={handleDownload}
                            disabled={selectedCount === 0}
                            className={`sidebar-action-btn flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all ${selectedCount === 0
                                ? 'opacity-30 cursor-not-allowed bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                                : activeShortcut === 'd'
                                    ? 'bg-[var(--bg-hover)] opacity-80 shadow-inner scale-[0.98]'
                                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                                }`}
                        >
                            <Download className="w-4 h-4 opacity-60" />
                            <span>Download</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                        <button
                            onClick={() => selectedCount > 0 && onOpenDrawer()}
                            disabled={selectedCount === 0}
                            className={`sidebar-action-btn flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all ${selectedCount === 0
                                ? 'opacity-30 cursor-not-allowed bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                                : 'text-white shadow-md'
                                }`}
                            style={{
                                backgroundColor: selectedCount > 0 ? distroColor : undefined,
                            }}
                        >
                            <Eye className="w-4 h-4" />
                            <span>Preview</span>
                        </button>
                        <button
                            onClick={clearAll}
                            disabled={selectedCount === 0}
                            className={`sidebar-action-btn flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all ${selectedCount === 0
                                ? 'opacity-30 cursor-not-allowed bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                                : activeShortcut === 'c'
                                    ? 'bg-red-500/20 text-red-400 scale-[0.98]'
                                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10'
                                }`}
                        >
                            <Trash2 className="w-4 h-4 opacity-60" />
                            <span>Clear All</span>
                        </button>
                    </div>
                </div>

                {showAur && (
                    <>
                        <div className="mx-5 my-3 border-t border-[var(--border-primary)]/25" />
                        <div className="px-5 pb-2">
                            <div className="flex items-center gap-2 mb-2.5 px-1">
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#1793d1">
                                    <path d="M12 0c-.39 0-.77.126-1.11.365a2.22 2.22 0 0 0-.82 1.056L0 24h4.15l2.067-5.58h11.666L19.95 24h4.05L13.91 1.42A2.24 2.24 0 0 0 12 0zm0 4.542l5.77 15.548H6.23l5.77-15.548z" />
                                </svg>
                                <p className="text-[11px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-semibold">AUR Helper</p>
                                <span className="text-[10px] text-[var(--text-muted)] opacity-50">·</span>
                                <span className="text-[10px] text-[var(--text-muted)]">{aurAppNames.length} pkg{aurAppNames.length !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {(['yay', 'paru'] as const).map((helper) => (
                                    <button
                                        key={helper}
                                        onClick={() => setSelectedHelper(helper)}
                                        className={`py-3 px-4 rounded-xl text-sm font-semibold transition-all ${selectedHelper === helper
                                            ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm'
                                            : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                                            }`}
                                    >
                                        {helper}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {selectedDistro === 'nix' && hasUnfreePackages && unfreeAppNames && unfreeAppNames.length > 0 && (
                    <>
                        <div className="mx-5 my-3 border-t border-[var(--border-primary)]/25" />
                        <div className="px-5 pb-2">
                            <div className="p-3.5 rounded-xl bg-amber-500/8 border border-amber-500/20">
                                <p className="text-[11px] font-semibold text-amber-400 mb-1 flex items-center gap-1.5">
                                    <span className="text-amber-400">⚠</span> Unfree Packages
                                </p>
                                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                                    {unfreeAppNames.join(', ')} require{' '}
                                    <code className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[10px] font-mono rounded-md">allowUnfree = true</code>
                                </p>
                            </div>
                        </div>
                    </>
                )}

                <div className="min-h-4" />
                <div className="px-5 pb-3">
                    <div className="px-4 py-4 rounded-xl bg-[var(--bg-secondary)]/40 border border-[var(--border-primary)]/15">
                        <p className="text-[12px] uppercase tracking-[0.15em] text-[var(--text-secondary)] font-bold mb-3">Keyboard</p>
                        <div className="grid grid-cols-2 gap-y-2.5 gap-x-6 text-[13px]">
                            <div className="flex items-center justify-between">
                                <span className="text-[var(--text-secondary)]">Search</span>
                                <kbd className="text-[11px] text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-primary)]/50 rounded-md px-2 py-0.5 font-mono font-medium shadow-sm">/</kbd>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[var(--text-secondary)]">Navigate</span>
                                <kbd className="text-[11px] text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-primary)]/50 rounded-md px-2 py-0.5 font-mono font-medium shadow-sm">←→↑↓</kbd>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[var(--text-secondary)]">Select</span>
                                <kbd className="text-[11px] text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-primary)]/50 rounded-md px-2 py-0.5 font-mono font-medium shadow-sm">Space</kbd>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[var(--text-secondary)]">Copy</span>
                                <kbd className="text-[11px] text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-primary)]/50 rounded-md px-2 py-0.5 font-mono font-medium shadow-sm">y</kbd>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[var(--text-secondary)]">Download</span>
                                <kbd className="text-[11px] text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-primary)]/50 rounded-md px-2 py-0.5 font-mono font-medium shadow-sm">d</kbd>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[var(--text-secondary)]">Preview</span>
                                <kbd className="text-[11px] text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-primary)]/50 rounded-md px-2 py-0.5 font-mono font-medium shadow-sm">Tab</kbd>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[var(--text-secondary)]">Theme</span>
                                <kbd className="text-[11px] text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-primary)]/50 rounded-md px-2 py-0.5 font-mono font-medium shadow-sm">t</kbd>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[var(--text-secondary)]">Clear All</span>
                                <kbd className="text-[11px] text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-primary)]/50 rounded-md px-2 py-0.5 font-mono font-medium shadow-sm">c</kbd>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[var(--text-secondary)]">Help</span>
                                <kbd className="text-[11px] text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-primary)]/50 rounded-md px-2 py-0.5 font-mono font-medium shadow-sm">?</kbd>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[var(--text-secondary)]">Close</span>
                                <kbd className="text-[11px] text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-primary)]/50 rounded-md px-2 py-0.5 font-mono font-medium shadow-sm">Esc</kbd>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
            <div className="px-5 py-4 border-t border-[var(--border-primary)]/15">
                <div className="flex items-center justify-between">
                    <ThemeToggle />

                    {/* Links */}
                    <div className="flex items-center gap-0.5">
                        <a
                            href="https://github.com/abusoww/tuxmate"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all text-[12px]"
                            title="View on GitHub"
                            onClick={() => analytics.githubClicked()}
                        >
                            <Github className="w-4 h-4" />
                        </a>
                        <a
                            href="https://github.com/abusoww/tuxmate/blob/main/CONTRIBUTING.md"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-rose-400 transition-all text-[12px]"
                            title="Contribute"
                            onClick={() => analytics.contributeClicked()}
                        >
                            <Heart className="w-4 h-4" />
                        </a>
                        <HowItWorks />
                    </div>
                </div>
            </div>
        </aside>
    );
}
