/**
 * Generate install scripts for Linux distributions
 * 
 * This module provides the main entry point for generating
 * distribution-specific installation scripts.
 * 
 * Each distro has its own module in ./scripts/ for easier maintenance.
 */

import { distros, type DistroId } from './data';
import {
    getSelectedPackages,
    generateUbuntuScript,
    generateDebianScript,
    generateArchScript,
    generateFedoraScript,
    generateOpenSUSEScript,
    generateNixScript,
    generateFlatpakScript,
    generateSnapScript,
} from './scripts';

interface ScriptOptions {
    distroId: DistroId;
    selectedAppIds: Set<string>;
    helper?: 'yay' | 'paru';
}

/**
 * Generate a full installation script with progress bars, error handling, and retries
 */
export function generateInstallScript(options: ScriptOptions): string {
    const { distroId, selectedAppIds, helper = 'yay' } = options;
    const distro = distros.find(d => d.id === distroId);

    if (!distro) return '#!/bin/bash\necho "Error: Unknown distribution"\nexit 1';

    const packages = getSelectedPackages(selectedAppIds, distroId);
    if (packages.length === 0) return '#!/bin/bash\necho "No packages selected"\nexit 0';

    switch (distroId) {
        case 'ubuntu': return generateUbuntuScript(packages);
        case 'debian': return generateDebianScript(packages);
        case 'arch': return generateArchScript(packages, helper);
        case 'fedora': return generateFedoraScript(packages);
        case 'opensuse': return generateOpenSUSEScript(packages);
        case 'nix': return generateNixScript(packages);
        case 'flatpak': return generateFlatpakScript(packages);
        case 'snap': return generateSnapScript(packages);
        default: return '#!/bin/bash\necho "Unsupported distribution"\nexit 1';
    }
}

/**
 * Generate a simple one-liner command for quick copy-paste
 */
export function generateSimpleCommand(selectedAppIds: Set<string>, distroId: DistroId): string {
    const packages = getSelectedPackages(selectedAppIds, distroId);
    if (packages.length === 0) return '# No packages selected';

    const pkgList = packages.map(p => p.pkg).join(' ');

    switch (distroId) {
        case 'ubuntu':
        case 'debian': return `sudo apt install -y ${pkgList}`;
        case 'arch': return `yay -S --needed --noconfirm ${pkgList}`;
        case 'fedora': return `sudo dnf install -y ${pkgList}`;
        case 'opensuse': return `sudo zypper install -y ${pkgList}`;
        case 'nix': return `nix-env -iA ${packages.map(p => `nixpkgs.${p.pkg}`).join(' ')}`;
        case 'flatpak': return `flatpak install flathub -y ${pkgList}`;
        case 'snap':
            if (packages.length === 1) return `sudo snap install ${pkgList}`;
            return packages.map(p => `sudo snap install ${p.pkg}`).join(' && ');
        default: return `# Install: ${pkgList}`;
    }
}
