'use client';

import { useState, useEffect, useCallback } from 'react';
import { Check, Copy, ChevronUp, Download } from 'lucide-react';
import { distros, type DistroId, type AppData } from '@/lib/data';
import { generateInstallScript } from '@/lib/generateInstallScript';
import { analytics } from '@/lib/analytics';
import { useTheme } from '@/hooks/useTheme';
import { useI18n } from '@/hooks/useI18n';
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
    nixPackages: { app: AppData; pkg: string }[];
    showNixGenerator: boolean;
    drawerOpen: boolean;
    drawerClosing: boolean;
    onOpenDrawer: () => void;
    onCloseDrawer: () => void;
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
    nixPackages,
    showNixGenerator,
    drawerOpen,
    drawerClosing,
    onOpenDrawer,
    onCloseDrawer,
}: CommandFooterProps) {
    const [copied, setCopied] = useState(false);
    const { t, dir } = useI18n();
    const isRtl = dir === 'rtl';

    const { toggle: toggleTheme } = useTheme();

    const closeDrawer = onCloseDrawer;

    // Close drawer on Escape
    useEffect(() => {
        if (!drawerOpen) return;
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeDrawer();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [drawerOpen, closeDrawer, onCloseDrawer]);

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
                case '1': if (showAur) setSelectedHelper('paru'); break;
                case '2': if (showAur) setSelectedHelper('yay'); break;
                case 'Tab':
                    e.preventDefault();
                    if (selectedCount > 0) {
                        if (drawerOpen) closeDrawer();
                        else onOpenDrawer();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedCount, toggleTheme, clearAll, showAur, setSelectedHelper, handleCopy, handleDownload]);

    return (
        <>
            {/* AUR Floating Card - hidden on desktop (sidebar handles it) */}
            <div className="lg:hidden">
                <AurFloatingCard
                    show={showAur}
                    aurAppNames={aurAppNames}
                    hasYayInstalled={hasYayInstalled}
                    setHasYayInstalled={setHasYayInstalled}
                    selectedHelper={selectedHelper}
                    setSelectedHelper={setSelectedHelper}
                />
            </div>

            {/* Command Drawer */}
            <CommandDrawer
                isOpen={drawerOpen}
                isClosing={drawerClosing}
                onClose={closeDrawer}
                command={command}
                selectedCount={selectedCount}
                selectedDistro={selectedDistro}
                copied={copied}
                onCopy={handleCopy}
                onDownload={handleDownload}
                showAur={showAur}
                aurAppNames={aurAppNames}
                hasYayInstalled={hasYayInstalled}
                setHasYayInstalled={setHasYayInstalled}
                selectedHelper={selectedHelper}
                setSelectedHelper={setSelectedHelper}
                nixPackages={nixPackages}
                showNixGenerator={showNixGenerator}
            />

            {/* Animated footer container - hidden on desktop (sidebar takes over) */}
            <div
                className="fixed bottom-0 left-0 right-0 p-4 glass-footer lg:hidden"
                style={{
                    zIndex: 10,
                    animation: 'footerSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both'
                }}
            >
                <div className="relative w-[90%] max-w-6xl mx-auto">
                    <div className="relative flex flex-col gap-2">
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
                        <div className="font-mono text-xs rounded-xl overflow-hidden border border-[var(--border-primary)]/30 shadow-2xl shadow-black/20">
                            <div className="flex items-stretch">
                                {/* Preview button */}
                                <button
                                    onClick={() => selectedCount > 0 && onOpenDrawer()}
                                    disabled={selectedCount === 0}
                                    className={`flex items-center gap-2.5 px-5 py-3.5 border-r border-[var(--border-primary)]/20 transition-all shrink-0 bg-[var(--bg-secondary)]/80 hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] ${selectedCount === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                                    title="Toggle Preview (Tab)"
                                >
                                    <ChevronUp className="w-3.5 h-3.5 shrink-0" />
                                    <span className="font-bold tracking-wider whitespace-nowrap text-[11px]">{t.footer.preview}</span>
                                    {selectedCount > 0 && (
                                        <span className="text-[10px] font-semibold bg-[var(--accent)]/15 text-[var(--accent)] px-1.5 py-0.5 rounded ml-0.5 whitespace-nowrap">
                                            {selectedCount}
                                        </span>
                                    )}
                                </button>

                                {/* Command text */}
                                <div
                                    className="flex-1 min-w-0 flex items-center justify-center px-5 py-3.5 overflow-hidden bg-[var(--bg-secondary)]/60 cursor-pointer hover:bg-[var(--bg-secondary)]/90 transition-all group"
                                    onClick={() => selectedCount > 0 && onOpenDrawer()}
                                >
                                    <code className={`whitespace-nowrap overflow-x-auto command-scroll leading-none tracking-wide text-[11px] ${selectedCount > 0 ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                                        {command}
                                    </code>
                                </div>

                                {/* Download button */}
                                <button
                                    onClick={handleDownload}
                                    disabled={selectedCount === 0}
                                    className={`flex items-center gap-2 px-4 py-3.5 border-l border-[var(--border-primary)]/20 transition-all bg-[var(--bg-secondary)]/60 ${selectedCount > 0
                                        ? 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] cursor-pointer'
                                        : 'text-[var(--text-muted)] opacity-40 cursor-not-allowed'
                                        }`}
                                    title="Download Script (d)"
                                >
                                    <Download className="w-3.5 h-3.5 shrink-0" />
                                    <span className="hidden sm:inline whitespace-nowrap text-[11px] font-medium">{t.footer.download}</span>
                                </button>

                                {/* Copy button */}
                                <button
                                    onClick={handleCopy}
                                    disabled={selectedCount === 0}
                                    className={`flex items-center gap-2 px-4 py-3.5 border-l border-[var(--border-primary)]/20 transition-all ${selectedCount > 0
                                        ? (copied
                                            ? 'bg-emerald-600/90 text-white cursor-pointer'
                                            : 'bg-[var(--text-primary)]/10 text-[var(--text-primary)] hover:bg-[var(--text-primary)]/20 cursor-pointer')
                                        : 'text-[var(--text-muted)] opacity-40 cursor-not-allowed bg-[var(--bg-secondary)]/60'
                                        }`}
                                    title="Copy Command (y)"
                                >
                                    {copied ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
                                    <span className="hidden sm:inline whitespace-nowrap text-[11px] font-medium">{copied ? t.footer.copied : t.footer.copy}</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
