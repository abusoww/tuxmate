'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface AurPanelProps {
    aurAppNames: string[];
    hasYayInstalled: boolean;
    setHasYayInstalled: (value: boolean) => void;
}

/**
 * AurPanel - Beginner-friendly AUR configuration panel
 * Shows when AUR packages are selected, with clear explanations
 */
export function AurPanel({
    aurAppNames,
    hasYayInstalled,
    setHasYayInstalled,
}: AurPanelProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedHelper, setSelectedHelper] = useState<'yay' | 'paru'>('yay');
    const panelRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        if (!isExpanded) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setIsExpanded(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isExpanded]);

    // Keyboard shortcuts for helper selection
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement) return;
            if (e.key === '1') setSelectedHelper('yay');
            if (e.key === '2') setSelectedHelper('paru');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    return (
        <div className="relative" ref={panelRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`
                    flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium
                    transition-all duration-200 border
                    ${isExpanded
                        ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        : 'bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20 hover:border-amber-500/40'
                    }
                `}
            >
                <Info className="w-3.5 h-3.5" />
                <span>AUR Packages ({aurAppNames.length})</span>
                {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {/* Expanded Panel */}
            {isExpanded && (
                <div
                    className="absolute bottom-full left-0 mb-2 w-80 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl shadow-2xl overflow-hidden"
                    style={{ animation: 'tooltipSlideUp 0.2s ease-out' }}
                >
                    {/* Header with explanation */}
                    <div className="px-4 py-3 border-b border-[var(--border-primary)] bg-amber-500/5">
                        <div className="flex items-start gap-2">
                            <Info className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-sm font-medium text-[var(--text-primary)]">
                                    What is an AUR Helper?
                                </p>
                                <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                                    Some packages are from the AUR (Arch User Repository).
                                    You need an AUR helper like <strong>yay</strong> or <strong>paru</strong> to install them.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Selected AUR packages */}
                    <div className="px-4 py-3 border-b border-[var(--border-primary)]">
                        <p className="text-xs text-[var(--text-muted)] mb-2">AUR packages you selected:</p>
                        <div className="flex flex-wrap gap-1.5">
                            {aurAppNames.map((name, idx) => (
                                <span
                                    key={idx}
                                    className="px-2 py-1 bg-amber-500/15 text-amber-400 rounded-md text-xs font-medium"
                                >
                                    {name}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Toggle: Do you have AUR helper? */}
                    <div className="px-4 py-3 border-b border-[var(--border-primary)]">
                        <label className="flex items-start gap-3 cursor-pointer select-none group">
                            <div className="relative mt-0.5">
                                <input
                                    type="checkbox"
                                    checked={hasYayInstalled}
                                    onChange={(e) => setHasYayInstalled(e.target.checked)}
                                    className="sr-only"
                                />
                                <div
                                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                                        ${hasYayInstalled
                                            ? 'bg-emerald-500 border-emerald-500'
                                            : 'bg-[var(--bg-primary)] border-[var(--border-secondary)] group-hover:border-emerald-500'
                                        }`}
                                >
                                    {hasYayInstalled && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                                </div>
                            </div>
                            <div>
                                <span className="text-sm text-[var(--text-primary)] font-medium">
                                    I already have an AUR helper
                                </span>
                                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                                    {hasYayInstalled
                                        ? "We won't add installation commands"
                                        : "We'll include commands to install the helper first"
                                    }
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Helper Selection */}
                    <div className="px-4 py-3">
                        <p className="text-xs text-[var(--text-muted)] mb-2">Choose your AUR helper:</p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSelectedHelper('yay')}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border
                                    ${selectedHelper === 'yay'
                                        ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                                        : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] border-[var(--border-primary)] hover:text-[var(--text-primary)]'
                                    }`}
                            >
                                <span className="opacity-50 mr-1 text-xs">1</span> yay
                            </button>
                            <button
                                onClick={() => setSelectedHelper('paru')}
                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all border
                                    ${selectedHelper === 'paru'
                                        ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40'
                                        : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] border-[var(--border-primary)] hover:text-[var(--text-primary)]'
                                    }`}
                            >
                                <span className="opacity-50 mr-1 text-xs">2</span> paru
                            </button>
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)]/60 mt-2 text-center">
                            Press <kbd className="font-mono bg-[var(--bg-tertiary)] px-1 rounded">1</kbd> or <kbd className="font-mono bg-[var(--bg-tertiary)] px-1 rounded">2</kbd> to switch
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
