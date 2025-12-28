'use client';

import { useState, useMemo, useCallback, useRef, useLayoutEffect, useEffect } from 'react';
import { X } from 'lucide-react';
import gsap from 'gsap';

// Hooks
import { useLinuxInit } from '@/hooks/useLinuxInit';
import { useDelayedTooltip } from '@/hooks/useDelayedTooltip';
import { useKeyboardNavigation, type NavItem } from '@/hooks/useKeyboardNavigation';

// Data
import { categories, getAppsByCategory } from '@/lib/data';

// Components
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { HowItWorks, GitHubLink, ContributeLink } from '@/components/header';
import { DistroSelector } from '@/components/distro';
import { CategorySection } from '@/components/app';
import { CommandFooter } from '@/components/command';
import { Tooltip, GlobalStyles, LoadingSkeleton } from '@/components/common';


// ============================================================================
// Main Page Component
// ============================================================================

/**
 * Home - Main TuxMate application page
 * 
 * This is the root component that composes all the UI elements:
 * - Header with logo, links, and controls
 * - App grid organized by categories
 * - Command footer with copy/download functionality
 * 
 * State management is handled by the useLinuxInit hook.
 * Keyboard navigation is handled by the useKeyboardNavigation hook.
 */
export default function Home() {
    // ========================================================================
    // State & Hooks
    // ========================================================================

    const { tooltip, show: showTooltip, hide: hideTooltip, onTooltipEnter, onTooltipLeave } = useDelayedTooltip(600);

    const {
        selectedDistro,
        selectedApps,
        setSelectedDistro,
        toggleApp,
        clearAll,
        isAppAvailable,
        generatedCommand,
        selectedCount,
        hasYayInstalled,
        setHasYayInstalled,
        hasAurPackages,
        aurAppNames,
        isHydrated,
        selectedHelper,
        setSelectedHelper
    } = useLinuxInit();

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Handle "/" key to focus search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Skip if already in input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.key === '/') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // ========================================================================
    // Category & Column Layout
    // ========================================================================

    /** All categories with their apps (filtered by search) */
    const allCategoriesWithApps = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        return categories
            .map(cat => {
                const categoryApps = getAppsByCategory(cat);
                // Filter apps if there's a search query (match name or id only)
                const filteredApps = query
                    ? categoryApps.filter(app =>
                        app.name.toLowerCase().includes(query) ||
                        app.id.toLowerCase().includes(query)
                    )
                    : categoryApps;
                return { category: cat, apps: filteredApps };
            })
            .filter(c => c.apps.length > 0);
    }, [searchQuery]);

    /** Number of columns for the app grid layout */
    const COLUMN_COUNT = 5;

    /** Distribute categories across columns for balanced layout */
    const columns = useMemo(() => {
        const cols: Array<typeof allCategoriesWithApps> = Array.from({ length: COLUMN_COUNT }, () => []);
        const heights = Array(COLUMN_COUNT).fill(0);
        allCategoriesWithApps.forEach(catData => {
            const minIdx = heights.indexOf(Math.min(...heights));
            cols[minIdx].push(catData);
            heights[minIdx] += catData.apps.length + 2;
        });
        return cols;
    }, [allCategoriesWithApps]);

    // ========================================================================
    // Category Expansion State
    // ========================================================================

    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set(categories));

    const toggleCategoryExpanded = useCallback((cat: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            next.has(cat) ? next.delete(cat) : next.add(cat);
            return next;
        });
    }, []);

    // ========================================================================
    // Keyboard Navigation
    // ========================================================================

    /** Build navigation items from columns and expanded categories */
    const navItems = useMemo(() => {
        const items: NavItem[][] = [];
        columns.forEach((colCategories) => {
            const colItems: NavItem[] = [];
            colCategories.forEach(({ category, apps: catApps }) => {
                colItems.push({ type: 'category', id: category, category });
                if (expandedCategories.has(category)) {
                    catApps.forEach(app => colItems.push({ type: 'app', id: app.id, category }));
                }
            });
            items.push(colItems);
        });
        return items;
    }, [columns, expandedCategories]);

    const { focusedItem, clearFocus, setFocusByItem } = useKeyboardNavigation(
        navItems,
        toggleCategoryExpanded,
        toggleApp
    );

    // ========================================================================
    // Header Animation
    // ========================================================================

    const headerRef = useRef<HTMLElement>(null);

    useLayoutEffect(() => {
        if (!headerRef.current || !isHydrated) return;

        const header = headerRef.current;
        const title = header.querySelector('.header-animate');
        const controls = header.querySelector('.header-controls');

        // Animate title with clip-path reveal
        gsap.fromTo(title,
            { clipPath: 'inset(0 100% 0 0)' },
            {
                clipPath: 'inset(0 0% 0 0)',
                duration: 0.8,
                ease: 'power2.out',
                delay: 0.1,
                onComplete: () => {
                    if (title) gsap.set(title, { clipPath: 'none' });
                }
            }
        );

        // Animate controls with fade-in
        gsap.fromTo(controls,
            { opacity: 0, y: -10 },
            {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power2.out',
                delay: 0.3
            }
        );
    }, [isHydrated]);

    // ========================================================================
    // Loading State (must be AFTER all hooks)
    // ========================================================================

    // Show loading skeleton until localStorage is hydrated
    if (!isHydrated) {
        return <LoadingSkeleton />;
    }

    // ========================================================================
    // Render
    // ========================================================================

    return (
        <div
            className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative"
            style={{ transition: 'background-color 0.5s, color 0.5s' }}
            onClick={clearFocus}
        >
            <GlobalStyles />
            <Tooltip tooltip={tooltip} onEnter={onTooltipEnter} onLeave={onTooltipLeave} />

            {/* Header */}
            <header ref={headerRef} className="pt-8 sm:pt-12 pb-8 sm:pb-10 px-4 sm:px-6 relative" style={{ zIndex: 1 }}>
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Logo & Title */}
                        <div className="header-animate">
                            <div className="flex items-start gap-4">
                                <img
                                    src="/tuxmate.png"
                                    alt="TuxMate Logo"
                                    className="w-16 h-16 sm:w-[72px] sm:h-[72px] object-contain shrink-0"
                                />
                                <div className="flex flex-col justify-center">
                                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ transition: 'color 0.5s' }}>
                                        TuxMate
                                    </h1>
                                    <p className="text-[10px] sm:text-xs text-[var(--text-muted)] uppercase tracking-widest" style={{ transition: 'color 0.5s' }}>
                                        The Linux Bulk App Installer.
                                    </p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <p className="text-xs text-[var(--text-muted)]" style={{ transition: 'color 0.5s' }}>
                                            Select apps • <span className="hidden sm:inline">Arrow keys + Space</span>
                                        </p>
                                        <span className="text-[var(--text-muted)] opacity-30">|</span>
                                        <HowItWorks />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Header Controls */}
                        <div className="header-controls flex items-center gap-3 sm:gap-4">
                            {/* Links */}
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
            <main className="px-4 sm:px-6 pb-40 relative" style={{ zIndex: 1 }}>
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-4 sm:gap-x-8">
                        {columns.map((columnCategories, colIdx) => {
                            // Calculate starting index for this column (for staggered animation)
                            let globalIdx = 0;
                            for (let c = 0; c < colIdx; c++) {
                                globalIdx += columns[c].length;
                            }

                            // Generate stable key based on column content to ensure proper reconciliation
                            const columnKey = `col-${colIdx}-${columnCategories.map(c => c.category).join('-')}`;

                            return (
                                <div key={columnKey}>
                                    {columnCategories.map(({ category, apps: categoryApps }, catIdx) => (
                                        <CategorySection
                                            key={`${category}-${categoryApps.length}`}
                                            category={category}
                                            categoryApps={categoryApps}
                                            selectedApps={selectedApps}
                                            isAppAvailable={isAppAvailable}
                                            selectedDistro={selectedDistro}
                                            toggleApp={toggleApp}
                                            isExpanded={expandedCategories.has(category)}
                                            onToggleExpanded={() => toggleCategoryExpanded(category)}
                                            focusedId={focusedItem?.id}
                                            focusedType={focusedItem?.type}
                                            onTooltipEnter={showTooltip}
                                            onTooltipLeave={hideTooltip}
                                            categoryIndex={globalIdx + catIdx}
                                            onCategoryFocus={() => setFocusByItem('category', category)}
                                            onAppFocus={(appId) => setFocusByItem('app', appId)}
                                        />
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </main>

            {/* Command Footer */}
            <CommandFooter
                command={generatedCommand}
                selectedCount={selectedCount}
                selectedDistro={selectedDistro}
                selectedApps={selectedApps}
                hasAurPackages={hasAurPackages}
                aurAppNames={aurAppNames}
                hasYayInstalled={hasYayInstalled}
                setHasYayInstalled={setHasYayInstalled}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchInputRef={searchInputRef}
                clearAll={clearAll}
                selectedHelper={selectedHelper}
                setSelectedHelper={setSelectedHelper}
            />
        </div>
    );
}
