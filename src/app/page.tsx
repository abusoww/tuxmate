'use client';

import { useState, useEffect, useMemo, useCallback, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Check, Copy, ChevronDown, ChevronRight, ChevronUp, X, Download, HelpCircle, Github, Heart } from 'lucide-react';
import { useLinuxInit } from '@/hooks/useLinuxInit';
import { distros, categories, getAppsByCategory, type DistroId, type AppData, type Category } from '@/lib/data';
import { generateInstallScript } from '@/lib/generateInstallScript';
import { analytics } from '@/lib/analytics';
import gsap from 'gsap';

// Theme hook removed (using global hook)
import { ThemeToggle } from '@/components/ui/theme-toggle';





// How It Works Popup Component
function HowItWorks() {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Close on click outside
    useEffect(() => {
        if (!isOpen) return;
        const handleClickOutside = (e: MouseEvent) => {
            if (
                triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
                popupRef.current && !popupRef.current.contains(e.target as Node)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Close on Escape
    useEffect(() => {
        if (!isOpen) return;
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    const getPopupPosition = () => {
        if (!triggerRef.current) return { top: 0, left: 0 };
        const rect = triggerRef.current.getBoundingClientRect();
        return {
            top: rect.bottom + 12,
            left: Math.max(8, Math.min(rect.left, window.innerWidth - 420)),
        };
    };

    const pos = isOpen ? getPopupPosition() : { top: 0, left: 0 };

    const popup = isOpen && mounted ? (
        <div
            ref={popupRef}
            className="how-it-works-popup bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)] shadow-2xl"
            style={{
                position: 'fixed',
                top: pos.top,
                left: pos.left,
                zIndex: 99999,
                borderRadius: '16px',
                width: '400px',
                maxWidth: 'calc(100vw - 16px)',
                maxHeight: 'min(70vh, 600px)',
                display: 'flex',
                flexDirection: 'column',
                animation: 'popupSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                overflow: 'hidden',
            }}
        >
            {/* Header - fixed */}
            <div className="flex items-center justify-between gap-2 p-4 pb-3 border-b border-[var(--border-primary)] shrink-0">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                        <HelpCircle className="w-4 h-4 text-[var(--accent)]" />
                    </div>
                    <div>
                        <h3 className="text-base font-semibold text-[var(--text-primary)]">How TuxMate Works</h3>
                        <p className="text-xs text-[var(--text-muted)]">Quick guide & tips</p>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5" style={{ scrollbarGutter: 'stable' }}>
                {/* Quick Start Steps */}
                <div>
                    <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Quick Start</h4>
                    <div className="space-y-3">
                        <div className="flex gap-3">
                            <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[10px] font-bold text-[var(--accent)] shrink-0">1</div>
                            <p className="text-sm text-[var(--text-secondary)]">Select your distro from the dropdown</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[10px] font-bold text-[var(--accent)] shrink-0">2</div>
                            <p className="text-sm text-[var(--text-secondary)]">Check the apps you want to install</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[10px] font-bold text-[var(--accent)] shrink-0">3</div>
                            <p className="text-sm text-[var(--text-secondary)]">Copy the command or download the script</p>
                        </div>
                        <div className="flex gap-3">
                            <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[10px] font-bold text-[var(--accent)] shrink-0">4</div>
                            <p className="text-sm text-[var(--text-secondary)]">Paste in terminal (<code className="text-xs bg-[var(--bg-tertiary)] px-1 py-0.5 rounded">Ctrl+Shift+V</code>) and run</p>
                        </div>
                    </div>
                </div>

                {/* Unavailable Apps */}
                <div className="pt-3 border-t border-[var(--border-primary)]">
                    <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">App Not Available?</h4>
                    <div className="space-y-2.5 text-xs text-[var(--text-muted)] leading-relaxed">
                        <p>Greyed-out apps aren&apos;t in your distro&apos;s repos. Here&apos;s what you can do:</p>
                        <ul className="space-y-2 ml-2">
                            <li className="flex gap-2">
                                <span className="text-[var(--accent)]">•</span>
                                <span><strong className="text-[var(--text-secondary)]">Use Flatpak/Snap:</strong> Switch to Flatpak or Snap in the distro selector for universal packages</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[var(--accent)]">•</span>
                                <span><strong className="text-[var(--text-secondary)]">Download from website:</strong> Visit the app&apos;s official site and grab the <code className="bg-[var(--bg-tertiary)] px-1 rounded">.deb</code>, <code className="bg-[var(--bg-tertiary)] px-1 rounded">.rpm</code>, or <code className="bg-[var(--bg-tertiary)] px-1 rounded">.AppImage</code></span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[var(--accent)]">•</span>
                                <span><strong className="text-[var(--text-secondary)]">Check GitHub Releases:</strong> Many apps publish packages on their GitHub releases page</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-[var(--accent)]">•</span>
                                <span><strong className="text-[var(--text-secondary)]">Hover the ⓘ icon:</strong> Some unavailable apps show links to alternative download methods</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Arch & AUR */}
                <div className="pt-3 border-t border-[var(--border-primary)]">
                    <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Arch Linux & AUR</h4>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                        Some Arch packages are in the <strong className="text-[var(--text-secondary)]">AUR</strong> (Arch User Repository).
                        TuxMate uses <code className="bg-[var(--bg-tertiary)] px-1 rounded">yay</code> to install these.
                        If you don&apos;t have yay, check &quot;I have yay installed&quot; to skip auto-installation, or leave it unchecked to install yay first.
                    </p>
                </div>

                {/* Keyboard Shortcuts */}
                <div className="pt-3 border-t border-[var(--border-primary)]">
                    <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Keyboard Shortcuts</h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-mono">↑↓</kbd>
                            <span className="text-[var(--text-muted)]">Navigate apps</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-mono">Space</kbd>
                            <span className="text-[var(--text-muted)]">Toggle selection</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-mono">Enter</kbd>
                            <span className="text-[var(--text-muted)]">Expand/collapse</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-mono">Esc</kbd>
                            <span className="text-[var(--text-muted)]">Close popups</span>
                        </div>
                    </div>
                </div>

                {/* Pro Tips */}
                <div className="pt-3 border-t border-[var(--border-primary)]">
                    <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Pro Tips</h4>
                    <ul className="space-y-2 text-xs text-[var(--text-muted)] leading-relaxed">
                        <li className="flex gap-2">
                            <span className="text-emerald-500">💡</span>
                            <span>The <strong className="text-[var(--text-secondary)]">download button</strong> gives you a full shell script with progress tracking, error handling, and a summary</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-emerald-500">💡</span>
                            <span>Your selections are <strong className="text-[var(--text-secondary)]">saved automatically</strong> — come back anytime to modify your setup</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-emerald-500">💡</span>
                            <span>Running <code className="bg-[var(--bg-tertiary)] px-1 rounded">.deb</code> files: <code className="bg-[var(--bg-tertiary)] px-1 rounded">sudo dpkg -i file.deb</code> or double-click in your file manager</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="text-emerald-500">💡</span>
                            <span>Running <code className="bg-[var(--bg-tertiary)] px-1 rounded">.rpm</code> files: <code className="bg-[var(--bg-tertiary)] px-1 rounded">sudo dnf install ./file.rpm</code> or <code className="bg-[var(--bg-tertiary)] px-1 rounded">sudo zypper install ./file.rpm</code></span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Arrow pointer */}
            <div
                className="absolute w-3 h-3 bg-[var(--bg-secondary)] border-l border-t border-[var(--border-primary)] rotate-45"
                style={{ top: '-7px', left: '24px' }}
            />
        </div>
    ) : null;

    return (
        <>
            <button
                ref={triggerRef}
                onClick={() => {
                    const wasOpen = isOpen;
                    setIsOpen(!isOpen);
                    if (!wasOpen) analytics.helpOpened();
                    else analytics.helpClosed();
                }}
                className={`flex items-center gap-1.5 text-sm transition-all duration-200 hover:scale-105 ${isOpen ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
            >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline whitespace-nowrap">How it works?</span>
            </button>
            {mounted && typeof document !== 'undefined' && createPortal(popup, document.body)}
        </>
    );
}


// GitHub Link Component
function GitHubLink({ href = "https://github.com/abusoww/tuxmate" }: { href?: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all duration-300"
            title="View on GitHub"
            onClick={() => analytics.githubClicked()}
        >
            <Github className="w-4 h-4 transition-transform duration-300 group-hover:rotate-12" />
            <span className="hidden sm:inline relative">
                GitHub
                <span className="absolute bottom-0 left-0 w-0 h-px bg-[var(--text-muted)] transition-all duration-300 group-hover:w-full" />
            </span>
        </a>
    );
}

// Contribute Link Component  
function ContributeLink({ href = "https://github.com/abusoww/tuxmate/blob/main/CONTRIBUTING.md" }: { href?: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all duration-300"
            onClick={() => analytics.contributeClicked()}
        >
            <Heart className="w-4 h-4 transition-all duration-300 group-hover:text-rose-400 group-hover:scale-110" />
            <span className="hidden sm:inline relative">
                Contribute
                <span className="absolute bottom-0 left-0 w-0 h-px bg-[var(--text-muted)] transition-all duration-300 group-hover:w-full" />
            </span>
        </a>
    );
}

// Delayed tooltip hook - positions above element with slide-up animation
function useDelayedTooltip(delay = 600) {
    const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number; width: number; key: number } | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const isHoveringTooltip = useRef(false);
    const keyRef = useRef(0);

    const show = useCallback((text: string, e: React.MouseEvent) => {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        // Position centered above the element
        keyRef.current += 1; // Increment key for fresh animation
        const newTooltip = {
            text,
            x: rect.left + rect.width / 2,
            y: rect.top - 12,
            width: rect.width,
            key: keyRef.current
        };
        if (timerRef.current) clearTimeout(timerRef.current);
        // Clear existing tooltip first to reset animation
        setTooltip(null);
        timerRef.current = setTimeout(() => setTooltip(newTooltip), delay);
    }, [delay]);

    const hide = useCallback(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        // Delay hide to allow moving to tooltip
        timerRef.current = setTimeout(() => {
            if (!isHoveringTooltip.current) {
                setTooltip(null);
            }
        }, 100);
    }, []);

    const onTooltipEnter = useCallback(() => {
        isHoveringTooltip.current = true;
        if (timerRef.current) clearTimeout(timerRef.current);
    }, []);

    const onTooltipLeave = useCallback(() => {
        isHoveringTooltip.current = false;
        setTooltip(null);
    }, []);

    return { tooltip, show, hide, onTooltipEnter, onTooltipLeave };
}

// Distro Icon
function DistroIcon({ url, name, size = 20 }: { url: string; name: string; size?: number }) {
    const [error, setError] = useState(false);
    if (error) return <div className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center text-xs font-bold">{name[0]}</div>;
    return <img src={url} alt="" aria-hidden="true" width={size} height={size} className="object-contain" style={{ width: size, height: size }} onError={() => setError(true)} />;
}

// Animated Distro Selector with Portal
function DistroSelector({ selectedDistro, onSelect }: { selectedDistro: DistroId; onSelect: (id: DistroId) => void }) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const buttonRef = useRef<HTMLButtonElement>(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
    const currentDistro = distros.find(d => d.id === selectedDistro);

    useEffect(() => {
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
                            className={`group w-full flex items-center gap-3 py-2.5 px-3 rounded-xl border-none cursor-pointer text-left transition-all duration-200 ${selectedDistro === distro.id
                                ? 'bg-[var(--accent)]/10'
                                : 'bg-transparent hover:bg-[var(--bg-hover)] hover:scale-[1.02]'
                                }`}
                            style={{
                                animation: `distroItemSlide 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.04}s both`,
                            }}
                        >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${selectedDistro === distro.id
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
                className={`group flex items-center gap-2.5 h-10 pl-2.5 pr-3.5 rounded-2xl border border-[var(--border-primary)] bg-[var(--bg-secondary)] transition-all duration-300 ${isOpen ? 'ring-2 ring-[var(--accent)]/30 border-[var(--accent)]/50' : 'hover:bg-[var(--bg-hover)]'}`}
            >
                <div className="w-6 h-6 rounded-lg bg-[var(--bg-tertiary)] flex items-center justify-center overflow-hidden transition-transform duration-300 group-hover:scale-110">
                    <DistroIcon url={currentDistro?.iconUrl || ''} name={currentDistro?.name || ''} size={16} />
                </div>
                <span className="text-sm font-medium text-[var(--text-primary)] hidden sm:inline">{currentDistro?.name}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {mounted && typeof document !== 'undefined' && createPortal(dropdown, document.body)}
        </>
    );
}

// App Icon
function AppIcon({ url, name }: { url: string; name: string }) {
    const [error, setError] = useState(false);
    if (error) return <div className="w-4 h-4 rounded bg-[var(--accent)] flex items-center justify-center text-[10px] font-bold">{name[0]}</div>;
    return (
        <div className="w-4 h-4 rounded-[6px] bg-white dark:bg-white flex items-center justify-center p-0.5 shrink-0">
            <img src={url} alt="" aria-hidden="true" width={16} height={16} className="w-full h-full object-contain" onError={() => setError(true)} loading="lazy" />
        </div>
    );
}

// App Item
function AppItem({
    app, isSelected, isAvailable, isFocused, selectedDistro, onToggle,
    onTooltipEnter, onTooltipLeave, onFocus,
}: {
    app: AppData; isSelected: boolean; isAvailable: boolean; isFocused: boolean; selectedDistro: DistroId;
    onToggle: () => void; onTooltipEnter: (t: string, e: React.MouseEvent) => void; onTooltipLeave: () => void;
    onFocus?: () => void;
}) {
    // Build unavailable tooltip text
    const getUnavailableText = () => {
        if (app.unavailableReason) return app.unavailableReason;
        const distroName = distros.find(d => d.id === selectedDistro)?.name || '';
        return `Not available in ${distroName} repos`;
    };

    return (
        <div
            className={`app-item w-full flex items-center gap-2.5 py-1.5 px-2 rounded-md outline-none transition-all duration-150
        ${isFocused ? 'bg-[var(--bg-focus)]' : ''}
        ${!isAvailable ? 'opacity-40 grayscale-[30%]' : 'hover:bg-[var(--bg-hover)] cursor-pointer'}`}
            style={{ transition: 'background-color 0.15s, color 0.5s' }}
            onClick={(e) => {
                e.stopPropagation();
                onFocus?.();
                if (isAvailable) {
                    const willBeSelected = !isSelected;
                    onToggle();
                    const distroName = distros.find(d => d.id === selectedDistro)?.name || selectedDistro;
                    if (willBeSelected) {
                        analytics.appSelected(app.name, app.category, distroName);
                    } else {
                        analytics.appDeselected(app.name, app.category, distroName);
                    }
                }
            }}
            onMouseEnter={(e) => {
                if (isAvailable) onTooltipEnter(app.description, e);
            }}
            onMouseLeave={() => {
                if (isAvailable) onTooltipLeave();
            }}
        >
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150
        ${isSelected ? 'bg-[var(--text-secondary)] border-[var(--text-secondary)]' : 'border-[var(--border-secondary)]'}
        ${!isAvailable ? 'border-dashed' : ''}`}>
                {isSelected && <Check className="w-2.5 h-2.5 text-[var(--bg-primary)]" strokeWidth={3} />}
            </div>
            <AppIcon url={app.iconUrl} name={app.name} />
            <span
                className={`text-sm flex-1 ${!isAvailable ? 'text-[var(--text-muted)]' : isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
                style={{
                    transition: 'color 0.5s',
                    textRendering: 'geometricPrecision',
                    WebkitFontSmoothing: 'antialiased',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                }}
            >
                {app.name}
            </span>
            {/* Exclamation mark icon for unavailable apps */}
            {!isAvailable && (
                <div
                    className="relative group flex-shrink-0 cursor-help"
                    onMouseEnter={(e) => { e.stopPropagation(); onTooltipEnter(getUnavailableText(), e); }}
                    onMouseLeave={(e) => { e.stopPropagation(); onTooltipLeave(); }}
                >
                    <svg
                        className="w-4 h-4 text-[var(--text-muted)] hover:text-[var(--accent)] transition-all duration-300 hover:rotate-[360deg] hover:scale-110"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22c-5.518 0-10-4.482-10-10s4.482-10 10-10 10 4.482 10 10-4.482 10-10 10zm-1-16h2v6h-2zm0 8h2v2h-2z" />
                    </svg>
                </div>
            )}
        </div>
    );
}

// Category Header
function CategoryHeader({ category, isExpanded, isFocused, onToggle, selectedCount, onFocus }: {
    category: string; isExpanded: boolean; isFocused: boolean; onToggle: () => void; selectedCount: number;
    onFocus?: () => void;
}) {
    return (
        <button
            onClick={(e) => { e.stopPropagation(); onFocus?.(); onToggle(); }}
            tabIndex={-1}
            className={`category-header w-full flex items-center gap-2 text-[11px] font-semibold text-[var(--text-muted)] 
        hover:text-[var(--text-secondary)] uppercase tracking-widest mb-2 pb-1.5 
        border-b border-[var(--border-primary)] transition-colors duration-150 px-0.5 outline-none
        ${isFocused ? 'bg-[var(--bg-focus)] text-[var(--text-secondary)]' : ''}`}
            style={{ transition: 'color 0.5s, border-color 0.5s' }}
        >
            <ChevronRight className={`w-3 h-3 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
            <span className="flex-1 text-left">{category}</span>
            {selectedCount > 0 && (
                <span className="text-[10px] bg-[var(--bg-tertiary)] text-[var(--text-secondary)] w-5 h-5 rounded-full flex items-center justify-center font-medium" style={{ transition: 'background-color 0.5s, color 0.5s' }}>{selectedCount}</span>
            )}
        </button>
    );
}

// Category Section with entrance animation
function CategorySection({
    category, categoryApps, selectedApps, isAppAvailable, selectedDistro, toggleApp,
    isExpanded, onToggleExpanded, focusedId, focusedType, onTooltipEnter, onTooltipLeave,
    categoryIndex, onCategoryFocus, onAppFocus,
}: {
    category: string; categoryApps: AppData[]; selectedApps: Set<string>; isAppAvailable: (id: string) => boolean;
    selectedDistro: DistroId; toggleApp: (id: string) => void; isExpanded: boolean; onToggleExpanded: () => void;
    focusedId: string | undefined; focusedType: 'category' | 'app' | undefined;
    onTooltipEnter: (t: string, e: React.MouseEvent) => void; onTooltipLeave: () => void;
    categoryIndex: number;
    onCategoryFocus?: () => void;
    onAppFocus?: (appId: string) => void;
}) {
    const selectedInCategory = categoryApps.filter(a => selectedApps.has(a.id)).length;
    const isCategoryFocused = focusedType === 'category' && focusedId === category;
    const sectionRef = useRef<HTMLDivElement>(null);
    const hasAnimated = useRef(false);

    useLayoutEffect(() => {
        if (!sectionRef.current || hasAnimated.current) return;
        hasAnimated.current = true;

        const section = sectionRef.current;
        const header = section.querySelector('.category-header');
        const items = section.querySelectorAll('.app-item');

        // Initial state
        gsap.set(header, { clipPath: 'inset(0 100% 0 0)' });
        gsap.set(items, { y: -20, opacity: 0 });

        // Animate with staggered delay based on category index
        const delay = categoryIndex * 0.08;

        gsap.to(header, {
            clipPath: 'inset(0 0% 0 0)',
            duration: 0.6,
            ease: 'power2.out',
            delay: delay + 0.2
        });

        gsap.to(items, {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.03,
            ease: 'power2.out',
            delay: delay + 0.4
        });
    }, [categoryIndex]);

    return (
        <div ref={sectionRef} className="mb-5 category-section">
            <CategoryHeader
                category={category}
                isExpanded={isExpanded}
                isFocused={isCategoryFocused}
                onToggle={() => {
                    const willExpand = !isExpanded;
                    onToggleExpanded();
                    if (willExpand) {
                        analytics.categoryExpanded(category);
                    } else {
                        analytics.categoryCollapsed(category);
                    }
                }}
                selectedCount={selectedInCategory}
                onFocus={onCategoryFocus}
            />
            <div className={`overflow-hidden transition-all duration-300 ease-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                {categoryApps.map((app) => (
                    <AppItem key={app.id} app={app} isSelected={selectedApps.has(app.id)} isAvailable={isAppAvailable(app.id)}
                        isFocused={focusedType === 'app' && focusedId === app.id} selectedDistro={selectedDistro}
                        onToggle={() => toggleApp(app.id)} onTooltipEnter={onTooltipEnter} onTooltipLeave={onTooltipLeave}
                        onFocus={() => onAppFocus?.(app.id)} />
                ))}
            </div>
        </div>
    );
}

// Command Footer with integrated AUR bar
function CommandFooter({
    command,
    selectedCount,
    selectedDistro,
    selectedApps,
    hasAurPackages,
    aurAppNames,
    hasYayInstalled,
    setHasYayInstalled
}: {
    command: string;
    selectedCount: number;
    selectedDistro: DistroId;
    selectedApps: Set<string>;
    hasAurPackages: boolean;
    aurAppNames: string[];
    hasYayInstalled: boolean;
    setHasYayInstalled: (value: boolean) => void;
}) {
    const [copied, setCopied] = useState(false);
    const [showCopyTooltip, setShowCopyTooltip] = useState(false);
    const [showDownloadTooltip, setShowDownloadTooltip] = useState(false);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerClosing, setDrawerClosing] = useState(false);

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
        });
        const blob = new Blob([script], { type: 'text/x-shellscript' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tuxmate-${selectedDistro}.sh`;
        a.click();
        URL.revokeObjectURL(url);
        const distroName = distros.find(d => d.id === selectedDistro)?.name || selectedDistro;
        analytics.scriptDownloaded(distroName, selectedCount);
    };

    const showAurBar = selectedDistro === 'arch' && hasAurPackages;

    return (
        <div className="fixed bottom-0 left-0 right-0" style={{ zIndex: 10 }}>
            {/* AUR Bar - seamlessly stacked above command bar with slide animation */}
            <div
                className="grid transition-all duration-300 ease-out"
                style={{
                    gridTemplateRows: showAurBar ? '1fr' : '0fr',
                    transition: 'grid-template-rows 0.3s ease-out'
                }}
            >
                <div className="overflow-hidden">
                    <div
                        className="bg-[var(--bg-secondary)]/95 backdrop-blur-md border-t border-[var(--border-primary)]"
                        style={{ transition: 'background-color 0.5s, border-color 0.5s' }}
                    >
                        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                {/* Info section */}
                                <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
                                    <span className="text-xs font-medium text-[var(--text-muted)]" style={{ transition: 'color 0.5s' }}>
                                        AUR packages:
                                    </span>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        {aurAppNames.map((appName, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-0.5 bg-[var(--accent)]/15 text-[var(--accent)] rounded text-xs font-medium"
                                                style={{ transition: 'background-color 0.5s, color 0.5s' }}
                                            >
                                                {appName}
                                            </span>
                                        ))}
                                    </div>
                                    <span className="text-xs text-[var(--text-muted)] hidden sm:inline" style={{ transition: 'color 0.5s' }}>
                                        — {hasYayInstalled ? 'will use yay' : 'will install yay first'}
                                    </span>
                                </div>

                                {/* Checkbox */}
                                <label className="flex items-center gap-2 cursor-pointer select-none group shrink-0">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={hasYayInstalled}
                                            onChange={(e) => setHasYayInstalled(e.target.checked)}
                                            className="sr-only"
                                        />
                                        <div
                                            className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-150
                                                ${hasYayInstalled
                                                    ? 'bg-[var(--accent)] border-[var(--accent)]'
                                                    : 'bg-[var(--bg-primary)] border-[var(--border-secondary)] group-hover:border-[var(--accent)]'}`}
                                            style={{ transition: 'background-color 0.5s, border-color 0.5s' }}
                                        >
                                            {hasYayInstalled && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                                        </div>
                                    </div>
                                    <span className="text-xs text-[var(--text-secondary)] whitespace-nowrap" style={{ transition: 'color 0.5s' }}>
                                        I have yay installed
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Command Bar - Compact */}
            <div className="bg-[var(--bg-secondary)]/95 backdrop-blur-md border-t border-[var(--border-primary)]" style={{ transition: 'background-color 0.5s, border-color 0.5s' }}>
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <span className="text-xs sm:text-sm text-[var(--text-muted)] whitespace-nowrap tabular-nums hidden sm:block font-medium min-w-[20px]" style={{ transition: 'color 0.5s' }}>{selectedCount}</span>
                        <div
                            className="flex-1 min-w-0 bg-[var(--bg-tertiary)] rounded-lg font-mono text-sm cursor-pointer hover:bg-[var(--bg-hover)] transition-colors group overflow-hidden"
                            style={{ transition: 'background-color 0.5s' }}
                            onClick={() => selectedCount > 0 && setDrawerOpen(true)}
                        >
                            <div className="flex items-start gap-3 px-4 pt-3 pb-1">
                                <div className="flex-1 min-w-0 overflow-x-auto command-scroll">
                                    <code className={`whitespace-nowrap ${selectedCount > 0 ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'}`} style={{ transition: 'color 0.5s' }}>{command}</code>
                                </div>
                                {selectedCount > 0 && (
                                    <div className="shrink-0 w-6 h-6 rounded-md bg-[var(--bg-hover)] group-hover:bg-[var(--accent)]/20 flex items-center justify-center transition-all">
                                        <ChevronUp className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors" />
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* Download Button with Tooltip */}
                        <div className="relative flex items-center"
                            onMouseEnter={() => selectedCount > 0 && setShowDownloadTooltip(true)}
                            onMouseLeave={() => setShowDownloadTooltip(false)}
                        >
                            <button onClick={handleDownload} disabled={selectedCount === 0}
                                className={`h-11 w-11 sm:w-auto sm:px-4 rounded-xl text-sm flex items-center justify-center gap-2 transition-all duration-200 outline-none ${selectedCount > 0 ? 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]' : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] opacity-50 cursor-not-allowed'
                                    }`} style={{ transition: 'background-color 0.5s, color 0.5s' }}>
                                <Download className="w-4 h-4" />
                                <span className="hidden sm:inline font-medium">Download</span>
                            </button>
                            {showDownloadTooltip && (
                                <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-sm rounded-lg shadow-xl border border-[var(--border-secondary)] whitespace-nowrap"
                                    style={{ animation: 'tooltipSlideUp 0.3s ease-out forwards' }}>
                                    Download install script
                                    <div className="absolute right-4 translate-x-1/2 w-2.5 h-2.5 bg-[var(--bg-tertiary)] border-r border-b border-[var(--border-secondary)] rotate-45" style={{ bottom: '-6px' }} />
                                </div>
                            )}
                        </div>
                        {/* Copy Button with Tooltip */}
                        <div className="relative flex items-center">
                            <button onClick={handleCopy} disabled={selectedCount === 0}
                                className={`h-11 px-5 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all duration-200 outline-none ${selectedCount > 0 ? (copied ? 'bg-emerald-600 text-white' : 'bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90') : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] opacity-50 cursor-not-allowed'
                                    }`}>
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy'}</span>
                            </button>
                            {showCopyTooltip && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-medium rounded-lg shadow-xl whitespace-nowrap"
                                    style={{ animation: 'tooltipSlideUp 0.3s ease-out forwards' }}>
                                    Paste this in your terminal!
                                    <div className="absolute left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-emerald-600 rotate-45" style={{ bottom: '-5px' }} />
                                </div>
                            )}
                        </div>
                    </div>
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
                        style={{ animation: drawerClosing ? 'fadeOut 0.25s ease-out forwards' : 'fadeIn 0.2s ease-out' }}
                    />
                    {/* Drawer - Mobile: bottom sheet, Desktop: centered modal */}
                    <div
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="drawer-title"
                        className="fixed z-50 bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-2xl
                            bottom-0 left-0 right-0 rounded-t-2xl
                            md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:max-w-2xl md:w-[90vw]"
                        style={{
                            animation: drawerClosing ? 'slideDown 0.25s ease-in forwards' : 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                            maxHeight: '80vh'
                        }}
                    >
                        {/* Drawer Handle - mobile only */}
                        <div className="flex justify-center pt-3 pb-2 md:hidden">
                            <button
                                className="w-12 h-1.5 bg-[var(--text-muted)]/40 rounded-full cursor-pointer hover:bg-[var(--text-muted)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--bg-secondary)]"
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
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                                aria-label="Close drawer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Command Content - Terminal style */}
                        <div className="p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 200px)' }}>
                            <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-[var(--border-primary)]">
                                {/* Terminal header with action buttons on desktop */}
                                <div className="flex items-center justify-between px-4 py-2 bg-[#252525] border-b border-[var(--border-primary)]">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                        <span className="ml-2 text-xs text-[var(--text-muted)]">bash</span>
                                    </div>
                                    {/* Desktop inline actions */}
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
                                {/* Terminal content */}
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

                        {/* Drawer Actions - mobile only (stacked) */}
                        <div className="md:hidden flex flex-col items-stretch gap-3 px-4 py-4 border-t border-[var(--border-primary)]">
                            <button
                                onClick={handleDownload}
                                className="flex-1 h-14 flex items-center justify-center gap-2 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors font-medium text-base focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
                                aria-label="Download install script"
                            >
                                <Download className="w-5 h-5" />
                                Download Script
                            </button>
                            <button
                                onClick={() => { handleCopy(); setTimeout(closeDrawer, 3000); }}
                                className={`flex-1 h-14 flex items-center justify-center gap-2 rounded-xl font-medium text-base transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${copied
                                    ? 'bg-emerald-600 text-white focus:ring-emerald-500'
                                    : 'bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90 focus:ring-[var(--accent)]'
                                    }`}
                                aria-label={copied ? 'Command copied to clipboard' : 'Copy command to clipboard'}
                            >
                                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                                {copied ? 'Copied!' : 'Copy Command'}
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

// Tooltip
// Simple markdown renderer for tooltip: links, code, bold, newlines
function renderTooltipContent(text: string) {
    // First handle escaped newlines
    const lines = text.split(/\\n/);

    return lines.map((line, lineIdx) => (
        <span key={lineIdx}>
            {lineIdx > 0 && <br />}
            {renderLine(line)}
        </span>
    ));
}

function renderLine(text: string) {
    // Split by code, links, and bold
    const parts = text.split(/(`[^`]+`|\[.*?\]\(.*?\)|\*\*.*?\*\*)/);
    return parts.map((part, i) => {
        // Check for inline code
        const codeMatch = part.match(/^`([^`]+)`$/);
        if (codeMatch) {
            return (
                <code key={i} className="bg-[var(--bg-primary)] px-1.5 py-0.5 rounded text-[var(--accent)] font-mono text-[10px] select-all break-all">
                    {codeMatch[1]}
                </code>
            );
        }
        // Check for bold
        const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
        if (boldMatch) {
            return <strong key={i} className="font-semibold text-[var(--text-primary)]">{boldMatch[1]}</strong>;
        }
        // Check for links
        const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
        if (linkMatch) {
            return (
                <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer"
                    className="text-[var(--accent)] underline hover:opacity-80">
                    {linkMatch[1]}
                </a>
            );
        }
        return <span key={i}>{part}</span>;
    });
}

function Tooltip({ tooltip, onEnter, onLeave }: {
    tooltip: { text: string; x: number; y: number; width?: number; key?: number } | null;
    onEnter: () => void;
    onLeave: () => void;
}) {
    if (!tooltip) return null;
    return (
        <div
            key={tooltip.key}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
            className="fixed px-3 py-2.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] text-xs rounded-lg shadow-xl border border-[var(--border-secondary)] max-w-[320px] leading-relaxed"
            style={{
                left: tooltip.x,
                top: tooltip.y,
                transform: 'translate(-50%, -100%)',
                zIndex: 99999,
                animation: 'tooltipSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}>
            {renderTooltipContent(tooltip.text)}
            {/* Arrow pointer */}
            <div
                className="absolute left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--bg-tertiary)] border-r border-b border-[var(--border-secondary)] rotate-45"
                style={{ bottom: '-7px' }}
            />
        </div>
    );
}

// CSS Keyframes (injected)
function GlobalStyles() {
    return (
        <style jsx global>{`
      @keyframes dropdownOpen {
        0% { opacity: 0; transform: scale(0.95) translateY(-8px); }
        100% { opacity: 1; transform: scale(1) translateY(0); }
      }
      @keyframes slideIn {
        0% { opacity: 0; transform: translateX(8px); }
        100% { opacity: 1; transform: translateX(0); }
      }
      @keyframes tooltipSlideUp {
        0% { 
          opacity: 0; 
          transform: translate(-50%, -90%);
        }
        100% { 
          opacity: 1; 
          transform: translate(-50%, -100%);
        }
      }
      @keyframes slideInFromBottom {
        0% {
          opacity: 0;
          transform: translateY(100%);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes fadeInScale {
        0% {
          opacity: 0;
          transform: scale(0.9);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }
      @keyframes distroDropdownOpen {
        0% { 
          opacity: 0; 
          transform: scale(0.9) translateY(-10px); 
        }
        60% { 
          opacity: 1; 
          transform: scale(1.02) translateY(2px); 
        }
        100% { 
          opacity: 1; 
          transform: scale(1) translateY(0); 
        }
      }
      @keyframes distroItemSlide {
        0% { 
          opacity: 0; 
          transform: translateX(15px) scale(0.95); 
        }
        60% { 
          opacity: 1; 
          transform: translateX(-3px) scale(1.01); 
        }
        100% { 
          opacity: 1; 
          transform: translateX(0) scale(1); 
        }
      }
    `}</style>
    );
}

// Navigation item
interface NavItem { type: 'category' | 'app'; id: string; category: Category; }

// Main Page
export default function Home() {

    const { tooltip, show: showTooltip, hide: hideTooltip, onTooltipEnter, onTooltipLeave } = useDelayedTooltip(600);
    const { selectedDistro, selectedApps, setSelectedDistro, toggleApp, clearAll, isAppAvailable, generatedCommand, selectedCount, hasYayInstalled, setHasYayInstalled, hasAurPackages, aurPackageNames, aurAppNames } = useLinuxInit();

    const allCategoriesWithApps = useMemo(() => categories.map(cat => ({ category: cat, apps: getAppsByCategory(cat) })).filter(c => c.apps.length > 0), []);
    const columns = useMemo(() => {
        const cols: Array<typeof allCategoriesWithApps> = [[], [], [], [], []];
        const heights = [0, 0, 0, 0, 0];
        allCategoriesWithApps.forEach(catData => {
            const minIdx = heights.indexOf(Math.min(...heights));
            cols[minIdx].push(catData);
            heights[minIdx] += catData.apps.length + 2;
        });
        return cols;
    }, [allCategoriesWithApps]);

    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set(categories));
    const toggleCategoryExpanded = useCallback((cat: string) => {
        setExpandedCategories(prev => { const next = new Set(prev); next.has(cat) ? next.delete(cat) : next.add(cat); return next; });
    }, []);

    const navItems = useMemo(() => {
        const items: NavItem[][] = [];
        columns.forEach((colCategories) => {
            const colItems: NavItem[] = [];
            colCategories.forEach(({ category, apps: catApps }) => {
                colItems.push({ type: 'category', id: category, category });
                if (expandedCategories.has(category)) catApps.forEach(app => colItems.push({ type: 'app', id: app.id, category }));
            });
            items.push(colItems);
        });
        return items;
    }, [columns, expandedCategories]);

    const [focusPos, setFocusPos] = useState<{ col: number; row: number } | null>(null);
    const clearFocus = useCallback(() => setFocusPos(null), []);
    const focusedItem = useMemo(() => { if (!focusPos) return null; return navItems[focusPos.col]?.[focusPos.row] || null; }, [navItems, focusPos]);

    // Helper to set focus position by item type and id
    const setFocusByItem = useCallback((type: 'category' | 'app', id: string) => {
        for (let col = 0; col < navItems.length; col++) {
            const colItems = navItems[col];
            for (let row = 0; row < colItems.length; row++) {
                if (colItems[row].type === type && colItems[row].id === id) {
                    setFocusPos({ col, row });
                    return;
                }
            }
        }
    }, [navItems]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            const key = e.key;
            if (key === ' ') {
                e.preventDefault();
                if (focusPos) {
                    const item = navItems[focusPos.col]?.[focusPos.row];
                    if (item?.type === 'category') toggleCategoryExpanded(item.id);
                    else if (item?.type === 'app') toggleApp(item.id);
                }
                return;
            }
            if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'j', 'k', 'h', 'l', 'Escape'].includes(key)) return;
            e.preventDefault();
            if (key === 'Escape') { setFocusPos(null); return; }
            setFocusPos(prev => {
                if (!prev) return { col: 0, row: 0 };
                let { col, row } = prev;
                const currentCol = navItems[col] || [];
                if (key === 'ArrowDown' || key === 'j') row = Math.min(row + 1, currentCol.length - 1);
                else if (key === 'ArrowUp' || key === 'k') row = Math.max(row - 1, 0);
                else if (key === 'ArrowRight' || key === 'l') { if (col < navItems.length - 1) { col++; row = Math.min(row, (navItems[col]?.length || 1) - 1); } }
                else if (key === 'ArrowLeft' || key === 'h') { if (col > 0) { col--; row = Math.min(row, (navItems[col]?.length || 1) - 1); } }
                return { col, row };
            });
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navItems, focusPos, toggleCategoryExpanded, toggleApp]);

    // Header entrance animation
    const headerRef = useRef<HTMLElement>(null);
    useLayoutEffect(() => {
        if (!headerRef.current) return;

        const header = headerRef.current;
        const title = header.querySelector('.header-animate');
        const controls = header.querySelector('.header-controls');

        // Animate title with clip-path reveal
        gsap.to(title, {
            clipPath: 'inset(0 0% 0 0)',
            duration: 0.8,
            ease: 'power2.out',
            delay: 0.1,
            onComplete: () => {
                if (title) gsap.set(title, { clipPath: 'none' });
            }
        });

        // Animate controls with fade-in
        gsap.to(controls, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            delay: 0.3
        });
    }, []);

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative" style={{ transition: 'background-color 0.5s, color 0.5s' }} onClick={clearFocus}>
            <GlobalStyles />

            <Tooltip tooltip={tooltip} onEnter={onTooltipEnter} onLeave={onTooltipLeave} />

            {/* Header */}
            <header ref={headerRef} className="pt-8 sm:pt-12 pb-8 sm:pb-10 px-4 sm:px-6 relative" style={{ zIndex: 1 }}>
                <div className="max-w-6xl mx-auto">


                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="header-animate">
                            <div className="flex items-start gap-4">
                                <img src="/tuxmate.png" alt="TuxMate Logo" className="w-16 h-16 sm:w-[72px] sm:h-[72px] object-contain shrink-0" />
                                <div className="flex flex-col justify-center">
                                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ transition: 'color 0.5s' }}>TuxMate</h1>
                                    <p className="text-[10px] sm:text-xs text-[var(--text-muted)] uppercase tracking-widest" style={{ transition: 'color 0.5s' }}>The Linux Bulk App Installer.</p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <p className="text-xs text-[var(--text-muted)]" style={{ transition: 'color 0.5s' }}>Select apps • <span className="hidden sm:inline">Arrow keys + Space</span></p>
                                        <span className="text-[var(--text-muted)] opacity-30">|</span>
                                        <HowItWorks />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="header-controls flex items-center gap-3 sm:gap-4">
                            {/* Minimal text links group */}
                            <div className="flex items-center gap-3 sm:gap-4">
                                <GitHubLink />
                                <ContributeLink />
                                {selectedCount > 0 && (
                                    <>
                                        <span className="text-[var(--text-muted)] opacity-30 hidden sm:inline">·</span>
                                        <button
                                            onClick={clearAll}
                                            className="group flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-rose-500 transition-all duration-300"
                                        >
                                            <X className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
                                            <span className="hidden sm:inline relative">
                                                Clear ({selectedCount})
                                                <span className="absolute bottom-0 left-0 w-0 h-px bg-rose-400 transition-all duration-300 group-hover:w-full" />
                                            </span>
                                        </button>
                                    </>
                                )}
                            </div>
                            {/* Control buttons */}
                            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[var(--border-primary)]">
                                <ThemeToggle />
                                <DistroSelector selectedDistro={selectedDistro} onSelect={setSelectedDistro} />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* App Grid */}
            <main className="px-4 sm:px-6 pb-24 relative" style={{ zIndex: 1 }}>
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 sm:gap-x-8">
                        {columns.map((columnCategories, colIdx) => {
                            // Calculate starting index for this column
                            let globalIdx = 0;
                            for (let c = 0; c < colIdx; c++) {
                                globalIdx += columns[c].length;
                            }
                            return (
                                <div key={colIdx}>
                                    {columnCategories.map(({ category, apps: categoryApps }, catIdx) => (
                                        <CategorySection key={category} category={category} categoryApps={categoryApps} selectedApps={selectedApps}
                                            isAppAvailable={isAppAvailable} selectedDistro={selectedDistro} toggleApp={toggleApp}
                                            isExpanded={expandedCategories.has(category)} onToggleExpanded={() => toggleCategoryExpanded(category)}
                                            focusedId={focusedItem?.id} focusedType={focusedItem?.type}
                                            onTooltipEnter={showTooltip} onTooltipLeave={hideTooltip}
                                            categoryIndex={globalIdx + catIdx}
                                            onCategoryFocus={() => setFocusByItem('category', category)}
                                            onAppFocus={(appId) => setFocusByItem('app', appId)} />
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>

            <CommandFooter
                command={generatedCommand}
                selectedCount={selectedCount}
                selectedDistro={selectedDistro}
                selectedApps={selectedApps}
                hasAurPackages={hasAurPackages}
                aurAppNames={aurAppNames}
                hasYayInstalled={hasYayInstalled}
                setHasYayInstalled={setHasYayInstalled}
            />
        </div>
    );
}
