import { describe, it, expect } from 'vitest';
import { distros, apps, categories, getAppsByCategory, isAppAvailable } from '@/lib/data';

describe('Data Module', () => {
    describe('distros', () => {
        it('should have valid install prefixes', () => {
            distros.forEach(distro => {
                expect(distro.installPrefix).toBeTruthy();
                expect(typeof distro.installPrefix).toBe('string');
            });
        });

        it('should have icon URLs', () => {
            distros.forEach(distro => {
                expect(distro.iconUrl).toBeTruthy();
                expect(distro.iconUrl).toMatch(/^(https?:\/\/|\/)/);
            });
        });

        it('should have exactly arch and flatpak', () => {
            const ids = distros.map(d => d.id);
            expect(ids).toContain('arch');
            expect(ids).toContain('flatpak');
            expect(ids.length).toBe(2);
        });
    });

    describe('apps', () => {
        it('should have many apps', () => {
            expect(apps.length).toBeGreaterThan(150);
        });

        it('should have required fields for each app', () => {
            apps.forEach(app => {
                expect(app.id).toBeTruthy();
                expect(app.name).toBeTruthy();
                expect(app.description).toBeTruthy();
                expect(app.category).toBeTruthy();
                expect(app.iconUrl).toBeTruthy();
                expect(app.targets).toBeDefined();
            });
        });

        it('should have unique IDs', () => {
            const ids = apps.map(a => a.id);
            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(ids.length);
        });

        it('should have valid categories', () => {
            apps.forEach(app => {
                expect(categories).toContain(app.category);
            });
        });
    });

    describe('categories', () => {
        it('should have expected categories', () => {
            expect(categories).toContain('Web Browsers');
            expect(categories).toContain('Communication');
            expect(categories).toContain('Dev: Editors');
            expect(categories).toContain('Gaming');
        });
    });

    describe('getAppsByCategory', () => {
        it('should return apps for a valid category', () => {
            const browsers = getAppsByCategory('Web Browsers');
            expect(browsers.length).toBeGreaterThan(0);
            browsers.forEach(app => {
                expect(app.category).toBe('Web Browsers');
            });
        });

        it('should return empty array for invalid category', () => {
            // @ts-expect-error Testing invalid input
            const result = getAppsByCategory('Invalid Category');
            expect(result).toEqual([]);
        });
    });

    describe('isAppAvailable', () => {
        it('should return true for Firefox on Arch', () => {
            const firefox = apps.find(a => a.id === 'firefox');
            expect(firefox).toBeDefined();
            expect(isAppAvailable(firefox!, 'arch')).toBe(true);
        });

        it('should return true for Firefox on Flatpak', () => {
            const firefox = apps.find(a => a.id === 'firefox');
            expect(firefox).toBeDefined();
            expect(isAppAvailable(firefox!, 'flatpak')).toBe(true);
        });

        it('should return false for apps not on distro', () => {
            // ohmyzsh has no targets defined for any distro
            const ohmyzsh = apps.find(a => a.id === 'ohmyzsh');
            expect(ohmyzsh).toBeDefined();
            expect(isAppAvailable(ohmyzsh!, 'arch')).toBe(false);
            expect(isAppAvailable(ohmyzsh!, 'flatpak')).toBe(false);
        });
    });
});
