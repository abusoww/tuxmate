'use client';

import { Package, Download, Terminal } from 'lucide-react';

interface AurDrawerSettingsProps {
    aurAppNames: string[];
    hasYayInstalled: boolean;
    setHasYayInstalled: (value: boolean) => void;
    selectedHelper: 'yay' | 'paru';
    setSelectedHelper: (helper: 'yay' | 'paru') => void;
}

/**
 * AurDrawerSettings - Settings panel for AUR configuration inside the drawer
 */
export function AurDrawerSettings({
    aurAppNames,
    hasYayInstalled,
    setHasYayInstalled,
    selectedHelper,
    setSelectedHelper,
}: AurDrawerSettingsProps) {
    return (
        <div className="mb-6 rounded-xl border border-[#1793d1]/20 bg-[#1793d1]/5 overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-[#1793d1]/10 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-[#1793d1]/10 text-[#1793d1] shrink-0">
                    <Package className="w-5 h-5" />
                </div>
                <div>
                    <h4 className="text-sm font-semibold text-[var(--text-primary)]">
                        AUR Packages Detected
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                        These apps require an AUR helper: <span className="text-[var(--text-primary)] opacity-80">{aurAppNames.join(', ')}</span>
                    </p>
                </div>
            </div>

            {/* Controls Grid */}
            <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 1. Installation Mode */}
                <div>
                    <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2.5 flex items-center gap-2">
                        <Download className="w-3.5 h-3.5" />
                        Installation Logic
                    </label>
                    <div className="flex bg-[var(--bg-tertiary)] p-1 rounded-lg border border-[var(--border-primary)]/50">
                        <button
                            onClick={() => setHasYayInstalled(false)}
                            className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-all ${!hasYayInstalled
                                ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm border border-[var(--border-primary)]/50'
                                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                                }`}
                        >
                            Install New
                        </button>
                        <button
                            onClick={() => setHasYayInstalled(true)}
                            className={`flex-1 py-2 px-3 text-xs font-medium rounded-md transition-all ${hasYayInstalled
                                ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm border border-[var(--border-primary)]/50'
                                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                                }`}
                        >
                            I Have One
                        </button>
                    </div>
                    <p className="text-[10px] text-[var(--text-muted)] mt-2 opacity-70 px-1">
                        {hasYayInstalled
                            ? "Script will use your existing helper"
                            : "Script will install the helper first"}
                    </p>
                </div>

                {/* 2. Helper Selection */}
                <div>
                    <label className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider mb-2.5 flex items-center gap-2">
                        <Terminal className="w-3.5 h-3.5" />
                        Preferred Helper
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setSelectedHelper('yay')}
                            className={`relative px-3 py-2 rounded-lg text-left border transition-all ${selectedHelper === 'yay'
                                ? 'bg-[#1793d1]/10 border-[#1793d1]/30 text-[#1793d1]'
                                : 'bg-[var(--bg-tertiary)] border-[var(--border-primary)]/50 text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
                                }`}
                        >
                            <span className="block text-xs font-bold">yay</span>
                            <span className="block text-[10px] opacity-70 mt-0.5">Go-based</span>
                            {selectedHelper === 'yay' && (
                                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#1793d1]" />
                            )}
                        </button>

                        <button
                            onClick={() => setSelectedHelper('paru')}
                            className={`relative px-3 py-2 rounded-lg text-left border transition-all ${selectedHelper === 'paru'
                                ? 'bg-[#1793d1]/10 border-[#1793d1]/30 text-[#1793d1]'
                                : 'bg-[var(--bg-tertiary)] border-[var(--border-primary)]/50 text-[var(--text-muted)] hover:bg-[var(--bg-hover)]'
                                }`}
                        >
                            <span className="block text-xs font-bold">paru</span>
                            <span className="block text-[10px] opacity-70 mt-0.5">Rust-based</span>
                            {selectedHelper === 'paru' && (
                                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#1793d1]" />
                            )}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
