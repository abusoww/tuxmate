'use client';

import { memo } from 'react';
import { Check } from 'lucide-react';
import { distros, type DistroId, type AppData } from '@/lib/data';
import { isAurPackage } from '@/lib/aur';
import { AppIcon } from './AppIcon';
// import { analytics } from '@/lib/analytics'; // Uncomment to enable app selection tracking

/**
 * Individual app row in the category list.
 * Memoized because we render hundreds of these and React was having a moment.
 * Handles selection state, availability indicators, AUR badges, and tooltips.
 */

// Tailwind colors as hex - because CSS variables don't work in inline styles
const COLOR_MAP: Record<string, string> = {
    'orange': '#f97316',
    'blue': '#3b82f6',
    'emerald': '#10b981',
    'sky': '#0ea5e9',
    'yellow': '#eab308',
    'slate': '#64748b',
    'zinc': '#71717a',
    'rose': '#f43f5e',
    'purple': '#a855f7',
    'red': '#ef4444',
    'indigo': '#6366f1',
    'cyan': '#06b6d4',
    'green': '#22c55e',
    'teal': '#14b8a6',
    'gray': '#6b7280',
};

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
    color?: string;
    // Flatpak/Snap verification status
    isVerified?: boolean;
    verificationSource?: 'flathub' | 'snap' | null;
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
    color = 'gray',
    isVerified = false,
    verificationSource = null,
}: AppItemProps) {
    // Why isn't this app available? Tell the user.
    const getUnavailableText = () => {
        const distroName = distros.find(d => d.id === selectedDistro)?.name || '';
        return app.unavailableReason || `Not available in ${distroName} repos`;
    };

    // Special styling for AUR packages (Arch users love their badges)
    const isAur = selectedDistro === 'arch' && app.targets?.arch && isAurPackage(app.targets.arch);

    // AUR gets its special Arch blue, everything else uses category color
    const hexColor = COLOR_MAP[color] || COLOR_MAP['gray'];
    const checkboxColor = isAur ? '#1793d1' : hexColor;

    return (
        <div
            data-nav-id={`app:${app.id}`}
            role="checkbox"
            aria-checked={isSelected}
            aria-label={`${app.name}${!isAvailable ? ' (unavailable)' : ''}`}
            aria-disabled={!isAvailable}
            className={`app-item group w-full flex items-center gap-2.5 py-1.5 px-2 outline-none transition-all duration-150
        ${isFocused ? 'bg-[var(--bg-secondary)] border-l-2 shadow-sm' : 'border-l-2 border-transparent'}
        ${!isAvailable
                    ? 'opacity-40 grayscale-[30%]'
                    : 'hover:bg-[color-mix(in_srgb,var(--item-color),transparent_90%)] cursor-pointer'
                }`}
            style={{
                transition: 'background-color 0.15s, color 0.5s',
                borderColor: isFocused ? hexColor : 'transparent',
                backgroundColor: isFocused ? `color-mix(in srgb, ${hexColor}, transparent 85%)` : undefined, // Stronger tint on focus (15% opacity)
                '--item-color': hexColor,
            } as React.CSSProperties}
            onClick={(e) => {
                e.stopPropagation();
                onFocus?.();
                if (isAvailable) {
                    onToggle();
                    // Umami tracking disabled to save quota
                    // if (isSelected) {
                    //     analytics.appDeselected(app.name, app.category || '', selectedDistro);
                    // } else {
                    //     analytics.appSelected(app.name, app.category || '', selectedDistro);
                    // }
                }
            }}
        >
            <div
                className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors duration-150 ${!isAvailable ? 'border-dashed' : ''}`}
                style={{
                    borderColor: isSelected || isAur ? checkboxColor : 'var(--border-secondary)',
                    backgroundColor: isSelected ? checkboxColor : 'transparent',
                }}
            >
                {isSelected && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
            </div>
            <AppIcon url={app.iconUrl} name={app.name} />
            <div className="flex-1 flex items-baseline gap-1.5 min-w-0 overflow-hidden">
                <span
                    className={`truncate cursor-help ${!isAvailable ? 'text-[var(--text-muted)]' : isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
                    style={{
                        fontFamily: 'var(--font-open-sans), sans-serif',
                        fontSize: '16px',
                        transition: 'color 0.5s',
                        textRendering: 'geometricPrecision',
                        WebkitFontSmoothing: 'antialiased'
                    }}
                    onMouseEnter={(e) => {
                        e.stopPropagation();
                        onTooltipEnter(app.description, e);
                    }}
                    onMouseLeave={(e) => {
                        e.stopPropagation();
                        onTooltipLeave();
                    }}
                >
                    {app.name}
                </span>
                {isAur && (
                    <svg
                        className="ml-1.5 w-3 h-3 flex-shrink-0 opacity-80"
                        viewBox="0 0 24 24"
                        fill="#1793d1"
                        aria-label="AUR package"
                    >
                        <title>This is an AUR package</title>
                        <path d="M12 0c-.39 0-.77.126-1.11.365a2.22 2.22 0 0 0-.82 1.056L0 24h4.15l2.067-5.58h11.666L19.95 24h4.05L13.91 1.42A2.24 2.24 0 0 0 12 0zm0 4.542l5.77 15.548H6.23l5.77-15.548z" />
                    </svg>
                )}
                {isVerified && verificationSource && (
                    <svg
                        className="ml-1 w-3.5 h-3.5 flex-shrink-0 opacity-90"
                        viewBox="0 0 24 24"
                        fill={verificationSource === 'flathub' ? '#4A90D9' : '#82BEA0'}
                        aria-label={verificationSource === 'flathub' ? 'Verified on Flathub' : 'Verified publisher on Snap Store'}
                    >
                        <title>{verificationSource === 'flathub' ? 'Verified on Flathub' : 'Verified publisher on Snap Store'}</title>
                        <path d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82 1.89 3.2 3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12m-12.91 4.72l-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z" />
                    </svg>
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
                        className="w-4 h-4 text-[var(--text-muted)] transition-[color,transform] duration-300 hover:rotate-[360deg] hover:scale-110"
                        style={{ color: isFocused ? hexColor : undefined }} // Use category color on hover/focus
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
