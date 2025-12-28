'use client';

import { useState, useEffect, useCallback } from 'react';
import { Check, Copy, ChevronUp, X, Download } from 'lucide-react';
import { distros, type DistroId } from '@/lib/data';
import { generateInstallScript } from '@/lib/generateInstallScript';
import { analytics } from '@/lib/analytics';
import { useTheme } from '@/hooks/useTheme';
import { ShortcutsBar } from './ShortcutsBar';
import { AurFloatingCard } from './AurFloatingCard';
import { AurDrawerSettings } from './AurDrawerSettings';

interface CommandFooterProps {
    command: string;
    selectedCount: number;
    selectedDistro: DistroId;
    selectedApps: Set<string>;
    hasAurPackages: boolean;
    aurAppNames: string[];
    hasYayInstalled: boolean;
    setHasYayInstalled: (value: boolean) => void;
    // Search props
    searchQuery: string;
    onSearchChange: (query: string) => void;
    searchInputRef: React.RefObject<HTMLInputElement | null>;
    // Clear selections
    clearAll: () => void;
    // AUR Helper
    selectedHelper: 'yay' | 'paru';
    setSelectedHelper: (helper: 'yay' | 'paru') => void;
}

/**
 * CommandFooter - Fixed bottom bar with command output
 * 
 * Features shortcuts bar at top, command preview, AUR badge, Download/Copy buttons.
 * Search is now a separate floating popup component.
 * 
 * Update: Added distinct drawer expansion button and global hotkeys.
 */
export function CommandFooter({
    command,
    selectedCount,
    selectedDistro,
    selectedApps,
    hasAurPackages,
    aurAppNames,
    hasYayInstalled,
    setHasYayInstalled,
    searchQuery,
    onSearchChange,
    searchInputRef,
    clearAll,
    selectedHelper,
    setSelectedHelper,
}: CommandFooterProps) {
    const [copied, setCopied] = useState(false);
    const [showCopyTooltip, setShowCopyTooltip] = useState(false);
    const [showDownloadTooltip, setShowDownloadTooltip] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerClosing, setDrawerClosing] = useState(false);

    const { toggle: toggleTheme } = useTheme();

    const closeDrawer = useCallback(() => {
        setDrawerClosing(true);
        setTimeout(() => {
            setDrawerOpen(false);
            setDrawerClosing(false);
        }, 250);
    }, []);

    // Close drawer on Escape key
    useEffect(() => {
        if (!drawerOpen) return;
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeDrawer();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [drawerOpen, closeDrawer]);

    const showAur = selectedDistro === 'arch' && hasAurPackages;
    const distroDisplayName = distros.find(d => d.id === selectedDistro)?.name || selectedDistro;

    // Global keyboard shortcuts (vim-like)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if in naturally interactive elements
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                e.target instanceof HTMLSelectElement
            ) {
                return;
            }

            // These shortcuts always work
            const alwaysEnabled = ['t', 'c'];
            if (selectedCount === 0 && !alwaysEnabled.includes(e.key)) return;

            switch (e.key) {
                case 'y':
                    handleCopy();
                    break;
                case 'd':
                    handleDownload();
                    break;
                case 't':
                    // Flash effect for theme toggle
                    document.body.classList.add('theme-flash');
                    setTimeout(() => document.body.classList.remove('theme-flash'), 150);
                    toggleTheme();
                    break;
                case 'c':
                    clearAll();
                    break;
                case '1':
                    if (showAur) setSelectedHelper('yay');
                    break;
                case '2':
                    if (showAur) setSelectedHelper('paru');
                    break;
                case 'Tab':
                    e.preventDefault();
                    if (selectedCount > 0) {
                        setDrawerOpen(prev => !prev);
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedCount, toggleTheme, clearAll, showAur, setHasYayInstalled]);

    const handleCopy = async () => {
        if (selectedCount === 0) return;
        await navigator.clipboard.writeText(command);
        setCopied(true);
        setShowCopyTooltip(true);
        const distroName = distros.find(d => d.id === selectedDistro)?.name || selectedDistro;
        analytics.commandCopied(distroName, selectedCount);
        setTimeout(() => {
            setCopied(false);
            setShowCopyTooltip(false);
        }, 3000);
    };

    const handleDownload = () => {
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
    };

    return (
        <div className="fixed bottom-0 left-0 right-0 p-3" style={{ zIndex: 10 }}>
            {/* AUR Floating Card - appears when AUR packages selected */}
            <AurFloatingCard
                show={showAur}
                aurAppNames={aurAppNames}
                hasYayInstalled={hasYayInstalled}
                setHasYayInstalled={setHasYayInstalled}
                selectedHelper={selectedHelper}
                setSelectedHelper={setSelectedHelper}
            />

            {/* Footer container with strong outer glow */}
            <div className="relative w-[85%] mx-auto">
                {/* Outer glow - large spread */}
                <div
                    className="absolute -inset-12 rounded-3xl pointer-events-none"
                    style={{
                        background: 'var(--bg-primary)',
                        filter: 'blur(40px)',
                        zIndex: -1
                    }}
                />
                {/* Middle glow layer */}
                <div
                    className="absolute -inset-8 rounded-3xl pointer-events-none"
                    style={{
                        background: 'var(--bg-primary)',
                        filter: 'blur(30px)',
                        zIndex: -1
                    }}
                />
                {/* Inner glow - sharp */}
                <div
                    className="absolute -inset-4 rounded-2xl pointer-events-none"
                    style={{
                        background: 'var(--bg-primary)',
                        filter: 'blur(20px)',
                        zIndex: -1
                    }}
                />

                {/* Bars container */}
                <div className="relative flex flex-col gap-1.5">
                    {/* Shortcuts Bar with Search (nvim-style) */}
                    <ShortcutsBar
                        searchQuery={searchQuery}
                        onSearchChange={onSearchChange}
                        searchInputRef={searchInputRef}
                        selectedCount={selectedCount}
                        distroName={distroDisplayName}
                        showAur={showAur}
                        selectedHelper={selectedHelper}
                        setSelectedHelper={setSelectedHelper}
                    />

                    {/* Command Bar - Bufferline style tabs */}
                    <div className="bg-[var(--bg-tertiary)] font-mono text-xs rounded-lg overflow-hidden border border-[var(--border-primary)]/40 shadow-2xl">
                        <div className="flex items-stretch">
                            {/* Tab: Expand/Preview (opens drawer) */}
                            <button
                                onClick={() => selectedCount > 0 && setDrawerOpen(true)}
                                disabled={selectedCount === 0}
                                className={`flex items-center gap-2 px-4 py-3 border-r border-[var(--border-primary)]/30 transition-all shrink-0 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 ${selectedCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                title="Toggle Preview (Tab)"
                            >
                                <ChevronUp className="w-3.5 h-3.5" />
                                <span className="font-bold">PREVIEW</span>
                                {selectedCount > 0 && (
                                    <span className="text-[10px] opacity-60 ml-0.5">[{selectedCount}]</span>
                                )}
                            </button>

                            {/* Command text - fills available space, centered both ways */}
                            <div
                                className="flex-1 min-w-0 flex items-center justify-center px-4 py-4 overflow-hidden bg-[var(--bg-secondary)] cursor-pointer hover:bg-[var(--bg-hover)] transition-colors group"
                                onClick={() => selectedCount > 0 && setDrawerOpen(true)}
                            >
                                <code className={`whitespace-nowrap overflow-x-auto command-scroll leading-none ${selectedCount > 0 ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                                    {command}
                                </code>
                            </div>

                            {/* Tab: Download */}
                            <button
                                onClick={handleDownload}
                                disabled={selectedCount === 0}
                                onMouseEnter={() => selectedCount > 0 && setShowDownloadTooltip(true)}
                                onMouseLeave={() => setShowDownloadTooltip(false)}
                                className={`flex items-center gap-1.5 px-3 py-3 border-l border-[var(--border-primary)]/30 transition-colors ${selectedCount > 0
                                    ? 'text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)]'
                                    : 'text-[var(--text-muted)] opacity-50 cursor-not-allowed'
                                    }`}
                                title="Download Script (d)"
                            >
                                <Download className="w-3 h-3" />
                                <span className="hidden sm:inline">Download</span>
                            </button>

                            {/* Tab: Copy (highlighted) */}
                            <button
                                onClick={handleCopy}
                                disabled={selectedCount === 0}
                                className={`flex items-center gap-1.5 px-3 py-3 border-l border-[var(--border-primary)]/30 transition-colors ${selectedCount > 0
                                    ? (copied
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90')
                                    : 'text-[var(--text-muted)] opacity-50 cursor-not-allowed'
                                    }`}
                                title="Copy Command (y)"
                            >
                                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                                <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Slide-up Drawer */}
                    {drawerOpen && (
                        <>
                            {/* Backdrop */}
                            <div
                                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                                onClick={closeDrawer}
                                aria-hidden="true"
                                style={{ animation: drawerClosing ? 'fadeOut 0.3s ease-out forwards' : 'fadeIn 0.3s ease-out' }}
                            />
                            {/* Drawer */}
                            <div
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="drawer-title"
                                className="fixed z-50 bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-2xl
                        bottom-0 left-0 right-0 rounded-t-2xl
                        md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:max-w-2xl md:w-[90vw]"
                                style={{
                                    animation: drawerClosing
                                        ? 'slideDown 0.3s cubic-bezier(0.32, 0, 0.67, 0) forwards'
                                        : 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                                    maxHeight: '80vh'
                                }}
                            >
                                {/* Drawer Handle - mobile only */}
                                <div className="flex justify-center pt-3 pb-2 md:hidden">
                                    <button
                                        className="w-12 h-1.5 bg-[var(--text-muted)]/40 rounded-full cursor-pointer hover:bg-[var(--text-muted)] transition-colors"
                                        onClick={closeDrawer}
                                        aria-label="Close drawer"
                                    />
                                </div>

                                {/* Drawer Header */}
                                <div className="flex items-center justify-between px-4 sm:px-6 pb-3 md:pt-4 border-b border-[var(--border-primary)]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                            <span className="text-emerald-500 font-bold text-sm">$</span>
                                        </div>
                                        <div>
                                            <h3 id="drawer-title" className="text-sm font-semibold text-[var(--text-primary)]">Terminal Command</h3>
                                            <p className="text-xs text-[var(--text-muted)]">{selectedCount} app{selectedCount !== 1 ? 's' : ''} • Press Esc to close</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={closeDrawer}
                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                                        aria-label="Close drawer"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Command Content */}
                                <div className="p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 200px)' }}>
                                    {/* AUR Settings (if AUR packages selected) */}
                                    {showAur && (
                                        <AurDrawerSettings
                                            aurAppNames={aurAppNames}
                                            hasYayInstalled={hasYayInstalled}
                                            setHasYayInstalled={setHasYayInstalled}
                                            selectedHelper={selectedHelper}
                                            setSelectedHelper={setSelectedHelper}
                                        />
                                    )}
                                    <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-[var(--border-primary)]">
                                        <div className="flex items-center justify-between px-4 py-2 bg-[#252525] border-b border-[var(--border-primary)]">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                                <span className="ml-2 text-xs text-[var(--text-muted)]">bash</span>
                                            </div>
                                            <div className="hidden md:flex items-center gap-2">
                                                <button
                                                    onClick={handleDownload}
                                                    className="h-7 px-3 flex items-center gap-1.5 rounded-md bg-[var(--bg-tertiary)]/50 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors text-xs font-medium"
                                                >
                                                    <Download className="w-3.5 h-3.5" />
                                                    Download
                                                </button>
                                                <button
                                                    onClick={() => { handleCopy(); setTimeout(closeDrawer, 3000); }}
                                                    className={`h-7 px-3 flex items-center gap-1.5 rounded-md text-xs font-medium transition-all ${copied
                                                        ? 'bg-emerald-600 text-white'
                                                        : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white'
                                                        }`}
                                                >
                                                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                                    {copied ? 'Copied!' : 'Copy'}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-4 font-mono text-sm overflow-x-auto">
                                            <div className="flex gap-2">
                                                <span className="text-emerald-400 select-none shrink-0">$</span>
                                                <code className="text-gray-300 break-all whitespace-pre-wrap" style={{ lineHeight: '1.6' }}>
                                                    {command}
                                                </code>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Mobile Actions */}
                                <div className="md:hidden flex flex-col items-stretch gap-3 px-4 py-4 border-t border-[var(--border-primary)]">
                                    <button
                                        onClick={handleDownload}
                                        className="flex-1 h-14 flex items-center justify-center gap-2 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors font-medium text-base"
                                    >
                                        <Download className="w-5 h-5" />
                                        Download Script
                                    </button>
                                    <button
                                        onClick={() => { handleCopy(); setTimeout(closeDrawer, 3000); }}
                                        className={`flex-1 h-14 flex items-center justify-center gap-2 rounded-xl font-medium text-base transition-all ${copied
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90'
                                            }`}
                                    >
                                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                        {copied ? 'Copied!' : 'Copy Command'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
