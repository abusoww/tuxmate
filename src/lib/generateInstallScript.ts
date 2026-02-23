import { distros, type DistroId } from './data';
import {
    getSelectedPackages,
    generateUbuntuScript,
    generateDebianScript,
    generateArchScript,
    generateFedoraScript,
    generateOpenSUSEScript,
    generateNixConfig,
    generateFlatpakScript,
    generateSnapScript,
    generateHomebrewScript,
} from './scripts';

interface GenerateOptions {
    distroId: DistroId;
    selectedAppIds: Set<string>;
    helper?: 'yay' | 'paru';
}

export function generateInstallScript(options: GenerateOptions): string {
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
        case 'nix': return generateNixConfig(packages);
        case 'flatpak': return generateFlatpakScript(packages);
        case 'snap': return generateSnapScript(packages);
        case 'homebrew': return generateHomebrewScript(packages);
        default: return '#!/bin/bash\necho "Unsupported distribution"\nexit 1';
    }
}

export function generateCommandline(options: GenerateOptions): string {
    const { selectedAppIds, distroId } = options;
    const packages = getSelectedPackages(selectedAppIds, distroId);
    if (packages.length === 0) return '# No packages selected';

    const pkgList = packages.map(p => p.pkg).join(' ');

    switch (distroId) {
        case 'ubuntu':
        case 'debian': return `sudo apt install -y ${pkgList}`;
        case 'arch': return `yay -S --needed --noconfirm ${pkgList}`;
        case 'fedora': return `sudo dnf install -y ${pkgList}`;
        case 'opensuse': return `sudo zypper install -y ${pkgList}`;
        case 'nix': return generateNixConfig(packages);
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
