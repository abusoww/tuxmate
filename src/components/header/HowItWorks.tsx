'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle, X } from 'lucide-react';
import { analytics } from '@/lib/analytics';
import { useI18n } from '@/hooks/useI18n';

export function HowItWorks() {
    const { t, fmt, dir } = useI18n();
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [mounted, setMounted] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

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

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.ctrlKey || e.altKey || e.metaKey) return;

            if (e.key === '?' || (e.shiftKey && e.key === '/')) {
                e.preventDefault();
                if (isOpen) {
                    handleClose();
                } else {
                    handleOpen();
                }
            }

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
        setTimeout(() => {
            setIsOpen(false);
            setIsClosing(false);
        }, 200);
    };

    const isRtl = dir === 'rtl';

    const modal = (
        <>
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[99998]"
                onClick={handleClose}
                style={{
                    animation: isClosing
                        ? 'fadeOut 0.2s ease-out forwards'
                        : 'fadeIn 0.25s ease-out'
                }}
            />

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
                    textAlign: isRtl ? 'right' : 'left',
                }}
            >
                <div className={`flex items-center justify-between gap-3 px-5 py-4 border-b border-[var(--border-primary)] shrink-0 ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <div className="w-10 h-10 rounded-xl bg-[var(--accent)]/15 flex items-center justify-center">
                            <HelpCircle className="w-5 h-5 text-[var(--accent)]" />
                        </div>
                        <div className={`${isRtl ? 'text-right' : ''}`}>
                            <h3 id="how-it-works-title" className="text-lg font-semibold text-[var(--text-primary)]">{t.app.howItWorksFull}</h3>
                            <p className="text-xs text-[var(--text-muted)]">{t.help.subtitle}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-5 space-y-5" style={{ scrollbarGutter: 'stable' }}>
                    {/* Quick Start Steps */}
                    <div>
                        <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">{t.help.quickStart}</h4>
                        <div className="space-y-3">
                            <div className={`flex gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[10px] font-bold text-[var(--accent)] shrink-0">1</div>
                                <p className="text-sm text-[var(--text-secondary)]">{t.help.step1}</p>
                            </div>
                            <div className={`flex gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[10px] font-bold text-[var(--accent)] shrink-0">2</div>
                                <p className="text-sm text-[var(--text-secondary)]">{t.help.step2}</p>
                            </div>
                            <div className={`flex gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[10px] font-bold text-[var(--accent)] shrink-0">3</div>
                                <p className="text-sm text-[var(--text-secondary)]">{t.help.step3}</p>
                            </div>
                        </div>
                    </div>

                    {/* Unavailable Apps */}
                    <div className="pt-3 border-t border-[var(--border-primary)]">
                        <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">{t.help.appNotAvailable}</h4>
                        <div className="space-y-2.5 text-xs text-[var(--text-muted)] leading-relaxed">
                            <p>{t.help.notAvailableDesc}</p>
                            <ul className="space-y-2" style={{ [isRtl ? 'marginRight' : 'marginLeft']: '0.5rem' }}>
                                <li className={`flex gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                    <span className="text-[var(--accent)] shrink-0">•</span>
                                    <span>{t.help.downloadFromWebsite} <code className="bg-[var(--bg-tertiary)] px-1 rounded">.AppImage</code></span>
                                </li>
                                <li className={`flex gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                    <span className="text-[var(--accent)] shrink-0">•</span>
                                    <span>{t.help.hoverInfo}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Arch & AUR */}
                    <div className="pt-3 border-t border-[var(--border-primary)]">
                        <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">{t.help.aurTitle}</h4>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                            {t.help.aurDesc}
                        </p>
                    </div>

                    {/* Keyboard Shortcuts */}
                    <div className="pt-3 border-t border-[var(--border-primary)]">
                        <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">{t.help.keyboardShortcuts}</h4>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-mono">↑↓←→</kbd>
                                <span className="text-[var(--text-muted)]">{t.help.navigate}</span>
                            </div>
                            <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-mono">hjkl</kbd>
                                <span className="text-[var(--text-muted)]">{t.help.vimNav}</span>
                            </div>
                            <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-mono">Space</kbd>
                                <span className="text-[var(--text-muted)]">{t.help.toggleSelection}</span>
                            </div>
                            <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-mono">/</kbd>
                                <span className="text-[var(--text-muted)]">{t.help.searchApps}</span>
                            </div>
                            <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-mono">y</kbd>
                                <span className="text-[var(--text-muted)]">{t.help.copyCmd}</span>
                            </div>
                            <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-mono">d</kbd>
                                <span className="text-[var(--text-muted)]">{t.help.downloadScript}</span>
                            </div>
                            <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-mono">c</kbd>
                                <span className="text-[var(--text-muted)]">{t.help.clearSelection}</span>
                            </div>
                            <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-mono">t</kbd>
                                <span className="text-[var(--text-muted)]">{t.help.toggleTheme}</span>
                            </div>
                            <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-mono">Tab</kbd>
                                <span className="text-[var(--text-muted)]">{t.help.openPreview}</span>
                            </div>
                            <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-mono">Esc</kbd>
                                <span className="text-[var(--text-muted)]">{t.help.closePopups}</span>
                            </div>
                            <div className={`flex items-center gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <kbd className="px-1.5 py-0.5 bg-[var(--bg-tertiary)] text-[var(--text-secondary)] rounded text-[10px] font-mono">?</kbd>
                                <span className="text-[var(--text-muted)]">{t.help.thisHelp}</span>
                            </div>
                        </div>
                    </div>

                    {/* Pro Tips */}
                    <div className="pt-3 border-t border-[var(--border-primary)]">
                        <h4 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">{t.help.proTips}</h4>
                        <ul className="space-y-2 text-xs text-[var(--text-muted)] leading-relaxed">
                            <li className={`flex gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <span className="text-emerald-500 shrink-0">💡</span>
                                <span>{t.help.tipDownload}</span>
                            </li>
                            <li className={`flex gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <span className="text-emerald-500 shrink-0">💡</span>
                                <span>
                                    {t.help.tipRunScript}{' '}
                                    <code className="bg-[var(--bg-tertiary)] px-1 rounded">chmod +x tuxmate-*.sh && ./tuxmate-*.sh</code>
                                    {' / '}
                                    <code className="bg-[var(--bg-tertiary)] px-1 rounded">bash tuxmate-*.sh</code>
                                </span>
                            </li>
                            <li className={`flex gap-2 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <span className="text-emerald-500 shrink-0">💡</span>
                                <span>{t.help.tipSaved}</span>
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
                className={`flex items-center gap-1.5 text-sm transition-[color,transform] duration-200 hover:scale-105 ${isOpen ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'}`}
            >
                <HelpCircle className="w-4 h-4" />
                <span className="hidden sm:inline whitespace-nowrap">{t.app.howItWorks}?</span>
            </button>
            {isOpen && mounted && typeof document !== 'undefined' && createPortal(modal, document.body)}
        </>
    );
}
