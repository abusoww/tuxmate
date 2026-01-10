// Main entry point for generating install scripts.
// Each distro has its own module - keeps things sane.

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
    generateHomebrewScript,
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
        case 'ubuntu': return generateUbuntuScript(packages);
        case 'debian': return generateDebianScript(packages);
        case 'arch': return generateArchScript(packages, helper);
        case 'fedora': return generateFedoraScript(packages);
        case 'opensuse': return generateOpenSUSEScript(packages);
        case 'nix': return generateNixScript(packages);
        case 'flatpak': return generateFlatpakScript(packages);
        case 'snap': return generateSnapScript(packages);
        case 'homebrew': return generateHomebrewScript(packages);
        default: return '#!/bin/bash\necho "Unsupported distribution"\nexit 1';
    }
}

// Quick one-liner for copy-paste warriors
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
        case 'nix': return `nix-env -iA ${packages.filter(p => p.pkg.trim()).map(p => `nixpkgs.${p.pkg.trim()}`).join(' ')}`;
        case 'flatpak': return `flatpak install flathub -y ${pkgList}`;
        case 'snap':
            if (packages.length === 1) return `sudo snap install ${pkgList}`;
            return packages.map(p => `sudo snap install ${p.pkg}`).join(' && ');
        case 'homebrew': {
            const formulae = packages.filter(p => !p.pkg.startsWith('--cask '));
            const casks = packages.filter(p => p.pkg.startsWith('--cask '));
            const parts = [];
            if (formulae.length > 0) {
                parts.push(`brew install ${formulae.map(p => p.pkg).join(' ')}`);
            }
            if (casks.length > 0) {
                parts.push(`brew install --cask ${casks.map(p => p.pkg.replace('--cask ', '')).join(' ')}`);
            }
            return parts.join(' && ') || '# No packages selected';
        }
        default: return `# Install: ${pkgList}`;
    }
}
