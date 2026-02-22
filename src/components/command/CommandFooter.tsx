'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Check, Copy, ChevronUp, Download, X } from 'lucide-react';
import { distros, type DistroId } from '@/lib/data';
import { generateInstallScript } from '@/lib/generateInstallScript';
import { analytics } from '@/lib/analytics';

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
    hasUnfreePackages?: boolean;
    unfreeAppNames?: string[];
    drawerOpen?: boolean;
    drawerClosing?: boolean;
    onDrawerOpen?: () => void;
    onDrawerClose?: () => void;
    activeShortcut?: string | null;
}


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
    hasUnfreePackages,
    unfreeAppNames,
    drawerOpen: externalDrawerOpen,
    drawerClosing: externalDrawerClosing,
    onDrawerOpen: externalOnDrawerOpen,
    onDrawerClose: externalOnDrawerClose,
    activeShortcut,
}: CommandFooterProps) {
    const [copied, setCopied] = useState(false);
    const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);
    const [internalDrawerClosing, setInternalDrawerClosing] = useState(false);
    const [hasEverHadSelection, setHasEverHadSelection] = useState(false);
    const initialCountRef = useRef(selectedCount);

    const drawerOpen = externalDrawerOpen ?? internalDrawerOpen;
    const drawerClosing = externalDrawerClosing ?? internalDrawerClosing;

    useEffect(() => {
        if (selectedCount !== initialCountRef.current && !hasEverHadSelection) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setHasEverHadSelection(true);
        }
    }, [selectedCount, hasEverHadSelection]);

    const closeDrawer = useCallback(() => {
        if (externalOnDrawerClose) {
            externalOnDrawerClose();
        } else {
            setInternalDrawerClosing(true);
            setTimeout(() => {
                setInternalDrawerOpen(false);
                setInternalDrawerClosing(false);
            }, 250);
        }
    }, [externalOnDrawerClose]);

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
    const distroColor = distros.find(d => d.id === selectedDistro)?.color || 'var(--accent)';

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
                distroColor={distroColor}
                distroId={selectedDistro}
                hasUnfreePackages={hasUnfreePackages}
                unfreeAppNames={unfreeAppNames}
            />

            {/* Animated footer container - shows after first selection */}
            {hasEverHadSelection && (
                <div
                    className="fixed bottom-0 left-0 right-0 p-3 lg:hidden"
                    style={{
                        zIndex: 10,
                        animation: 'footerSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both'
                    }}
                >
                    <div className="relative w-[85%] mx-auto">
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
                                distroColor={distroColor}
                                showAur={showAur}
                                selectedHelper={selectedHelper}
                                setSelectedHelper={setSelectedHelper}
                            />

                            <div className="bg-[var(--bg-tertiary)] font-mono text-xs overflow-hidden border-l-4 shadow-2xl"
                                style={{ borderLeftColor: distroColor }}>
                                <div className="flex items-stretch">
                                    {/* Preview button */}
                                    <button
                                        onClick={() => {
                                            if (selectedCount > 0) {
                                                if (externalOnDrawerOpen) {
                                                    externalOnDrawerOpen();
                                                } else {
                                                    setInternalDrawerOpen(true);
                                                }
                                            }
                                        }}
                                        disabled={selectedCount === 0}
                                        className={`hidden md:flex items-center gap-2 px-5 py-3 border-r border-[var(--border-primary)]/20 transition-all shrink-0 font-medium ${selectedCount === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        title="Toggle Preview (Tab)"
                                        style={{
                                            backgroundColor: selectedCount > 0 ? `color-mix(in srgb, ${distroColor}, transparent 90%)` : undefined,
                                            color: selectedCount > 0 ? distroColor : undefined,
                                        }}
                                        onMouseEnter={(e) => {
                                            if (selectedCount > 0) {
                                                e.currentTarget.style.backgroundColor = `color-mix(in srgb, ${distroColor}, transparent 80%)`;
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedCount > 0) {
                                                e.currentTarget.style.backgroundColor = `color-mix(in srgb, ${distroColor}, transparent 90%)`;
                                            }
                                        }}
                                    >
                                        <ChevronUp className="w-3.5 h-3.5 shrink-0" />
                                        <span className="whitespace-nowrap text-xs uppercase tracking-wider">Preview</span>
                                        {selectedCount > 0 && (
                                            <span className="text-[10px] opacity-60 ml-0.5 whitespace-nowrap">[{selectedCount}]</span>
                                        )}
                                    </button>

                                    <div
                                        className="flex-1 min-w-0 flex items-center justify-center px-4 py-4 overflow-hidden bg-[var(--bg-secondary)] cursor-pointer hover:bg-[var(--bg-hover)] transition-colors group"
                                        onClick={() => {
                                            if (selectedCount > 0) {
                                                if (externalOnDrawerOpen) {
                                                    externalOnDrawerOpen();
                                                } else {
                                                    setInternalDrawerOpen(true);
                                                }
                                            }
                                        }}
                                    >
                                        <code className={`whitespace-nowrap overflow-x-auto command-scroll leading-none text-sm font-semibold ${selectedCount > 0 ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                                            {command}
                                        </code>
                                    </div>

                                    <button
                                        onClick={clearAll}
                                        disabled={selectedCount === 0}
                                        className={`hidden md:flex items-center gap-2 px-4 py-3 border-l border-[var(--border-primary)]/20 transition-all duration-150 font-sans text-sm ${selectedCount > 0
                                            ? activeShortcut === 'c' ? 'bg-red-500/20 text-red-400 scale-[0.97]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:scale-[0.97]'
                                            : 'text-[var(--text-muted)] opacity-50 cursor-not-allowed'
                                            }`}
                                        title="Clear All (c)"
                                        onMouseEnter={(e) => {
                                            if (selectedCount > 0) {
                                                e.currentTarget.style.backgroundColor = `color-mix(in srgb, ${distroColor}, transparent 95%)`;
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedCount > 0) {
                                                e.currentTarget.style.backgroundColor = '';
                                            }
                                        }}
                                    >
                                        <X className="w-4 h-4 shrink-0 opacity-70" />
                                        <span className="hidden sm:inline whitespace-nowrap">Clear</span>
                                    </button>

                                    <button
                                        onClick={handleDownload}
                                        disabled={selectedCount === 0}
                                        className={`hidden md:flex items-center gap-2 px-4 py-3 border-l border-[var(--border-primary)]/20 transition-all duration-150 font-sans text-sm ${selectedCount > 0
                                            ? activeShortcut === 'd' ? 'bg-[var(--bg-hover)] opacity-80 scale-[0.97]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:scale-[0.97]'
                                            : 'text-[var(--text-muted)] opacity-50 cursor-not-allowed'
                                            }`}
                                        title="Download Script (d)"
                                        onMouseEnter={(e) => {
                                            if (selectedCount > 0) {
                                                e.currentTarget.style.backgroundColor = `color-mix(in srgb, ${distroColor}, transparent 95%)`;
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedCount > 0) {
                                                e.currentTarget.style.backgroundColor = '';
                                            }
                                        }}
                                    >
                                        <Download className="w-4 h-4 shrink-0 opacity-70" />
                                        <span className="hidden sm:inline whitespace-nowrap">Download</span>
                                    </button>

                                    <button
                                        onClick={handleCopy}
                                        disabled={selectedCount === 0}
                                        className={`hidden md:flex items-center gap-2 px-4 py-3 border-l border-[var(--border-primary)]/20 transition-all duration-150 font-sans text-sm ${selectedCount > 0
                                            ? (copied
                                                ? 'text-emerald-400 font-medium'
                                                : activeShortcut === 'y' ? 'bg-[var(--bg-hover)] opacity-80 scale-[0.97]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] active:scale-[0.97]')
                                            : 'text-[var(--text-muted)] opacity-50 cursor-not-allowed'
                                            }`}
                                        title="Copy Command (y)"
                                        onMouseEnter={(e) => {
                                            if (selectedCount > 0 && !copied) {
                                                e.currentTarget.style.backgroundColor = `color-mix(in srgb, ${distroColor}, transparent 95%)`;
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            if (selectedCount > 0 && !copied) {
                                                e.currentTarget.style.backgroundColor = '';
                                            }
                                        }}
                                    >
                                        {copied ? <Check className="w-4 h-4 shrink-0" /> : <Copy className="w-4 h-4 shrink-0 opacity-70" />}
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
