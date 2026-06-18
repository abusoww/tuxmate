'use client';

import { useI18n } from '@/hooks/useI18n';

interface AurDrawerSettingsProps {
    aurAppNames: string[];
    hasYayInstalled: boolean;
    setHasYayInstalled: (value: boolean) => void;
    selectedHelper: 'yay' | 'paru';
    setSelectedHelper: (helper: 'yay' | 'paru') => void;
}

// AUR settings inside the command drawer
export function AurDrawerSettings({
    aurAppNames,
    hasYayInstalled,
    setHasYayInstalled,
    selectedHelper,
    setSelectedHelper,
}: AurDrawerSettingsProps) {
    const { t, dir } = useI18n();
    const isRtl = dir === 'rtl';
    return (
        <div className="mb-4 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-primary)]/40 overflow-hidden">
            {/* Header with all apps listed */}
            <div className="px-4 py-3 border-b border-[var(--border-primary)]/30">
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    <span className="font-medium text-[var(--text-primary)]">AUR packages: </span>
                    {aurAppNames.join(', ')}
                </p>
            </div>

            {/* Controls with animated buttons */}
            <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-4 text-xs">
                {/* Helper selection */}
                <div className="flex items-center gap-3">
                    <span className="text-[var(--text-secondary)] font-medium">AUR helper:</span>
                    <div className="flex bg-[var(--bg-secondary)] rounded-lg p-1 border border-[var(--border-primary)]/30">
                        <button
                            onClick={() => setSelectedHelper('paru')}
                            className={`relative px-3 py-1.5 rounded-md font-medium transition-[background-color,color,transform] duration-200 ease-out ${selectedHelper === 'paru'
                                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm'
                                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                }`}
                            style={{
                                transform: selectedHelper === 'paru' ? 'scale(1)' : 'scale(0.98)',
                            }}
                        >
                            paru <span className="opacity-60 font-normal">(Rust, recommended)</span>
                        </button>
                        <button
                            onClick={() => setSelectedHelper('yay')}
                            className={`relative px-3 py-1.5 rounded-md font-medium transition-[background-color,color,transform] duration-200 ease-out ${selectedHelper === 'yay'
                                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm'
                                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                }`}
                            style={{
                                transform: selectedHelper === 'yay' ? 'scale(1)' : 'scale(0.98)',
                            }}
                        >
                            yay <span className="opacity-60 font-normal">(Go)</span>
                        </button>
                    </div>
                </div>

                {/* Divider */}
                <div className="w-px h-5 bg-[var(--border-primary)]/40 hidden sm:block" />

                {/* Installation mode */}
                <div className="flex items-center gap-3">
                    <span className="text-[var(--text-secondary)] font-medium">Already installed?</span>
                    <div className="flex bg-[var(--bg-secondary)] rounded-lg p-1 border border-[var(--border-primary)]/30">
                        <button
                            onClick={() => setHasYayInstalled(true)}
                            className={`relative px-3 py-1.5 rounded-md font-medium transition-[background-color,color,transform] duration-200 ease-out ${hasYayInstalled
                                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm'
                                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                }`}
                            style={{
                                transform: hasYayInstalled ? 'scale(1)' : 'scale(0.98)',
                            }}
                        >
                            Yes, use it
                        </button>
                        <button
                            onClick={() => setHasYayInstalled(false)}
                            className={`relative px-3 py-1.5 rounded-md font-medium transition-[background-color,color,transform] duration-200 ease-out ${!hasYayInstalled
                                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm'
                                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                }`}
                            style={{
                                transform: !hasYayInstalled ? 'scale(1)' : 'scale(0.98)',
                            }}
                        >
                            No, install it
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
