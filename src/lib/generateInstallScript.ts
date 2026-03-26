import { distros, type DistroId } from './data';
import {
    getSelectedPackages,
    getUniversalPackages,
    generateUniversalScript,
    generateAsciiHeader,
    generateSharedUtils,
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

    if (!distro) return '#!/bin/bash\\necho "Error: Unknown distribution"\\nexit 1';

    const uScript = generateUniversalScript(selectedAppIds, distroId);
    const packages = getSelectedPackages(selectedAppIds, distroId);
    
    if (packages.length === 0 && !uScript) return '#!/bin/bash\\necho "No packages selected"\\nexit 0';

    const injectUniversal = (script: string) => script.replace('\\nprint_summary', '\\n' + uScript + '\\nprint_summary');

    let scriptContent = '';

    switch (distroId) {
        case 'ubuntu': scriptContent = injectUniversal(generateUbuntuScript(packages)); break;
        case 'debian': scriptContent = injectUniversal(generateDebianScript(packages)); break;
        case 'arch': scriptContent = injectUniversal(generateArchScript(packages, helper)); break;
        case 'fedora': scriptContent = injectUniversal(generateFedoraScript(packages)); break;
        case 'opensuse': scriptContent = injectUniversal(generateOpenSUSEScript(packages)); break;
        case 'flatpak': scriptContent = injectUniversal(generateFlatpakScript(packages)); break;
        case 'snap': scriptContent = injectUniversal(generateSnapScript(packages)); break;
        case 'homebrew': scriptContent = injectUniversal(generateHomebrewScript(packages)); break;
        case 'nix': 
            if (packages.length === 0) return '# Nix\\n\\n# Generic Installers (Please run separately outside NixOS configuration):\\n' + uScript;
            return generateNixConfig(packages) + '\\n\\n# ----------------------------------------\\n# NOTE: Universal packages (npm) cannot be strictly placed in environment.systemPackages.\\n# You may need to run these commands in a standard terminal:\\n# \\n/* \\n' + uScript + '\\n*/\\n';
        default: return '#!/bin/bash\\necho "Unsupported distribution"\\nexit 1';
    }

    if (packages.length === 0) {
        const universalCount = getUniversalPackages(selectedAppIds, 'npm', distroId).length
            + getUniversalPackages(selectedAppIds, 'script', distroId).length;
        return generateAsciiHeader(distro.name, universalCount)
            + generateSharedUtils(distro.name.toLowerCase(), universalCount)
            + uScript
            + '\nprint_summary\n';
    }

    return scriptContent;
}

export function generateCommandline(options: GenerateOptions): string {
    const { selectedAppIds, distroId } = options;
    
    const npmPkgs = getUniversalPackages(selectedAppIds, 'npm', distroId);
    const scriptPkgs = getUniversalPackages(selectedAppIds, 'script', distroId);

    const extras: string[] = [];
    if (npmPkgs.length > 0) extras.push(`npm install -g ${npmPkgs.map(p => p.pkg).join(' ')}`);
    
    const extrasStr = extras.length > 0 ? (extras.join(' && ')) : '';
    const appendExtras = (cmd: string) => {
        if (!cmd || cmd.startsWith('#')) return extrasStr ? extrasStr : cmd;
        return extrasStr ? `${cmd} && ${extrasStr}` : cmd;
    };
    const appendScripts = (cmd: string) => {
        if (scriptPkgs.length === 0) return cmd;
        const scriptsStr = scriptPkgs.map(p => p.pkg).join(' && ');
        if (!cmd || cmd.startsWith('#')) return scriptsStr;
        return `${cmd} && ${scriptsStr}`;
    };

    const packages = getSelectedPackages(selectedAppIds, distroId);
    if (packages.length === 0 && extras.length === 0 && scriptPkgs.length === 0) return '# No packages selected';

    const pkgList = packages.map(p => p.pkg).join(' ');

    switch (distroId) {
        case 'ubuntu':
        case 'debian': return appendScripts(appendExtras(pkgList ? `sudo apt install -y ${pkgList}` : ''));
        case 'arch': return appendScripts(appendExtras(pkgList ? `yay -S --needed --noconfirm ${pkgList}` : ''));
        case 'fedora': return appendScripts(appendExtras(pkgList ? `sudo dnf install -y ${pkgList}` : ''));
        case 'opensuse': return appendScripts(appendExtras(pkgList ? `sudo zypper install -y ${pkgList}` : ''));
        case 'nix': return generateNixConfig(packages); // Nix handles its own thing without extras as simple cmds
        case 'flatpak': return appendScripts(appendExtras(pkgList ? `flatpak install flathub -y ${pkgList}` : ''));
        case 'snap': {
            let cmd = '';
            if (packages.length === 1) cmd = `sudo snap install ${pkgList}`;
            else if (packages.length > 1) cmd = packages.map(p => `sudo snap install ${p.pkg}`).join(' && ');
            return appendScripts(appendExtras(cmd));
        }
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
            return appendScripts(appendExtras(parts.join(' && ')));
        }
        default: return appendScripts(appendExtras(pkgList ? `# Install: ${pkgList}` : ''));
    }
}
