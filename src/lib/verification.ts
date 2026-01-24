// Flatpak/Snap verification status - shows badges for verified publishers

// Flathub API response shape
interface FlathubVerificationResponse {
    hits: Array<{
        app_id: string;
        verification_verified: boolean;
    }>;
    totalPages: number;
}

// Module-level cache to avoid refetching
let flathubVerifiedCache: Set<string> | null = null;

// Known verified Snap publishers (static list - Snapcraft API doesn't support CORS)
// To update: curl -s "https://api.snapcraft.io/v2/snaps/info/{snap_name}" -H "Snap-Device-Series: 16" | jq '.snap.publisher'
const KNOWN_VERIFIED_SNAP_PACKAGES = new Set([
    // Mozilla
    'firefox',
    'thunderbird',
    // Canonical/Ubuntu
    'chromium',
    // Brave
    'brave',
    // Spotify
    'spotify',
    // Microsoft
    'code',
    // JetBrains
    'intellij-idea-community',
    'intellij-idea-ultimate',
    'pycharm-community',
    'pycharm-professional',
    // Slack
    'slack',
    // Discord
    'discord',
    // Signal
    'signal-desktop',
    // Telegram
    'telegram-desktop',
    // Zoom
    'zoom-client',
    // Obsidian
    'obsidian',
    // Bitwarden
    'bitwarden',
    // Creative
    'blender',
    'gimp',
    'inkscape',
    'krita',
    // Media
    'vlc',
    'obs-studio',
    // Office
    'libreoffice',
    // Dev
    'node',
    'go',
    'rustup',
    'ruby',
    'cmake',
    'docker',
    'kubectl',
    // Gaming
    'steam',
    'retroarch',
    // Browser
    'vivaldi',
]);

// Fetch all verified Flatpak app IDs from Flathub (paginated)
export async function fetchFlathubVerifiedApps(): Promise<Set<string>> {
    if (flathubVerifiedCache !== null) {
        return flathubVerifiedCache;
    }

    const verifiedApps = new Set<string>();

    try {
        let page = 1;
        let hasMore = true;

        while (hasMore) {
            const response = await fetch(
                `https://flathub.org/api/v2/collection/verified?page=${page}&per_page=250`,
                {
                    headers: { 'Accept': 'application/json' },
                    signal: AbortSignal.timeout(10000),
                }
            );

            if (!response.ok) {
                console.warn(`Flathub API returned ${response.status}`);
                break;
            }

            const data: FlathubVerificationResponse = await response.json();

            for (const hit of data.hits) {
                if (hit.verification_verified && hit.app_id) {
                    verifiedApps.add(hit.app_id);
                }
            }

            hasMore = page < data.totalPages;
            page++;

            // Safety limit
            if (page > 10) break;
        }
    } catch (error) {
        console.warn('Failed to fetch Flathub verification data:', error);
    }

    flathubVerifiedCache = verifiedApps;
    return verifiedApps;
}

// Check if a Flatpak app ID is verified (call fetchFlathubVerifiedApps first)
export function isFlathubVerified(appId: string): boolean {
    return flathubVerifiedCache?.has(appId) ?? false;
}

// Check if a Snap package is from a verified publisher
export function isSnapVerified(snapName: string): boolean {
    // Strip --classic suffix
    const cleanName = snapName.split(' ')[0];
    return KNOWN_VERIFIED_SNAP_PACKAGES.has(cleanName);
}
