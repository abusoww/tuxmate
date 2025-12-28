'use client';

import { memo } from 'react';
import { Check, Package } from 'lucide-react';
import { distros, type DistroId, type AppData } from '@/lib/data';
import { analytics } from '@/lib/analytics';
import { isAurPackage } from '@/lib/aur';
import { AppIcon } from './AppIcon';

/**
 * AppItem - Individual app checkbox item (memoized for performance)
 * 
 * Features:
 * - Checkbox with selection state
 * - Unavailable state with info icon
 * - Tooltip on hover
 * - Focus state for keyboard navigation
 * - Analytics tracking
 * - Memoized to prevent unnecessary re-renders
 * 
 * @param app - App data object
 * @param isSelected - Whether the app is selected
 * @param isAvailable - Whether the app is available for the selected distro
 * @param isFocused - Whether the item has keyboard focus
 * @param selectedDistro - Currently selected distro ID
 * @param onToggle - Callback when app is toggled
 * @param onTooltipEnter - Callback for tooltip show
 * @param onTooltipLeave - Callback for tooltip hide
 * @param onFocus - Optional callback when item receives focus
 * 
 * @example
 * <AppItem
 *   app={appData}
 *   isSelected={selectedApps.has(appData.id)}
 *   isAvailable={isAppAvailable(appData.id)}
 *   isFocused={focusedId === appData.id}
 *   selectedDistro="ubuntu"
 *   onToggle={() => toggleApp(appData.id)}
 *   onTooltipEnter={showTooltip}
 *   onTooltipLeave={hideTooltip}
 * />
 */

interface AppItemProps {
    app: AppData;
    isSelected: boolean;
    isAvailable: boolean;
    isFocused: boolean;
    selectedDistro: DistroId;
    onToggle: () => void;
    onTooltipEnter: (t: string, e: React.MouseEvent) => void;
    onTooltipLeave: () => void;
    onFocus?: () => void;
}

export const AppItem = memo(function AppItem({
    app,
    isSelected,
    isAvailable,
    isFocused,
    selectedDistro,
    onToggle,
    onTooltipEnter,
    onTooltipLeave,
    onFocus,
}: AppItemProps) {
    // Build unavailable tooltip text
    const getUnavailableText = () => {
        if (app.unavailableReason) return app.unavailableReason;
        const distroName = distros.find(d => d.id === selectedDistro)?.name || '';
        return `Not available in ${distroName} repos`;
    };

    const isAur = selectedDistro === 'arch' && app.targets?.arch && isAurPackage(app.targets.arch);

    return (
        <div
            role="checkbox"
            aria-checked={isSelected}
            aria-label={`${app.name}${!isAvailable ? ' (unavailable)' : ''}`}
            aria-disabled={!isAvailable}
            className={`app-item w-full flex items-center gap-2.5 py-1.5 px-2 rounded-md outline-none transition-all duration-150
        ${isFocused ? 'bg-[var(--bg-focus)]' : ''}
        ${!isAvailable ? 'opacity-40 grayscale-[30%]' : 'hover:bg-[var(--bg-hover)] cursor-pointer'}`}
            style={{ transition: 'background-color 0.15s, color 0.5s' }}
            onClick={(e) => {
                e.stopPropagation();
                onFocus?.();
                if (isAvailable) {
                    const willBeSelected = !isSelected;
                    onToggle();
                    const distroName = distros.find(d => d.id === selectedDistro)?.name || selectedDistro;
                    if (willBeSelected) {
                        analytics.appSelected(app.name, app.category, distroName);
                    } else {
                        analytics.appDeselected(app.name, app.category, distroName);
                    }
                }
            }}
            onMouseEnter={(e) => {
                if (isAvailable) onTooltipEnter(app.description, e);
            }}
            onMouseLeave={() => {
                if (isAvailable) onTooltipLeave();
            }}
        >
            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all duration-150
        ${isAur
                    ? (isSelected ? 'bg-[#1793d1] border-[#1793d1]' : 'border-[#1793d1]/50')
                    : (isSelected ? 'bg-[var(--text-secondary)] border-[var(--text-secondary)]' : 'border-[var(--border-secondary)]')
                }
        ${!isAvailable ? 'border-dashed' : ''}`}>
                {isSelected && <Check className="w-2.5 h-2.5 text-[var(--bg-primary)]" strokeWidth={3} />}
            </div>
            <AppIcon url={app.iconUrl} name={app.name} />
            <div className="flex-1 flex items-baseline gap-1.5 min-w-0 overflow-hidden">
                <span
                    className={`text-sm truncate ${!isAvailable ? 'text-[var(--text-muted)]' : isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
                    style={{
                        transition: 'color 0.5s',
                        textRendering: 'geometricPrecision',
                        WebkitFontSmoothing: 'antialiased'
                    }}
                >
                    {app.name}
                </span>
                {isAur && (
                    <img
                        src="https://api.iconify.design/simple-icons/archlinux.svg?color=%231793d1"
                        className="ml-1.5 w-3 h-3 flex-shrink-0 opacity-80"
                        alt="AUR"
                        title="This is an AUR package"
                    />
                )}
            </div>
            {/* Exclamation mark icon for unavailable apps */}
            {!isAvailable && (
                <div
                    className="relative group flex-shrink-0 cursor-help"
                    onMouseEnter={(e) => { e.stopPropagation(); onTooltipEnter(getUnavailableText(), e); }}
                    onMouseLeave={(e) => { e.stopPropagation(); onTooltipLeave(); }}
                >
                    <svg
                        className="w-4 h-4 text-[var(--text-muted)] hover:text-[var(--accent)] transition-all duration-300 hover:rotate-[360deg] hover:scale-110"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 22c-5.518 0-10-4.482-10-10s4.482-10 10-10 10 4.482 10 10-4.482 10-10 10zm-1-16h2v6h-2zm0 8h2v2h-2z" />
                    </svg>
                </div>
            )}
        </div>
    );
});
