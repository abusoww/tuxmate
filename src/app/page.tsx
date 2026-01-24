'use client';

import { useState, useMemo, useCallback, useRef, useLayoutEffect, useEffect } from 'react';
import gsap from 'gsap';

// Hooks
import { useLinuxInit } from '@/hooks/useLinuxInit';
import { useTooltip } from '@/hooks/useTooltip';
import { useKeyboardNavigation, type NavItem } from '@/hooks/useKeyboardNavigation';
import { useVerification } from '@/hooks/useVerification';

// Data
import { categories, getAppsByCategory } from '@/lib/data';

// Components
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { HowItWorks, GitHubLink, ContributeLink } from '@/components/header';
import { DistroSelector } from '@/components/distro';
import { CategorySection } from '@/components/app';
import { CommandFooter } from '@/components/command';
import { Tooltip, GlobalStyles, LoadingSkeleton } from '@/components/common';

export default function Home() {

    const { tooltip, show: showTooltip, hide: hideTooltip, tooltipMouseEnter, tooltipMouseLeave, setTooltipRef } = useTooltip();

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
        setSelectedHelper,
        hasUnfreePackages,
        unfreeAppNames,
    } = useLinuxInit();

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Verification status for Flatpak/Snap apps
    const { isVerified, getVerificationSource } = useVerification();

    // Handle "/" key to focus search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Skip if already in input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            // Skip if modifier keys are pressed (prevents conflicts with browser shortcuts)
            if (e.ctrlKey || e.altKey || e.metaKey) return;

            if (e.key === '/') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);


    // Distribute apps into a nice grid
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

    // 5 columns looks good on most screens
    const COLUMN_COUNT = 5;

    // Pack categories into shortest column while preserving order
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

    // Category expansion - all open by default because hiding stuff is annoying
    // ========================================================================

    const [expandedCategories, setExpandedCategories] = useState<Set<string>>(() => new Set(categories));

    const toggleCategoryExpanded = useCallback((cat: string) => {
        setExpandedCategories(prev => {
            const next = new Set(prev);
            if (next.has(cat)) {
                next.delete(cat);
            } else {
                next.add(cat);
            }
            return next;
        });
    }, []);


    // Build nav items for keyboard navigation
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

    const { focusedItem, clearFocus, setFocusByItem, isKeyboardNavigating } = useKeyboardNavigation(
        navItems,
        toggleCategoryExpanded,
        toggleApp
    );

    // Header animation - makes the logo look fancy on first load
    // ========================================================================

    const headerRef = useRef<HTMLElement>(null);

    useLayoutEffect(() => {
        if (!headerRef.current || !isHydrated) return;

        const header = headerRef.current;
        const title = header.querySelector('.header-animate');
        const controls = header.querySelector('.header-controls');

        // Fancy clip-path reveal for the logo
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


    // Don't render until we've loaded from localStorage (avoids flash)

    // Show loading skeleton until localStorage is hydrated
    if (!isHydrated) {
        return <LoadingSkeleton />;
    }

    // Finally, the actual page
    // ========================================================================

    return (
        <div
            className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative"
            style={{ transition: 'background-color 0.5s, color 0.5s' }}
            onClick={clearFocus}
        >
            <GlobalStyles />
            <Tooltip tooltip={tooltip} onMouseEnter={tooltipMouseEnter} onMouseLeave={tooltipMouseLeave} setRef={setTooltipRef} />

            {/* Header */}
            <header ref={headerRef} className="pt-8 sm:pt-12 pb-8 sm:pb-10 px-4 sm:px-6 relative" style={{ zIndex: 1 }}>
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        {/* Logo & Title */}
                        <div className="header-animate">
                            <div className="flex items-center gap-4">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src="/tuxmate.png"
                                    alt="TuxMate Logo"
                                    className="w-16 h-16 sm:w-[72px] sm:h-[72px] object-contain shrink-0"
                                />
                                <div className="flex flex-col justify-center">
                                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ transition: 'color 0.5s' }}>
                                        TuxMate
                                    </h1>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mt-0.5">
                                        <p className="text-xs sm:text-sm text-[var(--text-muted)] tracking-widest uppercase opacity-80" style={{ transition: 'color 0.5s' }}>
                                            The Linux Bulk App Installer.
                                        </p>
                                        <span className="hidden sm:inline text-[var(--text-muted)] opacity-30 text-[10px]">•</span>
                                        <div className="hidden sm:block">
                                            <HowItWorks />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Header Controls */}
                        <div className="header-controls flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                            {/* Left side on mobile: Help + Links */}
                            <div className="flex items-center gap-3 sm:gap-4">
                                {/* Help - mobile only here, desktop is in title area */}
                                <div className="sm:hidden">
                                    <HowItWorks />
                                </div>
                                <GitHubLink />
                                <ContributeLink />
                            </div>

                            {/* Right side: Theme + Distro (with separator on desktop) */}
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
                    {/* Mobile: 2-column grid with balanced distribution */}
                    <div className="grid grid-cols-2 gap-x-4 md:hidden items-start">
                        {(() => {
                            // Pack into 2 columns on mobile
                            const mobileColumns: Array<typeof allCategoriesWithApps> = [[], []];
                            const heights = [0, 0];
                            allCategoriesWithApps.forEach(catData => {
                                const minIdx = heights[0] <= heights[1] ? 0 : 1;
                                mobileColumns[minIdx].push(catData);
                                heights[minIdx] += catData.apps.length + 2;
                            });
                            return mobileColumns.map((columnCategories, colIdx) => (
                                <div key={`mobile-col-${colIdx}`}>
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
                                            focusedId={isKeyboardNavigating ? focusedItem?.id : undefined}
                                            focusedType={isKeyboardNavigating ? focusedItem?.type : undefined}
                                            onTooltipEnter={showTooltip}
                                            onTooltipLeave={hideTooltip}
                                            categoryIndex={catIdx}
                                            onCategoryFocus={() => setFocusByItem('category', category)}
                                            onAppFocus={(appId) => setFocusByItem('app', appId)}
                                            isVerified={isVerified}
                                            getVerificationSource={getVerificationSource}
                                        />
                                    ))}
                                </div>
                            ));
                        })()}
                    </div>

                    {/* Desktop: Grid with Tetris packing */}
                    <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-5 gap-x-8 items-start">
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
                                            focusedId={isKeyboardNavigating ? focusedItem?.id : undefined}
                                            focusedType={isKeyboardNavigating ? focusedItem?.type : undefined}
                                            onTooltipEnter={showTooltip}
                                            onTooltipLeave={hideTooltip}
                                            categoryIndex={globalIdx + catIdx}
                                            onCategoryFocus={() => setFocusByItem('category', category)}
                                            onAppFocus={(appId) => setFocusByItem('app', appId)}
                                            isVerified={isVerified}
                                            getVerificationSource={getVerificationSource}
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
                hasUnfreePackages={hasUnfreePackages}
                unfreeAppNames={unfreeAppNames}
            />
        </div>
    );
}
