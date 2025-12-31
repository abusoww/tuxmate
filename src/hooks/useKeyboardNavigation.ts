'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { type Category } from '@/lib/data';

/**
 * Navigation item for grid-based keyboard navigation
 */
export interface NavItem {
    type: 'category' | 'app';
    id: string;
    category: Category;
}

/**
 * Focus position in the navigation grid
 */
export interface FocusPosition {
    col: number;
    row: number;
}

/**
 * useKeyboardNavigation - Grid-based keyboard navigation for app selection
 * 
 * Features:
 * - Arrow keys (↑↓←→) and vim keys (hjkl) for navigation
 * - Space to toggle selection
 * - Escape to clear focus
 * - Skips input fields
 * 
 * @param navItems - 2D array of navigation items (columns × rows)
 * @param onToggleCategory - Callback when space is pressed on a category
 * @param onToggleApp - Callback when space is pressed on an app
 * 
 * @returns Object with focus state and control functions
 * 
 * @example
 * const { focusedItem, clearFocus, setFocusByItem } = useKeyboardNavigation(
 *   navItems,
 *   (id) => toggleCategoryExpanded(id),
 *   (id) => toggleApp(id)
 * );
 */
export function useKeyboardNavigation(
    navItems: NavItem[][],
    onToggleCategory: (id: string) => void,
    onToggleApp: (id: string) => void
) {
    const [focusPos, setFocusPos] = useState<FocusPosition | null>(null);

    /** Clear focus (e.g., when clicking outside) */
    const clearFocus = useCallback(() => setFocusPos(null), []);

    /** Get the currently focused item */
    const focusedItem = useMemo(() => {
        if (!focusPos) return null;
        return navItems[focusPos.col]?.[focusPos.row] || null;
    }, [navItems, focusPos]);

    /** Set focus position by item type and id */
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

    /* Scroll focused item into view instantly */
    useEffect(() => {
        if (!focusPos) return;

        const item = navItems[focusPos.col]?.[focusPos.row];
        if (!item) return;

        const el = document.querySelector<HTMLElement>(
            `[data-nav-id="${item.type}:${item.id}"]`
        );

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
    };
}
