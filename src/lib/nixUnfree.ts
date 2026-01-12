// Nix unfree package detection - these require allowUnfree = true

export const KNOWN_UNFREE_PACKAGES = new Set([
    'discord',
    'slack',
    'zoom-us',
    'teams',
    'skypeforlinux',
    'google-chrome',
    'vivaldi',
    'opera',
    'spotify',
    'steam',
    'vscode',
    'sublime',
    'sublime4',
    'jetbrains',
    'nvidia-x11',
    'dropbox',
    '1password',
    'masterpdfeditor',
    'postman',
    'obsidian',
    'davinci-resolve',
    'code-cursor',
    'vagrant',
]);

export function isUnfreePackage(pkg: string): boolean {
    const cleanPkg = pkg.trim().toLowerCase();
    if (KNOWN_UNFREE_PACKAGES.has(cleanPkg)) return true;

    // Nested packages like jetbrains.idea-ultimate
    for (const unfree of KNOWN_UNFREE_PACKAGES) {
        if (cleanPkg.includes(unfree)) return true;
    }
    return false;
}
