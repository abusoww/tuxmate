'use client';

import { useState, useRef, useEffect } from 'react';
import { Check, AlertTriangle } from 'lucide-react';

interface AurPopoverProps {
    aurAppNames: string[];
    hasYayInstalled: boolean;
    setHasYayInstalled: (value: boolean) => void;
}

export function AurPopover({
    aurAppNames,
    hasYayInstalled,
    setHasYayInstalled,
}: AurPopoverProps) {
    const [isOpen, setIsOpen] = useState(false);
    const popoverRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    return (
        <div className="relative" ref={popoverRef}>
            {/* AUR Badge */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium
                    transition-all duration-200
                    ${isOpen
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500/20'
                    }
                `}
            >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>AUR ({aurAppNames.length})</span>
            </button>

            {/* Popover */}
            {isOpen && (
                <div
                    className="absolute bottom-full left-0 mb-2 w-64 bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-xl shadow-2xl overflow-hidden"
                    style={{ animation: 'tooltipSlideUp 0.2s ease-out' }}
                >
                    {/* Header */}
                    <div className="px-3 py-2 border-b border-[var(--border-primary)] bg-[var(--bg-tertiary)]">
                        <p className="text-xs font-medium text-[var(--text-primary)]">AUR Packages</p>
                        <p className="text-xs text-[var(--text-muted)]">
                            {hasYayInstalled ? 'Using yay' : 'Will install yay first'}
                        </p>
                    </div>

                    {/* Package List */}
                    <div className="px-3 py-2 flex flex-wrap gap-1.5">
                        {aurAppNames.map((name, idx) => (
                            <span
                                key={idx}
                                className="px-2 py-0.5 bg-amber-500/15 text-amber-400 rounded text-xs"
                            >
                                {name}
                            </span>
                        ))}
                    </div>

                    {/* Yay Checkbox */}
                    <div className="px-3 py-2 border-t border-[var(--border-primary)]">
                        <label className="flex items-center gap-2 cursor-pointer select-none group">
                            <div className="relative">
                                <input
                                    type="checkbox"
                                    checked={hasYayInstalled}
                                    onChange={(e) => setHasYayInstalled(e.target.checked)}
                                    className="sr-only"
                                />
                                <div
                                    className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all
                                        ${hasYayInstalled
                                            ? 'bg-amber-500 border-amber-500'
                                            : 'bg-[var(--bg-primary)] border-[var(--border-secondary)] group-hover:border-amber-500'
                                        }`}
                                >
                                    {hasYayInstalled && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                                </div>
                            </div>
                            <span className="text-xs text-[var(--text-secondary)]">
                                I have yay installed
                            </span>
                        </label>
                    </div>
                </div>
            )}
        </div>
    );
}
