// Umami Analytics Utility
// https://umami.is/docs/track-events

declare global {
    interface Window {
        umami?: {
            track: (eventName: string, eventData?: Record<string, string | number | boolean>) => void;
        };
    }
}

/**
 * Track a custom event with Umami
 * Safe to call even if Umami hasn't loaded yet
 */
export function track(
    eventName: string,
    eventData?: Record<string, string | number | boolean>
): void {
    if (typeof window !== 'undefined' && window.umami) {
        window.umami.track(eventName, eventData);
    }
}

// ═══════════════════════════════════════════════════════════════
// EVENT NAMES - Descriptive names for Umami dashboard
// ═══════════════════════════════════════════════════════════════

export const EVENTS = {
    // Distro Selection
    DISTRO_SELECTED: 'Distro Selected',

    // App Interactions
    APP_SELECTED: 'App Selected',
    APP_DESELECTED: 'App Deselected',

    // Command Actions
    COMMAND_COPIED: 'Command Copied',
    SCRIPT_DOWNLOADED: 'Script Downloaded',

    // Navigation
    GITHUB_CLICKED: 'GitHub Clicked',
    CONTRIBUTE_CLICKED: 'Contribute Clicked',

    // UI Interactions
    HELP_OPENED: 'How It Works Opened',
    HELP_CLOSED: 'How It Works Closed',
    THEME_CHANGED: 'Theme Changed',
    CATEGORY_EXPANDED: 'Category Expanded',
    CATEGORY_COLLAPSED: 'Category Collapsed',
} as const;

// ═══════════════════════════════════════════════════════════════
// CONVENIENCE FUNCTIONS - Type-safe tracking helpers
// ═══════════════════════════════════════════════════════════════

export const analytics = {
    /** Track distro selection */
    distroSelected: (distro: string) => {
        track(EVENTS.DISTRO_SELECTED, { distro });
    },

    /** Track app selection */
    appSelected: (app: string, category: string, distro: string) => {
        track(EVENTS.APP_SELECTED, { app, category, distro });
    },

    /** Track app deselection */
    appDeselected: (app: string, category: string, distro: string) => {
        track(EVENTS.APP_DESELECTED, { app, category, distro });
    },

    /** Track command copy */
    commandCopied: (distro: string, appCount: number) => {
        track(EVENTS.COMMAND_COPIED, { distro, apps: appCount });
    },

    /** Track script download */
    scriptDownloaded: (distro: string, appCount: number) => {
        track(EVENTS.SCRIPT_DOWNLOADED, { distro, apps: appCount });
    },

    /** Track GitHub link click */
    githubClicked: () => {
        track(EVENTS.GITHUB_CLICKED);
    },

    /** Track contribute link click */
    contributeClicked: () => {
        track(EVENTS.CONTRIBUTE_CLICKED);
    },

    /** Track help popup opened */
    helpOpened: () => {
        track(EVENTS.HELP_OPENED);
    },

    /** Track help popup closed */
    helpClosed: () => {
        track(EVENTS.HELP_CLOSED);
    },

    /** Track theme change */
    themeChanged: (theme: 'light' | 'dark') => {
        track(EVENTS.THEME_CHANGED, { theme });
    },

    /** Track category expand */
    categoryExpanded: (category: string) => {
        track(EVENTS.CATEGORY_EXPANDED, { category });
    },

    /** Track category collapse */
    categoryCollapsed: (category: string) => {
        track(EVENTS.CATEGORY_COLLAPSED, { category });
    },
};
