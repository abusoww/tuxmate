'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Check, ChevronDown } from 'lucide-react';
import { distros, type DistroId } from '@/lib/data';
import { analytics } from '@/lib/analytics';
import { DistroIcon } from './DistroIcon';

// Distro picker dropdown.
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

    const dropdown = isOpen && mounted ? (
        <>
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
            <div
                className="distro-dropdown bg-[var(--bg-secondary)] border-l-4 rounded-md"
                style={{
                    position: 'fixed',
                    top: dropdownPos.top,
                    right: dropdownPos.right,
                    zIndex: 99999,
                    borderLeftColor: currentDistro?.color || 'var(--accent)',
                    padding: '8px 0',
                    minWidth: '220px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                    transformOrigin: 'top right',
                    animation: 'distroDropdownOpen 0.25s ease-out',
                }}
            >
                <div>
                    {distros.map((distro, i) => (
                        <button
                            key={distro.id}
                            onClick={() => { onSelect(distro.id); setIsOpen(false); analytics.distroSelected(distro.name); }}
                            className={`group w-full flex items-center gap-3 py-3 px-4 cursor-pointer text-left transition-colors duration-100 ${selectedDistro === distro.id
                                ? 'border-l-2 -ml-[2px] pl-[18px]'
                                : 'hover:bg-[var(--bg-hover)]'
                                }`}
                            style={{
                                animation: `distroItemSlide 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.03}s both`,
                                backgroundColor: selectedDistro === distro.id ? `color-mix(in srgb, ${distro.color}, transparent 85%)` : undefined,
                                borderColor: selectedDistro === distro.id ? distro.color : undefined
                            }}
                        >
                            <div className="w-6 h-6 flex items-center justify-center">
                                <DistroIcon url={distro.iconUrl} name={distro.name} size={22} />
                            </div>
                            <span className={`flex-1 text-[15px] ${selectedDistro === distro.id
                                ? 'text-[var(--text-primary)] font-medium'
                                : 'text-[var(--text-secondary)]'
                                }`}>{distro.name}</span>
                            {selectedDistro === distro.id && (
                                <Check className="w-5 h-5" style={{ color: distro.color }} strokeWidth={2.5} />
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
                className={`group flex items-center gap-2.5 h-10 pl-3 pr-3.5 border-l-4 bg-[var(--bg-secondary)] rounded-md transition-all duration-150 ${isOpen ? 'bg-[var(--bg-tertiary)]' : 'hover:bg-[var(--bg-hover)]'}`}
                style={{
                    borderColor: currentDistro?.color || 'var(--accent)'
                }}
            >
                <div className="w-6 h-6 flex items-center justify-center">
                    <DistroIcon url={currentDistro?.iconUrl || ''} name={currentDistro?.name || ''} size={20} />
                </div>
                <span className="text-[15px] font-medium text-[var(--text-primary)]">{currentDistro?.name}</span>
                <ChevronDown className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-150 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {mounted && typeof document !== 'undefined' && createPortal(dropdown, document.body)}
        </>
    );
}
