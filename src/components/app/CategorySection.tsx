'use client';

import { memo, useRef, useLayoutEffect, useEffect } from 'react';
import gsap from 'gsap';
import { type DistroId, type AppData, type Category } from '@/lib/data';
import { analytics } from '@/lib/analytics';
import { CategoryHeader } from './CategoryHeader';
import { AppItem } from './AppItem';

/**
 * A collapsible category section containing a list of apps.
 * Handles its own GSAP animations because CSS transitions just weren't cutting it.
 * Memoized to hell and back because React was re-rendering everything.
 */
interface CategorySectionProps {
    category: Category;
    categoryApps: AppData[];
    selectedApps: Set<string>;
    isAppAvailable: (id: string) => boolean;
    selectedDistro: DistroId;
    toggleApp: (id: string) => void;
    isExpanded: boolean;
    onToggleExpanded: () => void;
    focusedId: string | undefined;
    focusedType: 'category' | 'app' | undefined;
    onTooltipEnter: (t: string, e: React.MouseEvent) => void;
    onTooltipLeave: () => void;
    categoryIndex: number;
    onCategoryFocus?: () => void;
    onAppFocus?: (appId: string) => void;
    // Flatpak/Snap verification status
    isVerified?: (distro: DistroId, packageName: string) => boolean;
    getVerificationSource?: (distro: DistroId, packageName: string) => 'flathub' | 'snap' | null;
}

/**
 * Color palette for categories. Vibrant ones go to user-facing stuff,
 * boring grays go to developer tools because we're used to suffering.
 */
const categoryColors: Record<Category, string> = {
    'Web Browsers': 'orange',
    'Communication': 'blue',
    'Media': 'yellow',
    'Gaming': 'purple',
    'Office': 'indigo',
    'Creative': 'cyan',
    'System': 'red',
    'File Sharing': 'teal',
    'Security': 'green',
    'VPN & Network': 'emerald',
    'Dev: Editors': 'sky',
    'Dev: Languages': 'rose',
    'Dev: Tools': 'slate',
    'Terminal': 'zinc',
    'CLI Tools': 'gray'
};

function CategorySectionComponent({
    category,
    categoryApps,
    selectedApps,
    isAppAvailable,
    selectedDistro,
    toggleApp,
    isExpanded,
    onToggleExpanded,
    focusedId,
    focusedType,
    onTooltipEnter,
    onTooltipLeave,
    categoryIndex,
    onCategoryFocus,
    onAppFocus,
    isVerified,
    getVerificationSource,
}: CategorySectionProps) {
    const selectedInCategory = categoryApps.filter(a => selectedApps.has(a.id)).length;
    const isCategoryFocused = focusedType === 'category' && focusedId === category;
    const sectionRef = useRef<HTMLDivElement>(null);
    const hasAnimated = useRef(false);
    const prevAppCount = useRef(categoryApps.length);

    // Get color for this category
    const color = categoryColors[category] || 'gray';

    // Initial entrance animation
    useLayoutEffect(() => {
        if (!sectionRef.current || hasAnimated.current) return;
        hasAnimated.current = true;

        const section = sectionRef.current;
        const header = section.querySelector('.category-header');
        const items = section.querySelectorAll('.app-item');

        // Use requestAnimationFrame for smoother initial setup
        requestAnimationFrame(() => {
            // Initial state with GPU-accelerated transforms
            gsap.set(header, { clipPath: 'inset(0 100% 0 0)' });
            gsap.set(items, { y: -15, opacity: 0, force3D: true });

            // Staggered delay based on category index (reduced for faster feel)
            const delay = categoryIndex * 0.05;

            // Animate header with clip-path reveal
            gsap.to(header, {
                clipPath: 'inset(0 0% 0 0)',
                duration: 0.6,
                ease: 'power2.out',
                delay: delay + 0.05
            });

            // Animate items with GPU-accelerated transforms
            gsap.to(items, {
                y: 0,
                opacity: 1,
                duration: 0.5,
                ease: 'power2.out',
                delay: delay + 0.1,
                force3D: true
            });
        });
    }, [categoryIndex]);

    // When app count changes (after search clears), ensure all items are visible
    useEffect(() => {
        if (categoryApps.length !== prevAppCount.current && sectionRef.current) {
            const items = sectionRef.current.querySelectorAll('.app-item');
            // Reset any hidden items to visible
            gsap.set(items, { y: 0, opacity: 1, clearProps: 'all' });
        }
        prevAppCount.current = categoryApps.length;
    }, [categoryApps.length]);

    return (
        <div ref={sectionRef} className="mb-3 md:mb-5 category-section">
            <CategoryHeader
                category={category}
                isExpanded={isExpanded}
                isFocused={isCategoryFocused}
                onToggle={() => {
                    const willExpand = !isExpanded;
                    onToggleExpanded();
                    if (willExpand) {
                        analytics.categoryExpanded(category);
                    } else {
                        analytics.categoryCollapsed(category);
                    }
                }}
                selectedCount={selectedInCategory}
                onFocus={onCategoryFocus}
                color={color}
            />
            <div
                className={`overflow-hidden transition-[max-height,opacity] duration-500 ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
                style={{ transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            >
                {categoryApps.map((app) => (
                    <AppItem
                        key={app.id}
                        app={app}
                        isSelected={selectedApps.has(app.id)}
                        isAvailable={isAppAvailable(app.id)}
                        isFocused={focusedType === 'app' && focusedId === app.id}
                        selectedDistro={selectedDistro}
                        onToggle={() => toggleApp(app.id)}
                        onTooltipEnter={onTooltipEnter}
                        onTooltipLeave={onTooltipLeave}
                        onFocus={() => onAppFocus?.(app.id)}
                        color={color}
                        isVerified={
                            (selectedDistro === 'flatpak' || selectedDistro === 'snap') &&
                            isVerified?.(selectedDistro, app.targets?.[selectedDistro] || '') || false
                        }
                        verificationSource={
                            (selectedDistro === 'flatpak' || selectedDistro === 'snap')
                                ? getVerificationSource?.(selectedDistro, app.targets?.[selectedDistro] || '') || null
                                : null
                        }
                    />
                ))}
            </div>
        </div>
    );
}

/**
 * Custom memo comparison because React's shallow compare was killing perf.
 * This is the kind of thing that makes you question your career choices.
 */
export const CategorySection = memo(CategorySectionComponent, (prevProps, nextProps) => {
    // Always re-render if app count changes
    if (prevProps.categoryApps.length !== nextProps.categoryApps.length) return false;

    // Check if app IDs are the same
    const prevIds = prevProps.categoryApps.map(a => a.id).join(',');
    const nextIds = nextProps.categoryApps.map(a => a.id).join(',');
    if (prevIds !== nextIds) return false;

    // Check other important props
    if (prevProps.category !== nextProps.category) return false;
    if (prevProps.isExpanded !== nextProps.isExpanded) return false;
    if (prevProps.selectedDistro !== nextProps.selectedDistro) return false;
    if (prevProps.focusedId !== nextProps.focusedId) return false;
    if (prevProps.focusedType !== nextProps.focusedType) return false;
    if (prevProps.categoryIndex !== nextProps.categoryIndex) return false;

    // Check if selection state changed for any app in this category
    for (const app of nextProps.categoryApps) {
        if (prevProps.selectedApps.has(app.id) !== nextProps.selectedApps.has(app.id)) {
            return false;
        }
    }

    return true;
});
