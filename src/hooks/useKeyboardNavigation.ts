'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { type Category } from '@/lib/data';

// What we're navigating to
export interface NavItem {
    type: 'category' | 'app';
    id: string;
    category: Category;
}

// Where we are in the grid
export interface FocusPosition {
    col: number;
    row: number;
}


// Vim-style keyboard navigation. Because real devs don't use mice.
export function useKeyboardNavigation(
    navItems: NavItem[][],
    onToggleCategory: (id: string) => void,
    onToggleApp: (id: string) => void
) {
    const [focusPos, setFocusPos] = useState<FocusPosition | null>(null);

    // Track if focus was set via keyboard (to enable scroll) vs mouse (no scroll)
    const fromKeyboard = useRef(false);

    // Track if focus mode is keyboard (for UI highlighting)
    const [isKeyboardNavigating, setIsKeyboardNavigating] = useState(false);

    /** Clear focus (e.g., when clicking outside) */
    const clearFocus = useCallback(() => setFocusPos(null), []);

    /** Get the currently focused item */
    const focusedItem = useMemo(() => {
        if (!focusPos) return null;
        return navItems[focusPos.col]?.[focusPos.row] || null;
    }, [navItems, focusPos]);

    /** Set focus position by item type and id (from mouse - no scroll) */
    const setFocusByItem = useCallback((type: 'category' | 'app', id: string) => {
        for (let col = 0; col < navItems.length; col++) {
            const colItems = navItems[col];
            for (let row = 0; row < colItems.length; row++) {
                if (colItems[row].type === type && colItems[row].id === id) {
                    fromKeyboard.current = false; // Mouse selection - don't scroll
                    setIsKeyboardNavigating(false); // Disable focus ring
                    setFocusPos({ col, row });
                    return;
                }
            }
        }
    }, [navItems]);

    /** Keyboard event handler */
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Skip if typing in input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            // Skip if modifier keys are pressed (prevents conflicts with browser shortcuts like Ctrl+D)
            if (e.ctrlKey || e.altKey || e.metaKey) return;

            const key = e.key;

            // Space to toggle
            if (key === ' ') {
                e.preventDefault();
                if (focusPos) {
                    const item = navItems[focusPos.col]?.[focusPos.row];
                    if (item?.type === 'category') onToggleCategory(item.id);
                    else if (item?.type === 'app') onToggleApp(item.id);
                }
                return;
            }

            // Navigation keys (arrow keys + vim keys)
            if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight', 'j', 'k', 'h', 'l', 'Escape'].includes(key)) return;
            e.preventDefault();

            // Escape clears focus
            if (key === 'Escape') {
                setFocusPos(null);
                return;
            }

            // Mark as keyboard navigation - will trigger scroll and focus ring
            fromKeyboard.current = true;
            setIsKeyboardNavigating(true);

            // Navigate
            setFocusPos(prev => {
                if (!prev) return { col: 0, row: 0 };

                let { col, row } = prev;
                const currentCol = navItems[col] || [];

                // Down / j
                if (key === 'ArrowDown' || key === 'j') {
                    row = Math.min(row + 1, currentCol.length - 1);
                }
                // Up / k
                else if (key === 'ArrowUp' || key === 'k') {
                    row = Math.max(row - 1, 0);
                }
                // Right / l
                else if (key === 'ArrowRight' || key === 'l') {
                    if (col < navItems.length - 1) {
                        col++;
                        row = Math.min(row, (navItems[col]?.length || 1) - 1);
                    }
                }
                // Left / h
                else if (key === 'ArrowLeft' || key === 'h') {
                    if (col > 0) {
                        col--;
                        row = Math.min(row, (navItems[col]?.length || 1) - 1);
                    }
                }

                return { col, row };
            });
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [navItems, focusPos, onToggleCategory, onToggleApp]);

    /* Scroll focused item into view - only when navigating via keyboard */
    useEffect(() => {
        if (!focusPos || !fromKeyboard.current) return;

        const item = navItems[focusPos.col]?.[focusPos.row];
        if (!item) return;

        // Find visible element among duplicates (mobile/desktop layouts both render same data-nav-id)
        const elements = document.querySelectorAll<HTMLElement>(
            `[data-nav-id="${item.type}:${item.id}"]`
        );
        const el = Array.from(elements).find(e => e.offsetWidth > 0 && e.offsetHeight > 0);

        if (!el) return;

        el.scrollIntoView({
            behavior: 'auto',
            block: 'center',
            inline: 'nearest',
        });
    }, [focusPos, navItems]);

    return {
        focusPos,
        focusedItem,
        clearFocus,
        setFocusByItem,
        isKeyboardNavigating,
    };
}
