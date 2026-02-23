

declare global {
    interface Window {
        umami?: {
            track: (eventName: string, eventData?: Record<string, string | number | boolean>) => void;
        };
    }
}

export function track(
    eventName: string,
    eventData?: Record<string, string | number | boolean>
): void {
    if (typeof window !== 'undefined' && window.umami) {
        window.umami.track(eventName, eventData);
    }
}

export const EVENTS = {
    DISTRO_SELECTED: 'Distro Selected',

    APP_SELECTED: 'App Selected',
    APP_DESELECTED: 'App Deselected',

    COMMAND_COPIED: 'Command Copied',
    SCRIPT_DOWNLOADED: 'Script Downloaded',

    GITHUB_CLICKED: 'GitHub Clicked',
    CONTRIBUTE_CLICKED: 'Contribute Clicked',

    HELP_OPENED: 'How It Works Opened',
    HELP_CLOSED: 'How It Works Closed',
    THEME_CHANGED: 'Theme Changed',
    CATEGORY_EXPANDED: 'Category Expanded',
    CATEGORY_COLLAPSED: 'Category Collapsed',
} as const;

export const analytics = {
    distroSelected: (distro: string) => {
        track(EVENTS.DISTRO_SELECTED, { distro });
    },
    appSelected: (app: string, category: string, distro: string) => {
        track(EVENTS.APP_SELECTED, { app, category, distro });
    },
    appDeselected: (app: string, category: string, distro: string) => {
        track(EVENTS.APP_DESELECTED, { app, category, distro });
    },
    commandCopied: (distro: string, appCount: number) => {
        track(EVENTS.COMMAND_COPIED, { distro, apps: appCount });
    },
    scriptDownloaded: (distro: string, appCount: number) => {
        track(EVENTS.SCRIPT_DOWNLOADED, { distro, apps: appCount });
    },
    githubClicked: () => {
        track(EVENTS.GITHUB_CLICKED);
    },
    contributeClicked: () => {
        track(EVENTS.CONTRIBUTE_CLICKED);
    },
    helpOpened: () => {
        track(EVENTS.HELP_OPENED);
    },
    helpClosed: () => {
        track(EVENTS.HELP_CLOSED);
    },
    themeChanged: (theme: 'light' | 'dark') => {
        track(EVENTS.THEME_CHANGED, { theme });
    },
    categoryExpanded: (category: string) => {
        track(EVENTS.CATEGORY_EXPANDED, { category });
    },
    categoryCollapsed: (category: string) => {
        track(EVENTS.CATEGORY_COLLAPSED, { category });
    },
};
