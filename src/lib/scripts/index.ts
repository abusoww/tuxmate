// Re-exports all distro script generators

export { escapeShellString, getSelectedPackages, type PackageInfo } from './shared';
export { generateUbuntuScript } from './ubuntu';
export { generateDebianScript } from './debian';
export { generateArchScript } from './arch';
export { generateFedoraScript } from './fedora';
export { generateOpenSUSEScript } from './opensuse';
export { generateNixScript } from './nix';
export { generateFlatpakScript } from './flatpak';
export { generateSnapScript } from './snap';
export { generateHomebrewScript } from './homebrew';
