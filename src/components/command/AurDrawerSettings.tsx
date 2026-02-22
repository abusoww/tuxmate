'use client';

interface AurDrawerSettingsProps {
    aurAppNames: string[];
    hasYayInstalled: boolean;
    setHasYayInstalled: (value: boolean) => void;
    selectedHelper: 'yay' | 'paru';
    setSelectedHelper: (helper: 'yay' | 'paru') => void;
}

// AUR package settings panel.
export function AurDrawerSettings({
    aurAppNames,
    hasYayInstalled,
    setHasYayInstalled,
    selectedHelper,
    setSelectedHelper,
    distroColor,
}: AurDrawerSettingsProps & { distroColor: string }) {
    return (
        <div className="mb-4 rounded-lg bg-[var(--bg-secondary)]/30 border border-[var(--border-primary)]/20 overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--border-primary)]/10 flex">
                <span className="text-xs font-medium text-[var(--text-secondary)] whitespace-nowrap mr-2">AUR Packages:</span>
                <span className="text-xs text-[var(--text-muted)] truncate">{aurAppNames.join(', ')}</span>
            </div>

            <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                <div className="flex flex-col gap-2">
                    <span className="text-[var(--text-secondary)] font-medium">AUR Helper</span>
                    <div className="flex w-full bg-[var(--bg-tertiary)]/40 rounded-md border border-[var(--border-primary)]/30 p-1 h-10">
                        <button
                            onClick={() => setSelectedHelper('yay')}
                            className={`flex-1 rounded-sm font-medium transition-all ${selectedHelper === 'yay' ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                            style={{ backgroundColor: selectedHelper === 'yay' ? distroColor : 'transparent', color: selectedHelper === 'yay' ? '#000' : undefined }}
                        >
                            yay
                        </button>
                        <button
                            onClick={() => setSelectedHelper('paru')}
                            className={`flex-1 rounded-sm font-medium transition-all ${selectedHelper === 'paru' ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                            style={{ backgroundColor: selectedHelper === 'paru' ? distroColor : 'transparent', color: selectedHelper === 'paru' ? '#000' : undefined }}
                        >
                            paru
                        </button>
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <span className="text-[var(--text-secondary)] font-medium">Install helper?</span>
                    <div className="flex w-full bg-[var(--bg-tertiary)]/40 rounded-md border border-[var(--border-primary)]/30 p-1 h-10">
                        <button
                            onClick={() => setHasYayInstalled(true)}
                            className={`flex-1 rounded-sm font-medium transition-all ${hasYayInstalled ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                            style={{ backgroundColor: hasYayInstalled ? distroColor : 'transparent', color: hasYayInstalled ? '#000' : undefined }}
                        >
                            No
                        </button>
                        <button
                            onClick={() => setHasYayInstalled(false)}
                            className={`flex-1 rounded-sm font-medium transition-all ${!hasYayInstalled ? 'bg-[var(--bg-secondary)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                            style={{ backgroundColor: !hasYayInstalled ? distroColor : 'transparent', color: !hasYayInstalled ? '#000' : undefined }}
                        >
                            Yes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
