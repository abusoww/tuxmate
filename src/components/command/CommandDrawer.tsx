'use client';

import { useState, useRef } from 'react';
import { Check, Copy, X, Download } from 'lucide-react';
import { AurDrawerSettings } from './AurDrawerSettings';

interface CommandDrawerProps {
    isOpen: boolean;
    isClosing: boolean;
    onClose: () => void;
    command: string;
    selectedCount: number;
    copied: boolean;
    onCopy: () => void;
    onDownload: () => void;
    // AUR settings
    showAur: boolean;
    aurAppNames: string[];
    hasYayInstalled: boolean;
    setHasYayInstalled: (value: boolean) => void;
    selectedHelper: 'yay' | 'paru';
    setSelectedHelper: (helper: 'yay' | 'paru') => void;
}

// Slide-up drawer for command preview (mobile: bottom sheet, desktop: centered modal)
export function CommandDrawer({
    isOpen,
    isClosing,
    onClose,
    command,
    selectedCount,
    copied,
    onCopy,
    onDownload,
    showAur,
    aurAppNames,
    hasYayInstalled,
    setHasYayInstalled,
    selectedHelper,
    setSelectedHelper,
}: CommandDrawerProps) {
    // Swipe-to-dismiss state
    const [dragOffset, setDragOffset] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartY = useRef(0);
    const DISMISS_THRESHOLD = 100; // px to drag before closing

    const handleTouchStart = (e: React.TouchEvent) => {
        dragStartY.current = e.touches[0].clientY;
        setIsDragging(true);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const delta = e.touches[0].clientY - dragStartY.current;
        // Only allow dragging down (positive delta)
        setDragOffset(Math.max(0, delta));
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        if (dragOffset > DISMISS_THRESHOLD) {
            onClose();
        }
        setDragOffset(0);
    };

    if (!isOpen) return null;

    const handleCopyAndClose = () => {
        onCopy();
        setTimeout(onClose, 3000);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                onClick={onClose}
                aria-hidden="true"
                style={{ animation: isClosing ? 'fadeOut 0.3s ease-out forwards' : 'fadeIn 0.3s ease-out' }}
            />

            {/* Drawer */}
            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="drawer-title"
                className="fixed z-50 bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-2xl
                    bottom-0 left-0 right-0 rounded-t-2xl
                    md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:max-w-2xl md:w-[90vw]"
                style={{
                    animation: isClosing
                        ? 'slideDown 0.3s cubic-bezier(0.32, 0, 0.67, 0) forwards'
                        : dragOffset > 0 ? 'none' : 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    maxHeight: '80vh',
                    transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
                    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
            >
                {/* Drawer Handle - mobile only, draggable */}
                <div
                    className="flex justify-center pt-3 pb-2 md:hidden cursor-grab active:cursor-grabbing touch-none"
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    <div
                        className="w-12 h-1.5 bg-[var(--text-muted)]/40 rounded-full"
                        onClick={onClose}
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
                            <p className="text-xs text-[var(--text-muted)]">
                                {selectedCount} app{selectedCount !== 1 ? 's' : ''}
                                <span className="hidden md:inline"> • Press Esc to close</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                        aria-label="Close drawer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Command Content */}
                <div className="p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 200px)' }}>
                    {/* AUR Settings */}
                    {showAur && (
                        <AurDrawerSettings
                            aurAppNames={aurAppNames}
                            hasYayInstalled={hasYayInstalled}
                            setHasYayInstalled={setHasYayInstalled}
                            selectedHelper={selectedHelper}
                            setSelectedHelper={setSelectedHelper}
                        />
                    )}

                    {/* Terminal window */}
                    <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-[var(--border-primary)]">
                        <div className="flex items-center justify-between px-4 py-2 bg-[#252525] border-b border-[var(--border-primary)]">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                <span className="ml-2 text-xs text-[var(--text-muted)]">bash</span>
                            </div>
                            {/* Desktop action buttons */}
                            <div className="hidden md:flex items-center gap-2">
                                <button
                                    onClick={onDownload}
                                    className="h-7 px-3 flex items-center gap-1.5 rounded-md bg-[var(--bg-tertiary)]/50 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors text-xs font-medium"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Download
                                </button>
                                <button
                                    onClick={handleCopyAndClose}
                                    className={`h-7 px-3 flex items-center gap-1.5 rounded-md text-xs font-medium transition-colors ${copied
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white'
                                        }`}
                                >
                                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                    {copied ? 'Copied!' : 'Copy'}
                                </button>
                            </div>
                        </div>
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

                {/* Mobile Actions - side by side for better UX */}
                <div className="md:hidden flex items-stretch gap-3 px-4 py-4 border-t border-[var(--border-primary)]">
                    <button
                        onClick={onDownload}
                        className="flex-1 h-12 flex items-center justify-center gap-2 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] active:scale-[0.98] transition-all font-medium text-sm"
                    >
                        <Download className="w-4 h-4" />
                        Download
                    </button>
                    <button
                        onClick={handleCopyAndClose}
                        className={`flex-1 h-12 flex items-center justify-center gap-2 rounded-xl font-medium text-sm active:scale-[0.98] transition-all ${copied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90'
                            }`}
                    >
                        {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        {copied ? 'Copied!' : 'Copy'}
                    </button>
                </div>
            </div>
        </>
    );
}
