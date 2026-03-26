'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { distros, apps, type DistroId, isAppAvailable as globalIsAppAvailable } from '@/lib/data';
import { isAurPackage } from '@/lib/aur';
import { isUnfreePackage } from '@/lib/nixUnfree';

export { isAurPackage, AUR_PATTERNS, KNOWN_AUR_PACKAGES } from '@/lib/aur';
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
    hasYayInstalled: boolean;
    setHasYayInstalled: (value: boolean) => void;
    selectedHelper: 'yay' | 'paru';
    setSelectedHelper: (helper: 'yay' | 'paru') => void;
    hasAurPackages: boolean;
    aurPackageNames: string[];
    aurAppNames: string[];
    hasUnfreePackages: boolean;
    unfreeAppNames: string[];
    isHydrated: boolean;
}

const STORAGE_KEY_DISTRO = 'linuxinit_distro';
const STORAGE_KEY_APPS = 'linuxinit_apps';
const STORAGE_KEY_YAY = 'linuxinit_yay_installed';
const STORAGE_KEY_HELPER = 'linuxinit_selected_helper';

export function useLinuxInit(): UseLinuxInitReturn {
    const [selectedDistro, setSelectedDistroState] = useState<DistroId>('ubuntu');
    const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
    const [hasYayInstalled, setHasYayInstalled] = useState(false);
    const [selectedHelper, setSelectedHelper] = useState<'yay' | 'paru'>('yay');
    const [hydrated, setHydrated] = useState(false);

    useEffect(() => {
        try {
            const savedDistro = localStorage.getItem(STORAGE_KEY_DISTRO) as DistroId | null;
            const savedApps = localStorage.getItem(STORAGE_KEY_APPS);
            const savedYay = localStorage.getItem(STORAGE_KEY_YAY);
            const savedHelper = localStorage.getItem(STORAGE_KEY_HELPER) as 'yay' | 'paru' | null;

            if (savedDistro && distros.some(d => d.id === savedDistro)) {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setSelectedDistroState(savedDistro);
            }

            if (savedApps) {
                const appIds = JSON.parse(savedApps) as string[];
                const validApps = appIds.filter(id => {
                    const app = apps.find(a => a.id === id);
                    if (!app) return false;
                    return globalIsAppAvailable(app, savedDistro || 'ubuntu');
                });
                setSelectedApps(new Set(validApps));
            }

            if (savedYay === 'true') {
                setHasYayInstalled(true);
            }

            if (savedHelper === 'paru') {
                setSelectedHelper('paru');
            }
        } catch {
        }
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        try {
            localStorage.setItem(STORAGE_KEY_DISTRO, selectedDistro);
            localStorage.setItem(STORAGE_KEY_APPS, JSON.stringify([...selectedApps]));
            localStorage.setItem(STORAGE_KEY_YAY, hasYayInstalled.toString());
            localStorage.setItem(STORAGE_KEY_HELPER, selectedHelper);
        } catch {
        }
    }, [selectedDistro, selectedApps, hasYayInstalled, selectedHelper, hydrated]);

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

    const isAppAvailable = useCallback((appId: string): boolean => {
        const app = apps.find(a => a.id === appId);
        if (!app) return false;
        return globalIsAppAvailable(app, selectedDistro);
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
                if (app && globalIsAppAvailable(app, distroId)) {
                    newSelected.add(appId);
                }
            });
            return newSelected;
        });
    }, []);

    const toggleApp = useCallback((appId: string) => {
        const app = apps.find(a => a.id === appId);
        if (!app) return;
        if (!globalIsAppAvailable(app, selectedDistro)) return;

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
            .filter(app => globalIsAppAvailable(app, selectedDistro))
            .map(app => app.id);
        setSelectedApps(new Set(allAvailable));
    }, [selectedDistro]);

    const clearAll = useCallback(() => {
        setSelectedApps(new Set());
    }, []);

    const availableCount = useMemo(() => {
        return apps.filter(app => globalIsAppAvailable(app, selectedDistro)).length;
    }, [selectedDistro]);

    const generatedCommand = useMemo(() => {
        if (selectedApps.size === 0) {
            return '# Select apps above to generate command';
        }

        const distro = distros.find(d => d.id === selectedDistro);
        if (!distro) return '';

        const packageNames: string[] = [];
        const npmPkgs: string[] = [];
        const scriptPkgs: string[] = [];

        selectedApps.forEach(appId => {
            const app = apps.find(a => a.id === appId);
            if (app) {
                const pkg = app.targets[selectedDistro];
                if (pkg) {
                    packageNames.push(pkg);
                } else {
                    if (app.targets.npm) npmPkgs.push(app.targets.npm);
                    if (app.targets.script) scriptPkgs.push(app.targets.script);
                }
            }
        });

        const extras: string[] = [];
        if (npmPkgs.length > 0) extras.push(`npm install -g ${npmPkgs.join(' ')}`);
        
        const extrasStr = extras.join(' && ');

        const appendExtras = (cmd: string) => {
            if (!cmd || cmd.startsWith('#')) return extrasStr || cmd;
            return extrasStr ? `${cmd} && ${extrasStr}` : cmd;
        };
        
        const appendScripts = (cmd: string) => {
            if (scriptPkgs.length === 0) return cmd;
            const scriptsStr = scriptPkgs.join(' && ');
            return cmd ? `${cmd} && ${scriptsStr}` : scriptsStr;
        };

        if (packageNames.length === 0 && extras.length === 0 && scriptPkgs.length === 0) {
            return '# No packages selected';
        }

        let baseCmd = '';

        if (packageNames.length > 0) {
            if (selectedDistro === 'nix') {
                const sortedPkgs = packageNames.filter(p => p.trim()).sort();
                const pkgList = sortedPkgs.map(p => `    ${p}`).join('\\n');
                baseCmd = `environment.systemPackages = with pkgs; [\\n${pkgList}\\n];`;
            } else if (selectedDistro === 'snap') {
                if (packageNames.length === 1) {
                    baseCmd = `${distro.installPrefix} ${packageNames[0]}`;
                } else {
                    baseCmd = packageNames.map(p => `sudo snap install ${p}`).join(' && ');
                }
            } else if (selectedDistro === 'arch' && aurPackageInfo.hasAur) {
                if (!hasYayInstalled) {
                    const helperName = selectedHelper; // yay or paru
                    const installHelperCmd = `sudo pacman -S --needed git base-devel && git clone https://aur.archlinux.org/${helperName}.git /tmp/${helperName} && cd /tmp/${helperName} && makepkg -si --noconfirm && cd - && rm -rf /tmp/${helperName}`;
                    const installCmd = `${helperName} -S --needed --noconfirm ${packageNames.join(' ')}`;
                    baseCmd = `${installHelperCmd} && ${installCmd}`;
                } else {
                    baseCmd = `${selectedHelper} -S --needed --noconfirm ${packageNames.join(' ')}`;
                }
            } else if (selectedDistro === 'homebrew') {
                const formulae = packageNames.filter(p => !p.startsWith('--cask '));
                const casks = packageNames.filter(p => p.startsWith('--cask ')).map(p => p.replace('--cask ', ''));
                const parts: string[] = [];
                if (formulae.length > 0) parts.push(`brew install ${formulae.join(' ')}`);
                if (casks.length > 0) parts.push(`brew install --cask ${casks.join(' ')}`);
                baseCmd = parts.join(' && ');
            } else {
                baseCmd = `${distro.installPrefix} ${packageNames.join(' ')}`;
            }
        }

        if (selectedDistro === 'nix') {
            let combined = baseCmd;
            if (extrasStr) combined += '\\n# NPM limits:\\n# ' + extrasStr;
            if (scriptPkgs.length > 0) combined += '\\n# Custom scripts:\\n# ' + scriptPkgs.join('\\n# ');
            return combined;
        }

        return appendScripts(appendExtras(baseCmd));
    }, [selectedDistro, selectedApps, aurPackageInfo.hasAur, hasYayInstalled, selectedHelper]);

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
        hasYayInstalled,
        setHasYayInstalled,
        selectedHelper,
        setSelectedHelper,
        hasAurPackages: aurPackageInfo.hasAur,
        aurPackageNames: aurPackageInfo.packages,
        aurAppNames: aurPackageInfo.appNames,
        hasUnfreePackages: unfreePackageInfo.hasUnfree,
        unfreeAppNames: unfreePackageInfo.appNames,
        isHydrated: hydrated,
    };
}

