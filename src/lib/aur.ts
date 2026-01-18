/**
 * AUR package detection for Arch users.
 * Figures out if a package comes from AUR or official repos.
 * Necessary because yay/paru handle AUR packages differently.
 */

/** Suffixes that scream "I'm from the AUR" */
export const AUR_PATTERNS = ['-bin', '-git', '-appimage'];

/**
 * Known AUR packages that don't follow the suffix naming convention.
 * These are packages that exist only in AUR, not in official Arch repos.
 */
export const KNOWN_AUR_PACKAGES = new Set([
    // Browsers
    'google-chrome',
    'zen-browser-bin',
    'helium-browser-bin',

    // Communication
    'slack-desktop',
    'zoom',
    'vesktop-bin',

    // Dev Editors
    'sublime-text-4',
    'vscodium-bin',
    'cursor-bin',

    // Dev Tools
    'postman-bin',
    'bruno-bin',
    'hoppscotch-bin',

    // Dev Languages
    'bun-bin',

    // Media
    'spotify',
    'stremio',

    // Gaming
    'heroic-games-launcher-bin',
    'protonup-qt-bin',

    // Office
    'onlyoffice-bin',
    'logseq-desktop-bin',
    'joplin-appimage',

    // VPN
    'proton-vpn-gtk-app',
    'mullvad-vpn-bin',

    // File Sharing
    'localsend-bin',
    'dropbox',
    'ab-download-manager-bin',

    // Security
    'bitwarden',

    // Creative
    'orcaslicer-bin',
    'davinci-resolve',

    // System
    'fsearch',

    // Browsers (additional)
    'brave-bin',
    'librewolf-bin',
]);

/**
 * Check if a package name is an AUR package
 * @param packageName - The Arch package name to check
 * @returns true if the package is from AUR
 */
export function isAurPackage(packageName: string): boolean {
    if (KNOWN_AUR_PACKAGES.has(packageName)) {
        return true;
    }
    return AUR_PATTERNS.some(pattern => packageName.endsWith(pattern));
}
