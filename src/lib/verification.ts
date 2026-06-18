import verifiedFlatpaks from './verified-flatpaks.json';
import verifiedSnaps from './verified-snaps.json';

const VERIFIED_FLATPAK_APPS = new Set(verifiedFlatpaks.apps);
const VERIFIED_SNAP_PACKAGES = new Set(verifiedSnaps.apps);

export function isFlathubVerified(appId: string): boolean {
    return VERIFIED_FLATPAK_APPS.has(appId);
}

export function isSnapVerified(snapName: string): boolean {
    const cleanName = snapName.split(' ')[0];
    return VERIFIED_SNAP_PACKAGES.has(cleanName);
}
