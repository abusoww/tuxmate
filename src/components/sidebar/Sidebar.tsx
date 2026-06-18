'use client';

import { useState, useCallback } from 'react';
import { Check, Copy, Download, X, Search, ChevronDown, Github, Heart, Eye, Terminal, Trash2 } from 'lucide-react';
import { distros, type DistroId } from '@/lib/data';
import { generateInstallScript } from '@/lib/generateInstallScript';
import { analytics } from '@/lib/analytics';
import { useI18n } from '@/hooks/useI18n';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { DistroIcon } from '@/components/distro/DistroIcon';
import { HowItWorks } from '@/components/header/HowItWorks';
import { LocaleToggle } from '@/components/i18n';

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
    hasFlatpakPackages?: boolean;
    flatpakAppNames?: string[];
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
    hasFlatpakPackages,
    flatpakAppNames,
    onOpenDrawer,
    activeShortcut,
}: SidebarProps) {
    const [copied, setCopied] = useState(false);
    const [distroOpen, setDistroOpen] = useState(false);
    const { t, fmt, dir } = useI18n();

    const showAur = selectedDistro === 'arch' && hasAurPackages;
    const currentDistro = distros.find(d => d.id === selectedDistro);
    const distroColor = currentDistro?.color || 'var(--accent)';
    const isRtl = dir === 'rtl';

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
        const blob = new Blob([script], { type: 'text/x-shellscript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tuxmate-${selectedDistro}.sh`;
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

    const availableDistros = distros;

    const keyboardShortcuts = [
        { label: t.sidebar.searchLabel, key: '/' },
        { label: t.sidebar.navigateLabel, key: '←→↑↓' },
        { label: t.sidebar.selectLabel, key: 'Space' },
        { label: t.sidebar.copyLabel, key: 'y' },
        { label: t.sidebar.downloadLabel, key: 'd' },
        { label: t.sidebar.previewLabel, key: 'Tab' },
        { label: t.sidebar.themeLabel, key: 't' },
        { label: t.sidebar.clearLabel, key: 'c' },
        { label: t.sidebar.helpLabel, key: '?' },
        { label: t.sidebar.closeLabel, key: 'Esc' },
    ];

    const appCountLabel = selectedCount === 1
        ? fmt(t.sidebar.appCount, { count: selectedCount })
        : fmt(t.sidebar.appCount_plural, { count: selectedCount });

    return (
        <aside
            className="sidebar fixed top-0 bottom-0 hidden lg:flex flex-col overflow-hidden"
            style={{
                width: '380px',
                zIndex: 20,
                [isRtl ? 'right' : 'left']: 0,
            }}
        >
            <div className={`px-6 pt-7 pb-5 ${isRtl ? 'text-right' : ''}`}>
                <div className={`flex items-center gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <img
                        src="/tuxmate.png"
                        alt={t.app.title}
                        className="w-14 h-14 object-contain shrink-0"
                    />
                    <div className={`flex flex-col ${isRtl ? 'items-end' : 'items-start'}`}>
                        <h1 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] leading-none">
                            {t.app.title}
                        </h1>
                        <p className="text-[11px] text-[var(--text-muted)] tracking-[0.14em] uppercase mt-1 font-medium leading-none">
                            {t.app.tagline}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden sidebar-scroll">
                <div className="px-5 pb-5">
                    <div className="sidebar-search flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg border border-[var(--border-primary)] bg-transparent">
                        <Search className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0 opacity-40" />
                        <input
                            ref={searchInputRef}
                            type="text"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                            placeholder={t.sidebar.search}
                            className={`flex-1 bg-transparent text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]/40 outline-none ${isRtl ? 'text-right' : ''}`}
                        />
                        {searchQuery ? (
                            <button
                                onClick={() => onSearchChange('')}
                                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        ) : (
                            <kbd className="text-[10px] text-[var(--text-muted)]/40 border border-[var(--border-primary)] rounded px-1.5 py-0.5 font-mono">/</kbd>
                        )}
                    </div>
                </div>

                <div className="px-5 pb-5 relative">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] mb-2 px-1 font-semibold">
                        {t.sidebar.packageManager}
                    </p>
                    <button
                        onClick={() => setDistroOpen(prev => !prev)}
                        className="sidebar-distro-btn w-full flex items-center gap-3.5 px-4 py-3 rounded-xl border border-[var(--border-primary)] bg-[var(--bg-secondary)]/50"
                    >
                        <div className="w-7 h-7 flex items-center justify-center shrink-0 rounded-lg"
                            style={{ backgroundColor: `color-mix(in srgb, ${distroColor}, transparent 80%)` }}>
                            <DistroIcon url={currentDistro?.iconUrl || ''} name={currentDistro?.name || ''} size={20} />
                        </div>
                        <span className={`flex-1 text-sm font-semibold text-[var(--text-primary)] ${isRtl ? 'text-right' : 'text-left'}`}>
                            {currentDistro?.name}
                        </span>
                        <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 chevron-icon ${distroOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {distroOpen && (
                        <div
                            className="absolute mt-2 rounded-xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] overflow-hidden shadow-xl z-50"
                            style={{
                                [isRtl ? 'right' : 'left']: '1.25rem',
                                [isRtl ? 'left' : 'right']: '1.25rem',
                                animation: 'dropIn 0.2s ease-out',
                            }}
                        >
                            {availableDistros.map((distro) => (
                                <button
                                    key={distro.id}
                                    onClick={() => {
                                        onDistroSelect(distro.id);
                                        setDistroOpen(false);
                                        analytics.distroSelected(distro.name);
                                    }}
                                    className={`w-full flex items-center gap-3 py-2.5 px-4 transition-all duration-100 ${isRtl ? 'text-right' : 'text-left'
                                        } ${selectedDistro === distro.id
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

                <div className="mx-5 mb-4 border-t border-[var(--border-primary)]" />
                <div className="px-5 pb-4">
                    <div className="flex items-center justify-between mb-2.5 px-1">
                        <div className="flex items-center gap-2">
                            <Terminal className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                            <p className="text-[10px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-semibold">{t.sidebar.command}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                            {selectedDistro === 'arch' && hasFlatpakPackages && selectedCount > 0 && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                                    style={{
                                        backgroundColor: `color-mix(in srgb, var(--accent), transparent 82%)`,
                                        color: 'var(--accent)',
                                    }}>
                                    +Flatpak
                                </span>
                            )}
                            {selectedCount > 0 && (
                                <span className="text-[12px] font-bold px-2 py-0.5 rounded-full"
                                    style={{
                                        backgroundColor: `color-mix(in srgb, ${distroColor}, transparent 82%)`,
                                        color: distroColor,
                                    }}>
                                    {appCountLabel}
                                </span>
                            )}
                        </div>
                    </div>

                    <div
                        className="sidebar-command-preview rounded-xl bg-[var(--bg-secondary)]/60 border border-[var(--border-primary)] overflow-hidden cursor-pointer group"
                        onClick={() => selectedCount > 0 && onOpenDrawer()}
                    >
                        <div className="px-4 py-3.5">
                            <div className={`flex items-start gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                {selectedCount > 0 && (
                                    <span className="text-xs font-bold shrink-0 mt-0.5 select-none opacity-50" style={{ color: distroColor }}>$</span>
                                )}
                                <code className={`text-[13px] font-mono leading-[1.6] break-all ${selectedCount > 0 ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] opacity-50'
                                    }`}
                                    style={{
                                        display: '-webkit-box',
                                        WebkitLineClamp: 3,
                                        WebkitBoxOrient: 'vertical',
                                        overflow: 'hidden',
                                        direction: 'ltr',
                                        textAlign: 'left',
                                    }}
                                >
                                    {selectedCount > 0 ? command : t.sidebar.emptyCommand}
                                </code>
                            </div>
                        </div>
                        {selectedCount > 0 && (
                            <div className="px-4 py-2 bg-[var(--bg-tertiary)]/50 border-t border-[var(--border-primary)] flex items-center justify-center gap-1.5 text-[10px] text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors">
                                <Eye className="w-3 h-3" />
                                <span>{t.sidebar.clickForPreview}</span>
                                <kbd className="text-[9px] border border-[var(--border-primary)] rounded px-1 py-px font-mono opacity-50">Tab</kbd>
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
                            <span>{copied ? t.sidebar.copied : t.sidebar.copy}</span>
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
                            <span>{t.sidebar.download}</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                        <button
                            onClick={() => selectedCount > 0 && onOpenDrawer()}
                            disabled={selectedCount === 0}
                            className={`sidebar-action-btn flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all ${selectedCount === 0
                                ? 'opacity-30 cursor-not-allowed bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                                : 'shadow-md'
                                }`}
                            style={{
                                backgroundColor: selectedCount > 0 ? distroColor : undefined,
                                color: selectedCount > 0
                                    ? (distroColor === '#00FF80' || distroColor === '#4A90D9' ? '#000' : '#fff')
                                    : undefined,
                            }}
                        >
                            <Eye className="w-4 h-4" />
                            <span>{t.sidebar.preview}</span>
                        </button>
                        <button
                            onClick={clearAll}
                            disabled={selectedCount === 0}
                            className={`sidebar-action-btn flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-semibold transition-all ${selectedCount === 0
                                ? 'opacity-30 cursor-not-allowed bg-[var(--bg-tertiary)] text-[var(--text-muted)]'
                                : activeShortcut === 'c'
                                    ? 'scale-[0.98]'
                                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/10'
                                }`}
                            style={{
                                backgroundColor: activeShortcut === 'c'
                                    ? `color-mix(in srgb, #ef4444, transparent 80%)`
                                    : undefined,
                                color: activeShortcut === 'c' ? '#ef4444' : undefined,
                            }}
                        >
                            <Trash2 className="w-4 h-4 opacity-60" />
                            <span>{t.sidebar.clearAll}</span>
                        </button>
                    </div>
                </div>

                {showAur && (
                    <>
                        <div className="mx-5 my-3 border-t border-[var(--border-primary)]" />
                        <div className="px-5 pb-2">
                            <div className={`flex items-center gap-2 mb-2.5 px-1 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#1793d1">
                                    <path d="M12 0c-.39 0-.77.126-1.11.365a2.22 2.22 0 0 0-.82 1.056L0 24h4.15l2.067-5.58h11.666L19.95 24h4.05L13.91 1.42A2.24 2.24 0 0 0 12 0zm0 4.542l5.77 15.548H6.23l5.77-15.548z" />
                                </svg>
                                <p className="text-[11px] uppercase tracking-[0.15em] text-[var(--text-muted)] font-semibold">{t.sidebar.aurHelper}</p>
                                <span className="text-[10px] text-[var(--text-muted)] opacity-50">·</span>
                                <span className="text-[10px] text-[var(--text-muted)]">{aurAppNames.length} pkg{aurAppNames.length !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {(['paru', 'yay'] as const).map((helper) => (
                                    <button
                                        key={helper}
                                        onClick={() => setSelectedHelper(helper)}
                                        className={`py-2.5 px-4 rounded-xl text-sm font-semibold transition-all border ${selectedHelper === helper
                                            ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm border-transparent'
                                            : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border-[var(--border-primary)]'
                                            }`}
                                    >
                                        {helper}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                {selectedDistro === 'arch' && hasFlatpakPackages && flatpakAppNames && flatpakAppNames.length > 0 && (
                    <>
                        <div className="mx-5 my-3 border-t border-[var(--border-primary)]" />
                        <div className="px-5 pb-2">
                            <div className="p-3.5 rounded-xl"
                                style={{
                                    backgroundColor: `color-mix(in srgb, var(--accent), transparent 88%)`,
                                    borderColor: `color-mix(in srgb, var(--accent), transparent 70%)`,
                                    borderWidth: 1,
                                }}
                            >
                                <p className="text-[11px] font-semibold mb-1 flex items-center gap-1.5" style={{ color: 'var(--accent)' }}>
                                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0L2 6v12l10 6 10-6V6L12 0zm0 2.1l7.5 4.5L12 11.1 4.5 6.6 12 2.1zm-8 8.4l7 4.2v7l-7-4.2v-7zm10 4.2l7-4.2v7l-7 4.2v-7z" />
                                    </svg>
                                    {t.sidebar.flatpakFallback}
                                </p>
                                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                                    {fmt(t.sidebar.flatpakFallbackDesc, { apps: flatpakAppNames.join(', ') })}
                                </p>
                            </div>
                        </div>
                    </>
                )}

                {selectedDistro === 'nix' && hasUnfreePackages && unfreeAppNames && unfreeAppNames.length > 0 && (
                    <>
                        <div className="mx-5 my-3 border-t border-[var(--border-primary)]" />
                        <div className="px-5 pb-2">
                            <div className="p-3.5 rounded-xl"
                                style={{
                                    backgroundColor: `color-mix(in srgb, #f59e0b, transparent 88%)`,
                                    borderColor: `color-mix(in srgb, #f59e0b, transparent 70%)`,
                                    borderWidth: 1,
                                }}
                            >
                                <p className="text-[11px] font-semibold text-amber-400 mb-1 flex items-center gap-1.5">
                                    <span>⚠</span> {t.sidebar.unfreePackages}
                                </p>
                                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                                    {fmt(t.sidebar.unfreeDesc, { apps: unfreeAppNames.join(', ') })}
                                </p>
                            </div>
                        </div>
                    </>
                )}

                <div className="min-h-4" />
                <div className="px-5 pb-3">
                    <div className="px-4 py-4 rounded-xl bg-[var(--bg-secondary)]/40 border border-[var(--border-primary)]">
                        <p className="text-[11px] uppercase tracking-[0.15em] text-[var(--text-secondary)] font-bold mb-3">
                            {t.sidebar.keyboard}
                        </p>
                        <div className="grid grid-cols-2 gap-y-2.5 gap-x-6 text-[13px]">
                            {keyboardShortcuts.map(({ label, key }) => (
                                <div key={key} className={`flex items-center justify-between ${isRtl ? 'flex-row-reverse' : ''}`}>
                                    <span className="text-[var(--text-secondary)]">{label}</span>
                                    <kbd className="text-[11px] text-[var(--text-primary)] bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-md px-2 py-0.5 font-mono font-medium shadow-sm">{key}</kbd>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-5 py-4 border-t border-[var(--border-primary)]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                        <ThemeToggle />
                        <LocaleToggle />
                    </div>

                    <div className="flex items-center gap-0.5">
                        <a
                            href="https://github.com/parchlinuxb/tuxmate"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all text-[12px]"
                            title={t.flags.github}
                            onClick={() => analytics.githubClicked()}
                        >
                            <Github className="w-4 h-4" />
                        </a>
                        <a
                            href="https://github.com/parchlinuxb/tuxmate/blob/main/CONTRIBUTING.md"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-rose-400 transition-all text-[12px]"
                            title={t.flags.contributing}
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
