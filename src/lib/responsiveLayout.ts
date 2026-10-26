/**
 * Desktop breakpoints reserve 280px per column after the fixed sidebar, main padding,
 * and grid gaps: 3 columns fit at 1372px; 4 fit at 1684px. Keep page.tsx aligned.
 */
export const APP_GRID_THREE_COLUMN_BREAKPOINT = 1372;
export const APP_GRID_FOUR_COLUMN_BREAKPOINT = 1684;

export function getAppGridColumnCount(viewportWidth: number): 2 | 3 | 4 {
    if (viewportWidth >= APP_GRID_FOUR_COLUMN_BREAKPOINT) return 4;
    if (viewportWidth >= APP_GRID_THREE_COLUMN_BREAKPOINT) return 3;
    return 2;
}
