import aurPackages from './aur-packages.json';

export const AUR_PATTERNS = ['-bin', '-git', '-appimage'];

export const KNOWN_AUR_PACKAGES = new Set(aurPackages.packages);

export function isAurPackage(packageName: string): boolean {
    if (KNOWN_AUR_PACKAGES.has(packageName)) {
        return true;
    }
    return AUR_PATTERNS.some(pattern => packageName.endsWith(pattern));
}

