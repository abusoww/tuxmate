// Flatpak/Snap verification status - shows badges for verified publishers

// Flathub API response shape
interface FlathubSearchResponse {
    hits: Array<{
        app_id: string;
        verification_verified: boolean;
    }>;
    totalPages: number;
    totalHits: number;
}

// Module-level cache
let flathubVerifiedCache: Set<string> | null = null;

// localStorage cache key and TTL (1 hour)
const CACHE_KEY = 'tuxmate_verified_flatpaks';
const CACHE_TTL_MS = 60 * 60 * 1000;

// Known verified Snap publishers (static list - Snapcraft API doesn't support CORS)
const KNOWN_VERIFIED_SNAP_PACKAGES = new Set([
    // Mozilla
    'firefox', 'thunderbird',
    // Canonical/Ubuntu
    'chromium',
    // Brave
    'brave',
    // Spotify
    'spotify',
    // Microsoft
    'code',
    // JetBrains
    'intellij-idea-community', 'intellij-idea-ultimate', 'pycharm-community', 'pycharm-professional',
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
    'blender', 'gimp', 'inkscape', 'krita',
    // Media
    'vlc', 'obs-studio',
    // Office
    'libreoffice',
    // Dev
    'node', 'go', 'rustup', 'ruby', 'cmake', 'docker', 'kubectl',
    // Gaming
    'steam', 'retroarch',
    // Browser
    'vivaldi',
]);

// Try to load from localStorage cache
function loadFromCache(): Set<string> | null {
    try {
        const cached = localStorage.getItem(CACHE_KEY);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp > CACHE_TTL_MS) {
            localStorage.removeItem(CACHE_KEY);
            return null;
        }

        return new Set(data);
    } catch {
        return null;
    }
}

// Save to localStorage cache
function saveToCache(apps: Set<string>): void {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            data: Array.from(apps),
            timestamp: Date.now(),
        }));
    } catch {
        // localStorage might be full or disabled
    }
}

// Fetch a single page
async function fetchPage(page: number): Promise<string[]> {
    const response = await fetch('https://flathub.org/api/v2/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: '',
            filter: 'verification_verified=true',
            page,
            hitsPerPage: 250,
        }),
        signal: AbortSignal.timeout(15000),
    });

    if (!response.ok) return [];

    const data: FlathubSearchResponse = await response.json();
    return data.hits
        .filter(h => h.verification_verified && h.app_id)
        .map(h => h.app_id);
}

// Fetch all verified Flatpak app IDs (parallel + cached)
export async function fetchFlathubVerifiedApps(): Promise<Set<string>> {
    // Return memory cache if available
    if (flathubVerifiedCache !== null) {
        return flathubVerifiedCache;
    }

    // Try localStorage cache
    const cached = loadFromCache();
    if (cached) {
        flathubVerifiedCache = cached;
        return cached;
    }

    // Fetch page 1 to get totalPages
    try {
        const firstResponse = await fetch('https://flathub.org/api/v2/search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: '',
                filter: 'verification_verified=true',
                page: 1,
                hitsPerPage: 250,
            }),
            signal: AbortSignal.timeout(15000),
        });

        if (!firstResponse.ok) {
            console.warn('Flathub API returned', firstResponse.status);
            flathubVerifiedCache = new Set();
            return flathubVerifiedCache;
        }

        const firstData: FlathubSearchResponse = await firstResponse.json();
        const verifiedApps = new Set<string>(
            firstData.hits.filter(h => h.verification_verified && h.app_id).map(h => h.app_id)
        );

        // Fetch remaining pages in parallel (limit to 20 pages = 5,000 apps)
        const totalPages = Math.min(firstData.totalPages, 20);
        if (totalPages > 1) {
            const pagePromises = [];
            for (let p = 2; p <= totalPages; p++) {
                pagePromises.push(fetchPage(p));
            }

            const results = await Promise.all(pagePromises);
            for (const appIds of results) {
                for (const id of appIds) {
                    verifiedApps.add(id);
                }
            }
        }

        flathubVerifiedCache = verifiedApps;
        saveToCache(verifiedApps);
        return verifiedApps;
    } catch (error) {
        console.warn('Failed to fetch Flathub verification data:', error);
        flathubVerifiedCache = new Set();
        return flathubVerifiedCache;
    }
}

// Check if a Flatpak app ID is verified
export function isFlathubVerified(appId: string): boolean {
    return flathubVerifiedCache?.has(appId) ?? false;
}

// Check if a Snap package is from a verified publisher
export function isSnapVerified(snapName: string): boolean {
    const cleanName = snapName.split(' ')[0];
    return KNOWN_VERIFIED_SNAP_PACKAGES.has(cleanName);
}
