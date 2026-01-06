'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, X } from 'lucide-react';
import { analytics } from '@/lib/analytics';

// The "?" help modal - shows keyboard shortcuts and how to use the app
export function HowItWorks() {
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [mounted, setMounted] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);

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

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
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
                className="fixed bg-[var(--bg-secondary)] border border-[var(--border-primary)] z-[99999]"
                style={{
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    borderRadius: '16px',
                    width: '620px',
                    maxWidth: 'calc(100vw - 32px)',
                    maxHeight: 'min(85vh, 720px)',
                    display: 'flex',
                    flexDirection: 'column',
                    animation: isClosing
                        ? 'modalSlideOut 0.2s ease-out forwards'
                        : 'modalSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    overflow: 'hidden',
                    boxShadow: '0 16px 48px -8px rgba(0, 0, 0, 0.2)',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-primary)]">
                    <h3 id="how-it-works-title" className="text-base font-semibold text-[var(--text-primary)]">
                        Help
                    </h3>
                    <button
                        onClick={handleClose}
                        className="p-1.5 -mr-1 rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6" style={{ scrollbarGutter: 'stable' }}>

                    {/* Shortcuts */}
                    <section>
                        <h4 className="text-sm font-medium text-[var(--text-primary)] mb-4">Keyboard Shortcuts</h4>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                            {[
                                ['↑↓←→', 'Navigate through apps'],
                                ['hjkl', 'Vim-style navigation'],
                                ['Space', 'Select or deselect app'],
                                ['/', 'Focus search box'],
                                ['y', 'Copy install command'],
                                ['d', 'Download install script'],
                                ['c', 'Clear all selections'],
                                ['t', 'Toggle light/dark theme'],
                                ['Tab', 'Preview current selection'],
                                ['Esc', 'Close this modal'],
                                ['?', 'Show this help'],
                                ['1 / 2', 'Switch AUR helper (yay/paru)'],
                            ].map(([key, desc]) => (
                                <div key={key} className="flex items-center gap-3 text-sm">
                                    <kbd className="inline-flex items-center justify-center min-w-[52px] px-2 py-1 rounded-md bg-[var(--bg-tertiary)] border border-[var(--border-primary)] text-xs font-mono text-[var(--text-secondary)]">
                                        {key}
                                    </kbd>
                                    <span className="text-[var(--text-muted)]">{desc}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Getting Started */}
                    <section>
                        <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Getting Started</h4>
                        <ol className="space-y-2 text-sm text-[var(--text-muted)] leading-relaxed">
                            <li>
                                <strong className="text-[var(--text-secondary)]">1. Pick your distro</strong> — Select your Linux distribution from the dropdown at the top. This determines which package manager commands TuxMate generates for you.
                            </li>
                            <li>
                                <strong className="text-[var(--text-secondary)]">2. Select apps</strong> — Browse the categories and click on apps to add them to your selection. Selected apps are highlighted. Use keyboard shortcuts to navigate faster.
                            </li>
                            <li>
                                <strong className="text-[var(--text-secondary)]">3. Copy or download</strong> — Copy the generated install command to your clipboard, or download a complete shell script. Downloaded scripts include error handling and can install multiple apps at once.
                            </li>
                            <li>
                                <strong className="text-[var(--text-secondary)]">4. Run in terminal</strong> — Open your terminal, paste the command (Ctrl+Shift+V), and press Enter. The script will handle the rest.
                            </li>
                        </ol>
                    </section>

                    {/* Notes */}
                    <section>
                        <h4 className="text-sm font-medium text-[var(--text-primary)] mb-3">Good to Know</h4>
                        <ul className="space-y-2 text-sm text-[var(--text-muted)] leading-relaxed">
                            <li>
                                <strong className="text-[var(--text-secondary)]">Greyed out apps</strong> aren&apos;t available in your distro&apos;s official repositories. Try switching to Flatpak or Snap in the dropdown, or hover the info icon next to the app for alternative installation methods.
                            </li>
                            <li>
                                <strong className="text-[var(--text-secondary)]">Arch Linux users</strong> — Some packages come from the AUR. TuxMate uses yay or paru as the AUR helper. Press 1 or 2 anytime to switch between them.
                            </li>
                            <li>
                                <strong className="text-[var(--text-secondary)]">Auto-save</strong> — Your app selections are saved automatically in your browser. Come back anytime and your selections will still be there.
                            </li>
                            <li>
                                <strong className="text-[var(--text-secondary)]">Running scripts</strong> — Downloaded scripts are saved as <code className="px-1 py-0.5 rounded bg-[var(--bg-tertiary)] text-xs font-mono">tuxmate-*.sh</code>. Run them with <code className="px-1 py-0.5 rounded bg-[var(--bg-tertiary)] text-xs font-mono">bash tuxmate-*.sh</code>
                            </li>
                        </ul>
                    </section>
                </div>
            </div>
        </>
    );

    return (
        <>
            <button
                ref={triggerRef}
                onClick={handleOpen}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs sm:text-sm transition-all duration-200 hover:scale-105 ${isOpen
                    ? 'bg-[var(--accent)]/20 text-[var(--text-primary)]'
                    : 'bg-[var(--bg-tertiary)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}
            >
                <HelpCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="whitespace-nowrap">Help</span>
            </button>
            {isOpen && mounted && typeof document !== 'undefined' && createPortal(modal, document.body)}
        </>
    );
}
