import webBrowsers from './apps/web-browsers.json';
import communication from './apps/communication.json';
import devLanguages from './apps/dev-languages.json';
import devEditors from './apps/dev-editors.json';
import devTools from './apps/dev-tools.json';
import terminal from './apps/terminal.json';
import cliTools from './apps/cli-tools.json';
import media from './apps/media.json';
import creative from './apps/creative.json';
import gaming from './apps/gaming.json';
import office from './apps/office.json';
import vpnNetwork from './apps/vpn-network.json';
import security from './apps/security.json';
import fileSharing from './apps/file-sharing.json';
import system from './apps/system.json';


export type DistroId = 'ubuntu' | 'debian' | 'arch' | 'fedora' | 'opensuse' | 'nix' | 'flatpak' | 'snap' | 'homebrew';

export type Category =
    | 'Web Browsers'
    | 'Communication'
    | 'Dev: Languages'
    | 'Dev: Editors'
    | 'Dev: Tools'
    | 'Terminal'
    | 'CLI Tools'
    | 'Media'
    | 'Creative'
    | 'Gaming'
    | 'Office'
    | 'VPN & Network'
    | 'Security'
    | 'File Sharing'
    | 'System';

export type IconDef =
    | { type: 'iconify'; set: string; name: string; color?: string }
    | { type: 'url'; url: string };

export interface Distro {
    id: DistroId;
    name: string;
    iconUrl: string;
    color: string;
    installPrefix: string;
}

export interface AppData {
    id: string;
    name: string;
    description: string;
    category: Category;
    icon: IconDef;
    targets: Partial<Record<DistroId, string>>;
    unavailableReason?: string;
}

export const getIconUrl = (icon: IconDef): string => {
    if (icon.type === 'url') return icon.url;
    let url = `https://api.iconify.design/${icon.set}/${icon.name}.svg`;
    if (icon.color) {
        url += `?color=${encodeURIComponent(icon.color)}`;
    }
    return url;
};



export const distros: Distro[] = [
    { id: 'ubuntu', name: 'Ubuntu', iconUrl: 'https://api.iconify.design/simple-icons/ubuntu.svg?color=%23E95420', color: '#E95420', installPrefix: 'sudo apt install -y' },
    { id: 'debian', name: 'Debian', iconUrl: 'https://api.iconify.design/simple-icons/debian.svg?color=%23A81D33', color: '#A81D33', installPrefix: 'sudo apt install -y' },
    { id: 'arch', name: 'Arch', iconUrl: 'https://api.iconify.design/simple-icons/archlinux.svg?color=%231793D1', color: '#1793D1', installPrefix: 'sudo pacman -S --needed --noconfirm' },
    { id: 'fedora', name: 'Fedora', iconUrl: 'https://api.iconify.design/simple-icons/fedora.svg?color=%2351A2DA', color: '#51A2DA', installPrefix: 'sudo dnf install -y' },
    { id: 'opensuse', name: 'OpenSUSE', iconUrl: 'https://api.iconify.design/simple-icons/opensuse.svg?color=%2373BA25', color: '#73BA25', installPrefix: 'sudo zypper install -y' },
    { id: 'nix', name: 'Nix', iconUrl: 'https://api.iconify.design/simple-icons/nixos.svg?color=%235277C3', color: '#5277C3', installPrefix: 'nix-env -iA nixpkgs.' },
    { id: 'flatpak', name: 'Flatpak', iconUrl: 'https://api.iconify.design/simple-icons/flatpak.svg?color=%234A90D9', color: '#4A90D9', installPrefix: 'flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo && flatpak install flathub -y' },
    { id: 'snap', name: 'Snap', iconUrl: 'https://api.iconify.design/simple-icons/snapcraft.svg?color=%2382BEA0', color: '#82BEA0', installPrefix: 'sudo snap install' },
    { id: 'homebrew', name: 'Homebrew', iconUrl: 'https://api.iconify.design/simple-icons/homebrew.svg?color=%23FBB040', color: '#FBB040', installPrefix: 'brew install' },
];

export const apps: AppData[] = [
    ...(webBrowsers as AppData[]),
    ...(communication as AppData[]),
    ...(devLanguages as AppData[]),
    ...(devEditors as AppData[]),
    ...(devTools as AppData[]),
    ...(terminal as AppData[]),
    ...(cliTools as AppData[]),
    ...(media as AppData[]),
    ...(creative as AppData[]),
    ...(gaming as AppData[]),
    ...(office as AppData[]),
    ...(vpnNetwork as AppData[]),
    ...(security as AppData[]),
    ...(fileSharing as AppData[]),
    ...(system as AppData[])
];

export const categories: Category[] = [
    'Web Browsers',
    'Communication',
    'Media',
    'Gaming',
    'Office',
    'Creative',
    'System',
    'File Sharing',
    'Security',
    'VPN & Network',
    'Dev: Editors',
    'Dev: Languages',
    'Dev: Tools',
    'Terminal',
    'CLI Tools',
];

export const getAppsByCategory = (category: Category): AppData[] => {
    return apps.filter(app => app.category === category);
};

export const isAppAvailable = (app: AppData, distro: DistroId): boolean => {
    return distro in app.targets;
};
