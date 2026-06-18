'use client';

import { useState, useMemo, useCallback, useRef, useLayoutEffect, useEffect } from 'react';
import { X } from 'lucide-react';
import gsap from 'gsap';

// Hooks
import { useLinuxInit } from '@/hooks/useLinuxInit';
import { useDelayedTooltip } from '@/hooks/useDelayedTooltip';
import { useKeyboardNavigation, type NavItem } from '@/hooks/useKeyboardNavigation';
import { useVerification } from '@/hooks/useVerification';
import { useI18n } from '@/hooks/useI18n';

// Data
import { categories, getAppsByCategory, getNixPackages, hasNixPackages } from '@/lib/data';

// Components
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { HowItWorks, GitHubLink, ContributeLink } from '@/components/header';
import { DistroSelector } from '@/components/distro';
import { CategorySection } from '@/components/app';
import { CommandFooter } from '@/components/command';
import { Tooltip, GlobalStyles, LoadingSkeleton } from '@/components/common';
import { Sidebar } from '@/components/sidebar';
import { LocaleToggle } from '@/components/i18n';
import LogoBg from '@/components/app/LogoBg';

export default function Home() {
    const { t, fmt, dir } = useI18n();
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
        setSelectedHelper,
        hasUnfreePackages,
        unfreeAppNames,
        hasFlatpakPackages,
        flatpakAppNames,
    } = useLinuxInit();

    const { isVerified, getVerificationSource } = useVerification();

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Handle "/" key to focus search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.ctrlKey || e.altKey || e.metaKey) return;

            if (e.key === '/') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Active shortcut visual feedback
    const [activeShortcut, setActiveShortcut] = useState<string | null>(null);

    // Distribute apps into a nice grid
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

    const COLUMN_COUNT = 5;

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
            next.has(cat) ? next.delete(cat) : next.add(cat);
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

    const { focusedItem, clearFocus, setFocusByItem } = useKeyboardNavigation(
        navItems,
        toggleCategoryExpanded,
        toggleApp
    );

    // Header Animation
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

    // Nix packages
    const nixPackages = useMemo(() => getNixPackages(selectedApps), [selectedApps]);
    const showNixGenerator = useMemo(() => hasNixPackages(selectedApps), [selectedApps]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (
                e.target instanceof HTMLInputElement ||
                e.target instanceof HTMLTextAreaElement ||
                e.target instanceof HTMLSelectElement
            ) {
                return;
            }

            if (e.ctrlKey || e.altKey || e.metaKey) return;

            setActiveShortcut(e.key);
            setTimeout(() => setActiveShortcut(null), 200);
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Drawer state
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [drawerClosing, setDrawerClosing] = useState(false);

    const openDrawer = useCallback(() => setDrawerOpen(true), []);
    const closeDrawer = useCallback(() => {
        setDrawerClosing(true);
        setTimeout(() => {
            setDrawerOpen(false);
            setDrawerClosing(false);
        }, 250);
    }, []);

    useEffect(() => {
        if (!drawerOpen) return;
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeDrawer();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [drawerOpen, closeDrawer]);

    const isRtl = dir === 'rtl';

    if (!isHydrated) {
        return <LoadingSkeleton />;
    }

    const distroDisplayName = selectedDistro === 'arch' ? t.distro.parch : t.distro.flatpak;
    const totalResults = allCategoriesWithApps.reduce((sum, c) => sum + c.apps.length, 0);
    const resultLabel = totalResults === 1
        ? fmt(t.search.results, { count: totalResults })
        : fmt(t.search.results_plural, { count: totalResults });

    return (
        <div
            className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] relative"
            style={{ transition: 'background-color 0.5s, color 0.5s' }}
            onClick={clearFocus}
        >
            <LogoBg />
            <GlobalStyles />
            <Tooltip tooltip={tooltip} onEnter={onTooltipEnter} onLeave={onTooltipLeave} />

            <Sidebar
                selectedDistro={selectedDistro}
                onDistroSelect={(id) => setSelectedDistro(id)}
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
                hasFlatpakPackages={hasFlatpakPackages}
                flatpakAppNames={flatpakAppNames}
                onOpenDrawer={openDrawer}
                activeShortcut={activeShortcut}
            />

            {/* Header - mobile only */}
            <header
                ref={headerRef}
                className={`pt-6 sm:pt-10 pb-6 sm:pb-8 px-4 sm:px-6 relative lg:hidden ${isRtl ? 'text-right' : ''}`}
                style={{ zIndex: 1 }}
            >
                <div className="max-w-7xl mx-auto">
                    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${isRtl ? 'sm:flex-row-reverse' : ''}`}>
                        {/* Logo & Title */}
                        <div className="header-animate">
                            <div className={`flex items-start gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <img
                                    src="/tuxmate.png"
                                    alt={t.app.title}
                                    className="w-14 h-14 sm:w-[64px] sm:h-[64px] object-contain shrink-0"
                                />
                                <div className={`flex flex-col justify-center ${isRtl ? 'items-end' : ''}`}>
                                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight" style={{ transition: 'color 0.5s' }}>
                                        {t.app.title}
                                    </h1>
                                    <p className="text-[10px] sm:text-xs text-[var(--text-muted)] uppercase tracking-widest" style={{ transition: 'color 0.5s' }}>
                                        {t.app.tagline}
                                    </p>
                                    <div className={`flex items-center gap-3 mt-1.5 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                        <p className="text-xs text-[var(--text-muted)]" style={{ transition: 'color 0.5s' }}>
                                            {t.app.subtitle}
                                        </p>
                                        <span className="text-[var(--text-muted)] opacity-30">|</span>
                                        <HowItWorks />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Header Controls */}
                        <div className={`header-controls flex items-center gap-3 sm:gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <div className={`flex items-center gap-3 sm:gap-4 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <GitHubLink href="https://github.com/parchlinuxb/tuxmate" label={t.flags.parchRepo} />
                                <GitHubLink label={t.flags.github} />
                                <ContributeLink />
                                {selectedCount > 0 && (
                                    <>
                                        <span className="text-[var(--text-muted)] opacity-30 hidden sm:inline">·</span>
                                        <button
                                            onClick={clearAll}
                                            className="group flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-rose-500 transition-colors duration-300"
                                        >
                                            <X className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
                                            <span className="hidden sm:inline relative">
                                                {t.sidebar.clearAll} ({selectedCount})
                                                <span className="absolute bottom-0 left-0 w-0 h-px bg-rose-400 transition-[width] duration-300 group-hover:w-full" />
                                            </span>
                                        </button>
                                    </>
                                )}
                            </div>

                            <div className={`flex items-center gap-2 border-l border-[var(--border-primary)] ${isRtl ? 'pr-2 sm:pr-3 border-r-0 border-l' : 'pl-2 sm:pl-3 border-l'}`}>
                                <ThemeToggle />
                                <LocaleToggle />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* App Grid */}
            <main className="px-4 sm:px-6 pb-44 relative main-with-sidebar" style={{ zIndex: 1 }}>
                <div className="max-w-7xl mx-auto">
                    {searchQuery && (
                        <div className={`mb-4 flex items-center gap-2 text-xs text-[var(--text-muted)] ${isRtl ? 'flex-row-reverse' : ''}`}>
                            <span className="px-2 py-1 rounded-md bg-[var(--bg-tertiary)]/50 border border-[var(--border-primary)]/30">
                                {t.search.searching}: <strong className="text-[var(--text-secondary)]">&ldquo;{searchQuery}&rdquo;</strong>
                            </span>
                            <span className="text-[var(--text-muted)]/60">
                                &mdash; {resultLabel}
                            </span>
                            <button
                                onClick={() => { setSearchQuery(''); searchInputRef.current?.focus(); }}
                                className={`px-2 py-1 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors ${isRtl ? 'mr-auto' : 'ml-auto'}`}
                            >
                                {t.search.clear}
                            </button>
                        </div>
                    )}
                    <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 sm:gap-x-8">
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
                                            localizedCategory={t.category[category] || category}
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
                nixPackages={nixPackages}
                showNixGenerator={showNixGenerator}
                drawerOpen={drawerOpen}
                drawerClosing={drawerClosing}
                onOpenDrawer={openDrawer}
                onCloseDrawer={closeDrawer}
            />
        </div>
    );
}
