'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { distros, type DistroId } from '@/lib/data';
import { analytics } from '@/lib/analytics';
import { DistroIcon } from './DistroIcon';

// Dropdown to pick your Linux flavor
export function DistroSelector({
    selectedDistro,
    onSelect
}: {
    selectedDistro: DistroId;
    onSelect: (id: DistroId) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
    const currentDistro = distros.find(d => d.id === selectedDistro);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + 8,
                right: window.innerWidth - rect.right,
            });
        }
    }, [isOpen]);

    const handleOpen = () => {
        setIsOpen(!isOpen);
    };

    // Dropdown rendered via portal to body
    const dropdown = isOpen && mounted ? (
        <>
            {/* Backdrop with subtle blur */}
            <div
                onClick={() => setIsOpen(false)}
                className="backdrop-blur-[2px]"
                style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 99998,
                    background: 'rgba(0,0,0,0.05)',
                }}
            />
            {/* Dropdown */}
            <div
                className="distro-dropdown bg-[var(--bg-secondary)] border border-[var(--border-primary)]"
                style={{
                    position: 'fixed',
                    top: dropdownPos.top,
                    right: dropdownPos.right,
                    zIndex: 99999,
                    borderRadius: '20px',
                    padding: '10px',
                    minWidth: '200px',
                    boxShadow: '0 20px 60px -10px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.05)',
                    transformOrigin: 'top right',
                    animation: 'distroDropdownOpen 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
            >
                {/* Header */}
                <div className="px-3 py-2 mb-1">
                    <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">Select Distro</span>
                </div>

                {/* Distro List */}
                <div className="space-y-0.5">
                    {distros.map((distro, i) => (
                        <button
                            key={distro.id}
                            onClick={() => { onSelect(distro.id); setIsOpen(false); analytics.distroSelected(distro.name); }}
                            className={`group w-full flex items-center gap-3 py-2.5 px-3 rounded-xl border-none cursor-pointer text-left transition-[background-color,transform] duration-200 ${selectedDistro === distro.id
                                ? 'bg-[var(--accent)]/10'
                                : 'bg-transparent hover:bg-[var(--bg-hover)] hover:scale-[1.02]'
                                }`}
                            style={{
                                animation: `distroItemSlide 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.04}s both`,
                            }}
                        >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-transform duration-200 ${selectedDistro === distro.id
                                ? 'bg-[var(--accent)]/20 scale-110'
                                : 'bg-[var(--bg-tertiary)] group-hover:scale-105'
                                }`}>
                                <DistroIcon url={distro.iconUrl} name={distro.name} size={18} />
                            </div>
                            <span className={`flex-1 text-sm transition-colors ${selectedDistro === distro.id
                                ? 'text-[var(--text-primary)] font-medium'
                                : 'text-[var(--text-secondary)]'
                                }`}>{distro.name}</span>
                            {selectedDistro === distro.id && (
                                <div className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center">
                                    <Check className="w-3 h-3 text-white" />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </>
    ) : null;

    return (
        <>
            <button
                ref={buttonRef}
                onClick={handleOpen}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-label={`Select distribution, current: ${currentDistro?.name}`}
                className={`group flex items-center gap-2.5 h-10 pl-2.5 pr-3.5 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] transition-[background-color,box-shadow,border-color] duration-300 ${isOpen ? 'ring-2 ring-[var(--accent)]/30 border-[var(--accent)]/50' : 'hover:bg-[var(--bg-hover)]'}`}
            >
                <div className="w-6 h-6 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-110">
                    <DistroIcon url={currentDistro?.iconUrl || ''} name={currentDistro?.name || ''} size={16} />
                </div>
                <span className="text-sm font-medium text-[var(--text-primary)]">{currentDistro?.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {mounted && typeof document !== 'undefined' && createPortal(dropdown, document.body)}
        </>
    );
}
