'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { distros, apps, type DistroId } from '@/lib/data';
import { isAurPackage } from '@/lib/aur';
import { isUnfreePackage } from '@/lib/nixUnfree';

// Re-export for backwards compatibility
export { isAurPackage, AUR_PATTERNS, KNOWN_AUR_PACKAGES } from '@/lib/aur';

// Everything the app needs to work

export interface UseLinuxInitReturn {
    selectedDistro: DistroId;
    selectedApps: Set<string>;
    setSelectedDistro: (distroId: DistroId) => void;
    toggleApp: (appId: string) => void;
    selectAll: () => void;
    clearAll: () => void;
    isAppAvailable: (appId: string) => boolean;
    getPackageName: (appId: string) => string | null;
    generatedCommand: string;
    selectedCount: number;
    availableCount: number;
    // Arch/AUR specific
    hasYayInstalled: boolean;
    setHasYayInstalled: (value: boolean) => void;
    selectedHelper: 'yay' | 'paru';
    setSelectedHelper: (helper: 'yay' | 'paru') => void;
    hasAurPackages: boolean;
    aurPackageNames: string[];
    aurAppNames: string[];
    // Flatpak fallback for Parch
    hasFlatpakPackages: boolean;
    flatpakAppNames: string[];
    // Nix unfree packages
    hasUnfreePackages: boolean;
    unfreeAppNames: string[];
    // Hydration state
    isHydrated: boolean;
}

const STORAGE_KEY_DISTRO = 'linuxinit_distro';
const STORAGE_KEY_APPS = 'linuxinit_apps';
const STORAGE_KEY_YAY = 'linuxinit_yay_installed';
const STORAGE_KEY_HELPER = 'linuxinit_selected_helper';

export function useLinuxInit(): UseLinuxInitReturn {
    const [selectedDistro, setSelectedDistroState] = useState<DistroId>('arch');
    const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
    const [hasYayInstalled, setHasYayInstalled] = useState(false);
    const [selectedHelper, setSelectedHelper] = useState<'yay' | 'paru'>('paru');
    const [hydrated, setHydrated] = useState(false);

    // Load saved preferences from localStorage
    useEffect(() => {
        try {
            const savedDistro = localStorage.getItem(STORAGE_KEY_DISTRO) as DistroId | null;
            const savedApps = localStorage.getItem(STORAGE_KEY_APPS);
            const savedYay = localStorage.getItem(STORAGE_KEY_YAY);
            const savedHelper = localStorage.getItem(STORAGE_KEY_HELPER) as 'yay' | 'paru' | null;

            if (savedDistro && distros.some(d => d.id === savedDistro)) {
                setSelectedDistroState(savedDistro);
            }

            if (savedApps) {
                const distro = savedDistro || 'ubuntu';
                const appIds = JSON.parse(savedApps) as string[];
                // Filter to only valid app IDs that are available on the distro
                const validApps = appIds.filter(id => {
                    const app = apps.find(a => a.id === id);
                    if (!app) return false;
                    if (distro === 'arch') {
                        const hasArch = app.targets['arch'] !== undefined && app.targets['arch'] !== null;
                        const hasFlatpak = app.targets['flatpak'] !== undefined && app.targets['flatpak'] !== null;
                        return hasArch || hasFlatpak;
                    }
                    const pkg = app.targets[distro];
                    return pkg !== undefined && pkg !== null;
                });
                setSelectedApps(new Set(validApps));
            }

            if (savedYay === 'true') {
                setHasYayInstalled(true);
            }

            if (savedHelper === 'paru') {
                setSelectedHelper('paru');
            }
        } catch (e) {
            // Ignore localStorage errors
        }
        setHydrated(true);
    }, []);

    // Persist to localStorage when state changes
    useEffect(() => {
        if (!hydrated) return;
        try {
            localStorage.setItem(STORAGE_KEY_DISTRO, selectedDistro);
            localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify([...selectedApps]));
            localStorage.setItem(STORAGE_KEY_YAY, hasYayInstalled.toString());
            localStorage.setItem(STORAGE_KEY_HELPER, selectedHelper);
        } catch (e) {
            // Ignore localStorage errors
        }
    }, [selectedDistro, selectedApps, hasYayInstalled, selectedHelper, hydrated]);

    // Compute unfree Nix packages
    const unfreePackageInfo = useMemo(() => {
        if (selectedDistro !== 'nix') {
            return { hasUnfree: false, appNames: [] as string[] };
        }

        const unfreeAppNames: string[] = [];
        selectedApps.forEach(appId => {
            const app = apps.find(a => a.id === appId);
            if (app) {
                const pkg = app.targets['nix'];
                if (pkg && isUnfreePackage(pkg)) {
                    unfreeAppNames.push(app.name);
                }
            }
        });

        return { hasUnfree: unfreeAppNames.length > 0, appNames: unfreeAppNames };
    }, [selectedDistro, selectedApps]);

    // Compute AUR package info for Arch
    const aurPackageInfo = useMemo(() => {
        if (selectedDistro !== 'arch') {
            return { hasAur: false, packages: [] as string[], appNames: [] as string[] };
        }

        const aurPkgs: string[] = [];
        const aurAppNames: string[] = [];
        selectedApps.forEach(appId => {
            const app = apps.find(a => a.id === appId);
            if (app) {
                const pkg = app.targets['arch'];
                if (pkg && isAurPackage(pkg)) {
                    aurPkgs.push(pkg);
                    aurAppNames.push(app.name);
                }
            }
        });

        return { hasAur: aurPkgs.length > 0, packages: aurPkgs, appNames: aurAppNames };
    }, [selectedDistro, selectedApps]);

    const isAppAvailable = useCallback((appId: string): boolean => {
        const app = apps.find(a => a.id === appId);
        if (!app) return false;
        if (selectedDistro === 'arch') {
            return (app.targets['arch'] !== undefined && app.targets['arch'] !== null)
                || (app.targets['flatpak'] !== undefined && app.targets['flatpak'] !== null);
        }
        const packageName = app.targets[selectedDistro];
        return packageName !== undefined && packageName !== null;
    }, [selectedDistro]);

    const getPackageName = useCallback((appId: string): string | null => {
        const app = apps.find(a => a.id === appId);
        if (!app) return null;
        if (selectedDistro === 'arch') {
            return app.targets['arch'] ?? app.targets['flatpak'] ?? null;
        }
        return app.targets[selectedDistro] ?? null;
    }, [selectedDistro]);

    const setSelectedDistro = useCallback((distroId: DistroId) => {
        setSelectedDistroState(distroId);
        setSelectedApps(prevSelected => {
            const newSelected = new Set<string>();
            prevSelected.forEach(appId => {
                const app = apps.find(a => a.id === appId);
                if (app) {
                    if (distroId === 'arch') {
                        const hasArch = app.targets['arch'] !== undefined && app.targets['arch'] !== null;
                        const hasFlatpak = app.targets['flatpak'] !== undefined && app.targets['flatpak'] !== null;
                        if (hasArch || hasFlatpak) {
                            newSelected.add(appId);
                        }
                    } else {
                        const packageName = app.targets[distroId];
                        if (packageName !== undefined && packageName !== null) {
                            newSelected.add(appId);
                        }
                    }
                }
            });
            return newSelected;
        });
    }, []);

    const toggleApp = useCallback((appId: string) => {
        const app = apps.find(a => a.id === appId);
        if (!app) return;
        if (selectedDistro === 'arch') {
            const hasArch = app.targets['arch'] !== undefined && app.targets['arch'] !== null;
            const hasFlatpak = app.targets['flatpak'] !== undefined && app.targets['flatpak'] !== null;
            if (!hasArch && !hasFlatpak) return;
        } else {
            const pkg = app.targets[selectedDistro];
            if (pkg === undefined || pkg === null) return;
        }

        setSelectedApps(prev => {
            const newSet = new Set(prev);
            if (newSet.has(appId)) {
                newSet.delete(appId);
            } else {
                newSet.add(appId);
            }
            return newSet;
        });
    }, [selectedDistro]);

    const selectAll = useCallback(() => {
        const allAvailable = apps
            .filter(app => {
                if (selectedDistro === 'arch') {
                    const hasArch = app.targets['arch'] !== undefined && app.targets['arch'] !== null;
                    const hasFlatpak = app.targets['flatpak'] !== undefined && app.targets['flatpak'] !== null;
                    return hasArch || hasFlatpak;
                }
                const pkg = app.targets[selectedDistro];
                return pkg !== undefined && pkg !== null;
            })
            .map(app => app.id);
        setSelectedApps(new Set(allAvailable));
    }, [selectedDistro]);

    const clearAll = useCallback(() => {
        setSelectedApps(new Set());
    }, []);

    const availableCount = useMemo(() => {
        return apps.filter(app => {
            if (selectedDistro === 'arch') {
                const hasArch = app.targets['arch'] !== undefined && app.targets['arch'] !== null;
                const hasFlatpak = app.targets['flatpak'] !== undefined && app.targets['flatpak'] !== null;
                return hasArch || hasFlatpak;
            }
            const pkg = app.targets[selectedDistro];
            return pkg !== undefined && pkg !== null;
        }).length;
    }, [selectedDistro]);

    // Flatpak fallback packages for Parch
    const flatpakFallbackInfo = useMemo(() => {
        if (selectedDistro !== 'arch') {
            return { hasFlatpakFallback: false, appNames: [] as string[], flatpakPkgs: [] as string[] };
        }

        const flatpakPkgs: string[] = [];
        const flatpakAppNames: string[] = [];
        selectedApps.forEach(appId => {
            const app = apps.find(a => a.id === appId);
            if (app) {
                const archPkg = app.targets['arch'];
                const flatpakPkg = app.targets['flatpak'];
                if (!archPkg && flatpakPkg) {
                    flatpakPkgs.push(flatpakPkg);
                    flatpakAppNames.push(app.name);
                }
            }
        });

        return { hasFlatpakFallback: flatpakPkgs.length > 0, appNames: flatpakAppNames, flatpakPkgs };
    }, [selectedDistro, selectedApps]);

    const generatedCommand = useMemo(() => {
        if (selectedApps.size === 0) {
            return '# Select apps above to generate command';
        }

        const distro = distros.find(d => d.id === selectedDistro);
        if (!distro) return '';

        if (selectedDistro === 'arch') {
            // Separate arch native vs flatpak fallback packages
            const archPkgs: string[] = [];
            selectedApps.forEach(appId => {
                const app = apps.find(a => a.id === appId);
                if (app) {
                    const pkg = app.targets['arch'];
                    if (pkg) archPkgs.push(pkg);
                }
            });

            const commands: string[] = [];

            // 1. Pacman/AUR command
            if (archPkgs.length > 0) {
                if (aurPackageInfo.hasAur) {
                    if (!hasYayInstalled) {
                        const helperName = selectedHelper;
                        const installHelperCmd = `sudo pacman -S --needed git base-devel && git clone https://aur.archlinux.org/${helperName}.git /tmp/${helperName} && cd /tmp/${helperName} && makepkg -si --noconfirm && cd - && rm -rf /tmp/${helperName}`;
                        commands.push(`${installHelperCmd} && ${helperName} -S --needed --noconfirm ${archPkgs.join(' ')}`);
                    } else {
                        commands.push(`${selectedHelper} -S --needed --noconfirm ${archPkgs.join(' ')}`);
                    }
                } else {
                    commands.push(`sudo pacman -S --needed --noconfirm ${archPkgs.join(' ')}`);
                }
            }

            // 2. Flatpak fallback command
            if (flatpakFallbackInfo.flatpakPkgs.length > 0) {
                commands.push(`flatpak install flathub --noninteractive ${flatpakFallbackInfo.flatpakPkgs.join(' ')}`);
            }

            return commands.join(' &&\n');
        }

        // Non-arch: original logic
        const packageNames: string[] = [];
        selectedApps.forEach(appId => {
            const app = apps.find(a => a.id === appId);
            if (app) {
                const pkg = app.targets[selectedDistro];
                if (pkg) packageNames.push(pkg);
            }
        });

        if (packageNames.length === 0) return '# No packages selected';
        return `${distro.installPrefix} ${packageNames.join(' ')}`;
    }, [selectedDistro, selectedApps, aurPackageInfo.hasAur, hasYayInstalled, selectedHelper, flatpakFallbackInfo]);

    return {
        selectedDistro,
        selectedApps,
        setSelectedDistro,
        toggleApp,
        selectAll,
        clearAll,
        isAppAvailable,
        getPackageName,
        generatedCommand,
        selectedCount: selectedApps.size,
        availableCount,
        // Arch/AUR specific
        hasYayInstalled,
        setHasYayInstalled,
        selectedHelper,
        setSelectedHelper,
        hasAurPackages: aurPackageInfo.hasAur,
        aurPackageNames: aurPackageInfo.packages,
        aurAppNames: aurPackageInfo.appNames,
        // Flatpak fallback for Parch
        hasFlatpakPackages: flatpakFallbackInfo.hasFlatpakFallback,
        flatpakAppNames: flatpakFallbackInfo.appNames,
        // Nix unfree packages
        hasUnfreePackages: unfreePackageInfo.hasUnfree,
        unfreeAppNames: unfreePackageInfo.appNames,
        // Hydration state
        isHydrated: hydrated,
    };
}

