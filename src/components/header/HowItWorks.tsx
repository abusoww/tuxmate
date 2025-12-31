'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, X } from 'lucide-react';
import { analytics } from '@/lib/analytics';

/**
 * HowItWorks - Interactive help modal with quick start guide
 * 
 * Displays a centered modal with backdrop blur, containing:
 * - Quick start steps for using TuxMate
 * - Info about unavailable apps
 * - Arch/AUR specific info
 * - Keyboard shortcuts
 * - Pro tips
 */
export function HowItWorks() {
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [mounted, setMounted] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Global keyboard shortcut: ? to toggle modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore if typing in input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            // Skip if Ctrl/Alt/Meta are pressed (Shift is allowed for ?)
            if (e.ctrlKey || e.altKey || e.metaKey) return;

            if (e.key === '?' || (e.shiftKey && e.key === '/')) {
                e.preventDefault();
                if (isOpen) {
                    handleClose();
                } else {
                    handleOpen();
                }
            }

            // Close on Escape
            if (e.key === 'Escape' && isOpen) {
                handleClose();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen]);

    const handleOpen = () => {
        setIsClosing(false);
        setIsOpen(true);
        analytics.helpOpened();
    };

    const handleClose = () => {
        setIsClosing(true);
        analytics.helpClosed();
        // Wait for exit animation to finish
        setTimeout(() => {
            setIsOpen(false);
            setIsClosing(false);
        }, 200);
    };

    const modal = (
        <>
            {/* Backdrop with blur */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[99998]"
                onClick={handleClose}
                style={{
                    animation: isClosing
                        ? 'fadeOut 0.2s ease-out forwards'
                        : 'fadeIn 0.25s ease-out'
                }}
            />

            {/* Modal */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="how-it-works-title"
                className="fixed bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-2xl z-[99999]"
                style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '20px',
                    width: '440px',
                    maxWidth: 'calc(100vw - 32px)',
                    maxHeight: 'min(80vh, 650px)',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: isClosing
                        ? 'modalSlideOut 0.2s ease-out forwards'
                        : 'modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    overflow: 'hidden',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-[var(--border-primary)] shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center">
                            <HelpCircle className="w-5 h-5 text-[var(--accent)]" />
                        </div>
                        <div>
                            <h3 id="how-it-works-title" className="text-lg font-semibold text-[var(--text-primary)]">How TuxMate Works</h3>
                            <p className="text-xs text-[var(--text-muted)]">Quick guide &amp; keyboard shortcuts</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto p-5 space-y-5" style={{ scrollbarGutter: 'stable' }}>
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
                                    <span><strong className="text-[var(--text-secondary)]">Hover the ⓘ icon:</strong> Some unavailable apps show links to alternative download methods</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Arch & AUR */}
                    <div className="pt-3 border-t border-[var(--border-primary)]">
                        <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Arch Linux &amp; AUR</h4>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                            Some Arch packages are in the <strong className="text-[var(--text-secondary)]">AUR</strong> (Arch User Repository).
                            TuxMate uses <code className="bg-[var(--bg-tertiary)] px-1 rounded">yay</code> or <code className="bg-[var(--bg-tertiary)] px-1 rounded">paru</code> to install these.
                            When selecting AUR packages, a popup will ask which helper you have. You can switch between helpers anytime using <kbd className="px-1 py-0.5 bg-[var(--bg-tertiary)] rounded text-[10px]">1</kbd> (yay) or <kbd className="px-1 py-0.5 bg-[var(--bg-tertiary)] rounded text-[10px]">2</kbd> (paru).
                        </p>
                    </div>

                    {/* Keyboard Shortcuts */}
                    <div className="pt-3 border-t border-[var(--border-primary)]">
                        <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Keyboard Shortcuts</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="flex items-center gap-2">
                                <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-mono">↑↓←→</kbd>
                                <span className="text-[var(--text-muted)]">Navigate</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-mono">hjkl</kbd>
                                <span className="text-[var(--text-muted)]">Vim navigation</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-mono">Space</kbd>
                                <span className="text-[var(--text-muted)]">Toggle selection</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-mono">/</kbd>
                                <span className="text-[var(--text-muted)]">Search apps</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-mono">y</kbd>
                                <span className="text-[var(--text-muted)]">Copy command</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-mono">d</kbd>
                                <span className="text-[var(--text-muted)]">Download script</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-mono">c</kbd>
                                <span className="text-[var(--text-muted)]">Clear selection</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-mono">t</kbd>
                                <span className="text-[var(--text-muted)]">Toggle theme</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-mono">Tab</kbd>
                                <span className="text-[var(--text-muted)]">Open preview</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-mono">Esc</kbd>
                                <span className="text-[var(--text-muted)]">Close popups</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-mono">?</kbd>
                                <span className="text-[var(--text-muted)]">This help</span>
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
                                <span>
                                    <strong className="text-[var(--text-secondary)]">Running the script:</strong>{' '}
                                    <code className="bg-[var(--bg-tertiary)] px-1 rounded">chmod +x tuxmate-*.sh && ./tuxmate-*.sh</code> or{' '}
                                    <code className="bg-[var(--bg-tertiary)] px-1 rounded">bash tuxmate-*.sh</code>
                                </span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-emerald-500">💡</span>
                                <span>Your selections are <strong className="text-[var(--text-secondary)]">saved automatically</strong> — come back anytime to modify your setup</span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-emerald-500">💡</span>
                                <span>Running <code className="bg-[var(--bg-tertiary)] px-1 rounded">.deb</code> files: <code className="bg-[var(--bg-tertiary)] px-1 rounded">sudo dpkg -i file.deb</code></span>
                            </li>
                            <li className="flex gap-2">
                                <span className="text-emerald-500">💡</span>
                                <span>Running <code className="bg-[var(--bg-tertiary)] px-1 rounded">.rpm</code> files: <code className="bg-[var(--bg-tertiary)] px-1 rounded">sudo dnf install ./file.rpm</code></span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );

    return (
        <>
            <button
                ref={triggerRef}
                onClick={handleOpen}
                className={`flex items-center gap-1.5 text-sm transition-all duration-200 hover:scale-105 ${isOpen ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
            >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline whitespace-nowrap">How it works?</span>
            </button>
            {isOpen && mounted && typeof document !== 'undefined' && createPortal(modal, document.body)}
        </>
    );
}
