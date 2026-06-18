// Main entry point for generating install scripts.
// Each distro has its own module - keeps things sane.

import { distros, type DistroId } from './data';
import {
    getSelectedPackages,
    generateArchScript,
    generateFlatpakScript,
} from './scripts';

interface ScriptOptions {
    distroId: DistroId;
    selectedAppIds: Set<string>;
    helper?: 'yay' | 'paru';
}

// The full fancy script with progress bars and all that jazz
export function generateInstallScript(options: ScriptOptions): string {
    const { distroId, selectedAppIds, helper = 'yay' } = options;
    const distro = distros.find(d => d.id === distroId);

    if (!distro) return '#!/bin/bash\necho "Error: Unknown distribution"\nexit 1';

    const packages = getSelectedPackages(selectedAppIds, distroId);
    if (packages.length === 0) return '#!/bin/bash\necho "No packages selected"\nexit 0';

    switch (distroId) {
        case 'arch': return generateArchScript(packages, helper);
        case 'flatpak': return generateFlatpakScript(packages);
        default: return '#!/bin/bash\necho "Unsupported distribution"\nexit 1';
    }
}

// Quick one-liner for copy-paste warriors
export function generateSimpleCommand(selectedAppIds: Set<string>, distroId: DistroId): string {
    const packages = getSelectedPackages(selectedAppIds, distroId);
    if (packages.length === 0) return '# No packages selected';

    const pkgList = packages.map(p => p.pkg).join(' ');

    switch (distroId) {
        case 'arch': return `sudo pacman -S --needed --noconfirm ${pkgList}`;
        case 'flatpak': return `flatpak install flathub -y ${pkgList}`;
        default: return `# Install: ${pkgList}`;
    }
}
