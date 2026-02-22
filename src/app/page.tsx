'use client';

import { useState, useMemo, useCallback, useRef, useLayoutEffect, useEffect } from 'react';
import gsap from 'gsap';

import { useLinuxInit } from '@/hooks/useLinuxInit';
import { useTooltip } from '@/hooks/useTooltip';
import { useKeyboardNavigation, type NavItem } from '@/hooks/useKeyboardNavigation';
import { useVerification } from '@/hooks/useVerification';
import { categories, getAppsByCategory } from '@/lib/data';

import { ThemeToggle } from '@/components/ui/theme-toggle';
import { HowItWorks, GitHubLink, ContributeLink } from '@/components/header';
import { DistroSelector } from '@/components/distro';
import { CategorySection } from '@/components/app';
import { CommandFooter } from '@/components/command';
import { Tooltip, GlobalStyles, LoadingSkeleton } from '@/components/common';
import { Sidebar } from '@/components/sidebar';

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

    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerClosing, setDrawerClosing] = useState(false);

    const closeDrawer = useCallback(() => {
        setDrawerClosing(true);
        setTimeout(() => {
            setDrawerOpen(false);
            setDrawerClosing(false);
        }, 250);
    }, []);

    const openDrawer = useCallback(() => {
        if (selectedCount > 0) setDrawerOpen(true);
    }, [selectedCount]);

    const [activeShortcut, setActiveShortcut] = useState<string | null>(null);

    const toggleThemeWithFlash = useCallback(() => {
        document.body.classList.add('theme-flash');
        setTimeout(() => document.body.classList.remove('theme-flash'), 150);
        const themeBtn = document.querySelector('[aria-label="Toggle theme"]') as HTMLButtonElement;
        if (themeBtn) themeBtn.click();
    }, []);

    const { isVerified, getVerificationSource } = useVerification();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;

            if (e.ctrlKey || e.altKey || e.metaKey) return;

            if (e.key === '/') {
                e.preventDefault();
                const inputs = document.querySelectorAll<HTMLInputElement>('input[placeholder="Search apps..."]');
                const visibleInput = Array.from(inputs).find(input => input.offsetParent !== null);
                if (visibleInput) visibleInput.focus();
                return;
            }

            const alwaysEnabled = ['t', 'c', '?'];
            if (selectedCount === 0 && !alwaysEnabled.includes(e.key)) return;

            switch (e.key) {
                case 'y':
                    setActiveShortcut('y');
                    setTimeout(() => setActiveShortcut(null), 150);
                    const copyBtns = document.querySelectorAll<HTMLButtonElement>('[data-action="copy"]');
                    const visibleCopyBtn = Array.from(copyBtns).find(b => b.offsetParent !== null);
                    if (visibleCopyBtn) visibleCopyBtn.click();
                    break;
                case 'd':
                    setActiveShortcut('d');
                    setTimeout(() => setActiveShortcut(null), 150);
                    const dlBtns = document.querySelectorAll<HTMLButtonElement>('[data-action="download"]');
                    const visibleDlBtn = Array.from(dlBtns).find(b => b.offsetParent !== null);
                    if (visibleDlBtn) visibleDlBtn.click();
                    break;
                case 't':
                    setActiveShortcut('t');
                    setTimeout(() => setActiveShortcut(null), 150);
                    toggleThemeWithFlash();
                    break;
                case 'c':
                    setActiveShortcut('c');
                    setTimeout(() => setActiveShortcut(null), 150);
                    clearAll();
                    break;
                case '1':
                    if (hasAurPackages) setSelectedHelper('yay');
                    break;
                case '2':
                    if (hasAurPackages) setSelectedHelper('paru');
                    break;
                case 'Tab':
                    e.preventDefault();
                    if (selectedCount > 0) {
                        if (drawerOpen) {
                            closeDrawer();
                        } else {
                            openDrawer();
                        }
                    }
                    break;
            }
        };

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedCount, clearAll, hasAurPackages, setSelectedHelper, drawerOpen, closeDrawer, openDrawer, toggleThemeWithFlash]);

    const allCategoriesWithApps = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();
        return categories
            .map(cat => {
                const categoryApps = getAppsByCategory(cat);
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

    const COLUMN_COUNT = 4;

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

    const headerRef = useRef<HTMLElement>(null);

    useLayoutEffect(() => {
        if (!headerRef.current || !isHydrated) return;

        const header = headerRef.current;
        const title = header.querySelector('.header-animate');
        const controls = header.querySelector('.header-controls');

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

    if (!isHydrated) {
        return <LoadingSkeleton />;
    }

    return (
        <div
            className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative"
            style={{ transition: 'background-color 0.5s, color 0.5s' }}
            onClick={clearFocus}
        >
            <GlobalStyles />
            <Tooltip tooltip={tooltip} onMouseEnter={tooltipMouseEnter} onMouseLeave={tooltipMouseLeave} setRef={setTooltipRef} />

            <Sidebar
                selectedDistro={selectedDistro}
                onDistroSelect={setSelectedDistro}
                selectedApps={selectedApps}
                selectedCount={selectedCount}
                clearAll={clearAll}
                command={generatedCommand}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                searchInputRef={searchInputRef}
                hasAurPackages={hasAurPackages}
                aurAppNames={aurAppNames}
                selectedHelper={selectedHelper}
                setSelectedHelper={setSelectedHelper}
                hasUnfreePackages={hasUnfreePackages}
                unfreeAppNames={unfreeAppNames}
                onOpenDrawer={openDrawer}
            />

            <header ref={headerRef} className="lg:hidden pt-8 sm:pt-12 pb-8 sm:pb-10 px-4 sm:px-6 relative" style={{ zIndex: 1 }}>
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="header-animate">
                            <div className="flex items-center gap-4">
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

                        <div className="header-controls flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                            {/* Left side on mobile: Help + Links */}
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div className="sm:hidden">
                                    <HowItWorks />
                                </div>
                                <GitHubLink />
                                <ContributeLink />
                            </div>

                            <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-[var(--border-primary)]">
                                <ThemeToggle />
                                <DistroSelector selectedDistro={selectedDistro} onSelect={setSelectedDistro} />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="main-with-sidebar px-4 sm:px-6 pb-40 relative" style={{ zIndex: 1 }}>
                <div className="max-w-7xl mx-auto lg:pt-8">
                    <div className="grid grid-cols-2 gap-x-4 lg:hidden items-start">
                        {(() => {
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

                    <div className="hidden lg:grid lg:grid-cols-3 xl:grid-cols-4 gap-x-8 items-start">
                        {columns.map((columnCategories, colIdx) => {
                            let globalIdx = 0;
                            for (let c = 0; c < colIdx; c++) {
                                globalIdx += columns[c].length;
                            }

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
                drawerOpen={drawerOpen}
                drawerClosing={drawerClosing}
                onDrawerOpen={() => setDrawerOpen(true)}
                onDrawerClose={closeDrawer}
                activeShortcut={activeShortcut}
            />
        </div>
    );
}
