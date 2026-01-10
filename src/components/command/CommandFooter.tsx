'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Check, Copy, ChevronUp, Download, X } from 'lucide-react';
import { distros, type DistroId } from '@/lib/data';
import { generateInstallScript } from '@/lib/generateInstallScript';
import { analytics } from '@/lib/analytics';
import { useTheme } from '@/hooks/useTheme';
import { ShortcutsBar } from './ShortcutsBar';
import { AurFloatingCard } from './AurFloatingCard';
import { CommandDrawer } from './CommandDrawer';

interface CommandFooterProps {
    command: string;
    selectedCount: number;
    selectedDistro: DistroId;
    selectedApps: Set<string>;
    hasAurPackages: boolean;
    aurAppNames: string[];
    hasYayInstalled: boolean;
    setHasYayInstalled: (value: boolean) => void;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    searchInputRef: React.RefObject<HTMLInputElement | null>;
    clearAll: () => void;
    selectedHelper: 'yay' | 'paru';
    setSelectedHelper: (helper: 'yay' | 'paru') => void;
}

// The sticky footer with command preview and copy/download buttons
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
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerClosing, setDrawerClosing] = useState(false);
    const [hasEverHadSelection, setHasEverHadSelection] = useState(false);
    const initialCountRef = useRef(selectedCount);

    const { toggle: toggleTheme } = useTheme();

    // Track if selection has changed from initial state (user interaction)
    useEffect(() => {
        if (selectedCount !== initialCountRef.current && !hasEverHadSelection) {
            setHasEverHadSelection(true);
        }
    }, [selectedCount, hasEverHadSelection]);

    const closeDrawer = useCallback(() => {
        setDrawerClosing(true);
        setTimeout(() => {
            setDrawerOpen(false);
            setDrawerClosing(false);
        }, 250);
    }, []);

    // Close drawer on Escape
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

    // Global keyboard shortcuts (vim-like)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                e.target instanceof HTMLSelectElement
            ) {
                return;
            }

            // Ignore modifier keys (prevents conflicts with browser shortcuts)
            if (e.ctrlKey || e.altKey || e.metaKey) return;

            const alwaysEnabled = ['t', 'c'];
            if (selectedCount === 0 && !alwaysEnabled.includes(e.key)) return;

            switch (e.key) {
                case 'y': handleCopy(); break;
                case 'd': handleDownload(); break;
                case 't':
                    document.body.classList.add('theme-flash');
                    setTimeout(() => document.body.classList.remove('theme-flash'), 150);
                    toggleTheme();
                    break;
                case 'c': clearAll(); break;
                case '1': if (showAur) setSelectedHelper('yay'); break;
                case '2': if (showAur) setSelectedHelper('paru'); break;
                case 'Tab':
                    e.preventDefault();
                    if (selectedCount > 0) setDrawerOpen(prev => !prev);
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedCount, toggleTheme, clearAll, showAur, setSelectedHelper, handleCopy, handleDownload]);

    return (
        <>
            {/* AUR Floating Card */}
            <AurFloatingCard
                show={showAur}
                aurAppNames={aurAppNames}
                hasYayInstalled={hasYayInstalled}
                setHasYayInstalled={setHasYayInstalled}
                selectedHelper={selectedHelper}
                setSelectedHelper={setSelectedHelper}
            />

            {/* Command Drawer */}
            <CommandDrawer
                isOpen={drawerOpen}
                isClosing={drawerClosing}
                onClose={closeDrawer}
                command={command}
                selectedCount={selectedCount}
                copied={copied}
                onCopy={handleCopy}
                onDownload={handleDownload}
                showAur={showAur}
                aurAppNames={aurAppNames}
                hasYayInstalled={hasYayInstalled}
                setHasYayInstalled={setHasYayInstalled}
                selectedHelper={selectedHelper}
                setSelectedHelper={setSelectedHelper}
            />

            {/* Animated footer container - only shows after first selection */}
            {hasEverHadSelection && (
                <div
                    className="fixed bottom-0 left-0 right-0 p-3"
                    style={{
                        zIndex: 10,
                        animation: 'footerSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both'
                    }}
                >
                    <div className="relative w-[85%] mx-auto">
                        {/* Soft glow behind bars */}
                        <div
                            className="absolute -inset-12 pointer-events-none"
                            style={{
                                background: 'var(--bg-primary)',
                                filter: 'blur(40px)',
                                opacity: 1,
                                zIndex: -1
                            }}
                        />

                        <div className="relative flex flex-col gap-1.5">
                            {/* Shortcuts Bar */}
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

                            {/* Command Bar */}
                            <div className="bg-[var(--bg-tertiary)] font-mono text-xs rounded-lg overflow-hidden border border-[var(--border-primary)]/40 shadow-2xl">
                                <div className="flex items-stretch">
                                    {/* Preview button (hidden on mobile) */}
                                    <button
                                        onClick={() => selectedCount > 0 && setDrawerOpen(true)}
                                        disabled={selectedCount === 0}
                                        className={`hidden md:flex items-center gap-2 px-4 py-3 border-r border-[var(--border-primary)]/30 transition-colors shrink-0 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 ${selectedCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        title="Toggle Preview (Tab)"
                                    >
                                        <ChevronUp className="w-3.5 h-3.5 shrink-0" />
                                        <span className="font-bold whitespace-nowrap">PREVIEW</span>
                                        {selectedCount > 0 && (
                                            <span className="text-[10px] opacity-60 ml-0.5 whitespace-nowrap">[{selectedCount}]</span>
                                        )}
                                    </button>

                                    {/* Command text */}
                                    <div
                                        className="flex-1 min-w-0 flex items-center justify-center px-4 py-4 overflow-hidden bg-[var(--bg-secondary)] cursor-pointer hover:bg-[var(--bg-hover)] transition-colors group"
                                        onClick={() => selectedCount > 0 && setDrawerOpen(true)}
                                    >
                                        <code className={`whitespace-nowrap overflow-x-auto command-scroll leading-none ${selectedCount > 0 ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                                            {command}
                                        </code>
                                    </div>

                                    {/* Clear button (hidden on mobile) */}
                                    <button
                                        onClick={clearAll}
                                        disabled={selectedCount === 0}
                                        className={`hidden md:flex items-center gap-1.5 px-3 py-3 border-l border-[var(--border-primary)]/30 transition-all duration-150 font-sans text-sm font-medium ${selectedCount > 0
                                            ? 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] active:scale-[0.97]'
                                            : 'text-[var(--text-muted)] opacity-50 cursor-not-allowed'
                                            }`}
                                        title="Clear All (c)"
                                    >
                                        <X className="w-3.5 h-3.5 shrink-0" />
                                        <span className="hidden sm:inline whitespace-nowrap">Clear</span>
                                    </button>

                                    {/* Download button (hidden on mobile) */}
                                    <button
                                        onClick={handleDownload}
                                        disabled={selectedCount === 0}
                                        className={`hidden md:flex items-center gap-1.5 px-3 py-3 border-l border-[var(--border-primary)]/30 transition-all duration-150 font-sans text-sm font-medium ${selectedCount > 0
                                            ? 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] active:scale-[0.97]'
                                            : 'text-[var(--text-muted)] opacity-50 cursor-not-allowed'
                                            }`}
                                        title="Download Script (d)"
                                    >
                                        <Download className="w-3.5 h-3.5 shrink-0" />
                                        <span className="hidden sm:inline whitespace-nowrap">Download</span>
                                    </button>

                                    {/* Copy button (hidden on mobile) */}
                                    <button
                                        onClick={handleCopy}
                                        disabled={selectedCount === 0}
                                        className={`hidden md:flex items-center gap-1.5 px-3 py-3 border-l border-[var(--border-primary)]/30 transition-all duration-150 font-sans text-sm font-medium ${selectedCount > 0
                                            ? (copied
                                                ? 'text-emerald-400'
                                                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] active:scale-[0.97]')
                                            : 'text-[var(--text-muted)] opacity-50 cursor-not-allowed'
                                            }`}
                                        title="Copy Command (y)"
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
                                        <span className="hidden sm:inline whitespace-nowrap">{copied ? 'Copied!' : 'Copy'}</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
