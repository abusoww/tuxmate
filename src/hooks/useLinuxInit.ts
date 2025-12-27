'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { distros, apps, type DistroId } from '@/lib/data';

// AUR package detection patterns
export const AUR_PATTERNS = ['-bin', '-git', '-appimage'];

// Known AUR packages that don't follow the suffix naming convention
export const KNOWN_AUR_PACKAGES = new Set([
    'google-chrome', 'sublime-text-4', 'spotify', 'stremio', 'dropbox',
    'slack-desktop', 'zoom', 'proton-vpn-gtk-app', 'bitwarden', 'discord'
]);

export function isAurPackage(packageName: string): boolean {
    return AUR_PATTERNS.some(pattern => packageName.endsWith(pattern)) || KNOWN_AUR_PACKAGES.has(packageName);
}

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
    hasAurPackages: boolean;
    aurPackageNames: string[];
    aurAppNames: string[];
}

const STORAGE_KEY_DISTRO = 'linuxinit_distro';
const STORAGE_KEY_APPS = 'linuxinit_apps';
const STORAGE_KEY_YAY = 'linuxinit_yay_installed';

export function useLinuxInit(): UseLinuxInitReturn {
    const [selectedDistro, setSelectedDistroState] = useState<DistroId>('ubuntu');
    const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
    const [hasYayInstalled, setHasYayInstalled] = useState(false);
    const [hydrated, setHydrated] = useState(false);

    // Hydrate from localStorage on mount
    useEffect(() => {
        try {
            const savedDistro = localStorage.getItem(STORAGE_KEY_DISTRO) as DistroId | null;
            const savedApps = localStorage.getItem(STORAGE_KEY_APPS);
            const savedYay = localStorage.getItem(STORAGE_KEY_YAY);

            if (savedDistro && distros.some(d => d.id === savedDistro)) {
                setSelectedDistroState(savedDistro);
            }

            if (savedApps) {
                const appIds = JSON.parse(savedApps) as string[];
                // Filter to only valid app IDs that are available on the distro
                const validApps = appIds.filter(id => {
                    const app = apps.find(a => a.id === id);
                    if (!app) return false;
                    const pkg = app.targets[savedDistro || 'ubuntu'];
                    return pkg !== undefined && pkg !== null;
                });
                setSelectedApps(new Set(validApps));
            }

            if (savedYay === 'true') {
                setHasYayInstalled(true);
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
        } catch (e) {
            // Ignore localStorage errors
        }
    }, [selectedDistro, selectedApps, hasYayInstalled, hydrated]);

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
        const packageName = app.targets[selectedDistro];
        return packageName !== undefined && packageName !== null;
    }, [selectedDistro]);

    const getPackageName = useCallback((appId: string): string | null => {
        const app = apps.find(a => a.id === appId);
        if (!app) return null;
        return app.targets[selectedDistro] ?? null;
    }, [selectedDistro]);

    const setSelectedDistro = useCallback((distroId: DistroId) => {
        setSelectedDistroState(distroId);
        setSelectedApps(prevSelected => {
            const newSelected = new Set<string>();
            prevSelected.forEach(appId => {
                const app = apps.find(a => a.id === appId);
                if (app) {
                    const packageName = app.targets[distroId];
                    if (packageName !== undefined && packageName !== null) {
                        newSelected.add(appId);
                    }
                }
            });
            return newSelected;
        });
    }, []);

    const toggleApp = useCallback((appId: string) => {
        if (!isAppAvailable(appId)) return;
        setSelectedApps(prev => {
            const newSet = new Set(prev);
            if (newSet.has(appId)) {
                newSet.delete(appId);
            } else {
                newSet.add(appId);
            }
            return newSet;
        });
    }, [isAppAvailable]);

    const selectAll = useCallback(() => {
        const allAvailable = apps
            .filter(app => {
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
            const pkg = app.targets[selectedDistro];
            return pkg !== undefined && pkg !== null;
        }).length;
    }, [selectedDistro]);

    const generatedCommand = useMemo(() => {
        if (selectedApps.size === 0) {
            return '# Select apps above to generate command';
        }

        const distro = distros.find(d => d.id === selectedDistro);
        if (!distro) return '';

        const packageNames: string[] = [];
        selectedApps.forEach(appId => {
            const app = apps.find(a => a.id === appId);
            if (app) {
                const pkg = app.targets[selectedDistro];
                if (pkg) packageNames.push(pkg);
            }
        });

        if (packageNames.length === 0) return '# No packages selected';

        // Handle special cases for NixOS and Snap
        if (selectedDistro === 'nix') {
            // NixOS needs nixpkgs. prefix for each package
            return `${distro.installPrefix} ${packageNames.map(p => `nixpkgs.${p}`).join(' ')}`;
        }

        if (selectedDistro === 'snap') {
            // Snap needs separate commands for --classic packages
            if (packageNames.length === 1) {
                return `${distro.installPrefix} ${packageNames[0]}`;
            }
            return packageNames.map(p => `sudo snap install ${p}`).join(' && ');
        }

        // Handle Arch Linux with AUR packages
        if (selectedDistro === 'arch' && aurPackageInfo.hasAur) {
            if (!hasYayInstalled) {
                // User doesn't have yay installed - prepend yay installation
                const yayInstallCmd = 'sudo pacman -S --needed git base-devel && git clone https://aur.archlinux.org/yay.git /tmp/yay && cd /tmp/yay && makepkg -si --noconfirm && cd - && rm -rf /tmp/yay';
                const installCmd = `yay -S --needed --noconfirm ${packageNames.join(' ')}`;
                return `${yayInstallCmd} && ${installCmd}`;
            } else {
                // User has yay installed - use yay for ALL packages (both official and AUR)
                return `yay -S --needed --noconfirm ${packageNames.join(' ')}`;
            }
        }

        return `${distro.installPrefix} ${packageNames.join(' ')}`;
    }, [selectedDistro, selectedApps, aurPackageInfo.hasAur, hasYayInstalled]);

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
        hasAurPackages: aurPackageInfo.hasAur,
        aurPackageNames: aurPackageInfo.packages,
        aurAppNames: aurPackageInfo.appNames,
    };
}

