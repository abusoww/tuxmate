'use client';

import { memo } from 'react';
import { Check } from 'lucide-react';
import { distros, type DistroId, type AppData } from '@/lib/data';
import { analytics } from '@/lib/analytics';
import { isAurPackage } from '@/lib/aur';
import { useI18n } from '@/hooks/useI18n';
import { AppIcon } from './AppIcon';

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
    'fuchsia': '#d946ef',
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
    const { t, fmt } = useI18n();
    const getUnavailableText = () => {
        const distroName = distros.find(d => d.id === selectedDistro)?.name || '';
        return app.unavailableReason || fmt(t.search.notAvailableIn, { distro: distroName });
    };

    const isAur = selectedDistro === 'arch' && app.targets?.arch && isAurPackage(app.targets.arch);
    const hexColor = COLOR_MAP[color] || COLOR_MAP['gray'];
    const checkboxColor = isAur ? '#1793d1' : hexColor;

    return (
        <div
            data-nav-id={`app:${app.id}`}
            role="checkbox"
            aria-checked={isSelected}
             aria-label={isAvailable ? app.name : `${app.name} (${t.search.notAvailable})`}
            aria-disabled={!isAvailable}
            className={`app-item group w-full flex items-center gap-3 py-2 px-3 outline-none transition-all duration-150
        ${isFocused ? 'border-l-2 shadow-sm' : 'border-l-2 border-transparent'}
        ${!isAvailable ? 'opacity-40 grayscale-[30%]' : 'hover:bg-[color-mix(in_srgb,var(--item-color),transparent_92%)] cursor-pointer active:scale-[0.98]'}`}
            style={{
                transition: 'background-color 0.15s, color 0.5s, transform 0.1s',
                borderColor: isFocused ? hexColor : 'transparent',
                backgroundColor: isFocused ? `color-mix(in srgb, ${hexColor}, transparent 88%)` : undefined,
                '--item-color': hexColor,
            } as React.CSSProperties}
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
            onMouseEnter={(e) => onTooltipEnter(app.description, e)}
            onMouseLeave={() => onTooltipLeave()}
        >
            <div
                className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${!isAvailable ? 'border-dashed opacity-50' : ''}`}
                style={{
                    borderColor: isSelected || isAur ? checkboxColor : 'var(--border-secondary)',
                    backgroundColor: isSelected ? checkboxColor : 'transparent',
                }}
            >
                {isSelected && <Check className="w-3 h-3 text-white check-animate" strokeWidth={3} />}
            </div>
            <AppIcon url={app.iconUrl} name={app.name} />
            <div className="flex-1 flex items-baseline gap-1.5 min-w-0 overflow-hidden">
                <span
                    className={`text-sm font-medium truncate ${!isAvailable ? 'text-[var(--text-muted)]' : isSelected ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}
                    style={{
                        transition: 'color 0.5s',
                        textRendering: 'geometricPrecision',
                        WebkitFontSmoothing: 'antialiased'
                    }}
                >
                    {app.name}
                </span>
                {isAur && (
                    <span className="text-[10px] font-semibold px-1 rounded bg-[#1793d1]/10 text-[#1793d1] shrink-0 leading-none py-0.5">
                        {t.appBadge.aur}
                    </span>
                )}
                {selectedDistro === 'arch' && app.targets?.flatpak && !app.targets?.arch && (
                    <span className="text-[10px] font-semibold px-1 rounded bg-blue-500/10 text-blue-400 shrink-0 leading-none py-0.5">
                        {t.appBadge.flatpak}
                    </span>
                )}
                {isVerified && verificationSource && (
                    <svg
                        className="ml-0.5 w-3.5 h-3.5 shrink-0 opacity-80"
                        viewBox="0 0 24 24"
                        fill={verificationSource === 'flathub' ? '#4A90D9' : '#82BEA0'}
                        aria-label={fmt(t.appBadge.verified, { source: verificationSource === 'flathub' ? t.verification.flathub : t.verification.snap })}
                    >
                        <title>{fmt(t.appBadge.verified, { source: verificationSource === 'flathub' ? t.verification.flathub : t.verification.snap })}</title>
                        <path d="M23 12l-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82 1.89 3.2 3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12m-12.91 4.72l-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z" />
                    </svg>
                )}
            </div>
            {!isAvailable && (
                <div
                    className="relative shrink-0 cursor-help"
                    onMouseEnter={(e) => { e.stopPropagation(); onTooltipEnter(getUnavailableText(), e); }}
                    onMouseLeave={(e) => { e.stopPropagation(); onTooltipLeave(); }}
                >
                    <svg
                        className="w-4 h-4 text-[var(--text-muted)] transition-all duration-300 hover:text-[var(--accent)] hover:rotate-12 hover:scale-110"
                        style={{ color: isFocused ? hexColor : undefined }}
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
