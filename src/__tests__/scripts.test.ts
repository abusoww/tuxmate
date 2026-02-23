import { describe, it, expect } from 'vitest';
import { generateArchScript } from '@/lib/scripts/arch';
import { generateUbuntuScript } from '@/lib/scripts/ubuntu';
import { generateFlatpakScript } from '@/lib/scripts/flatpak';
import type { PackageInfo } from '@/lib/scripts/shared';
import type { AppData } from '@/lib/data';

// Mock AppData objects
const mockAppOfficial: AppData = {
    id: 'mock-official',
    name: 'Mock Official App',
    description: 'A mock app from official repos',
    category: 'System',
    icon: { type: 'iconify', set: 'mdi', name: 'test' },
    targets: { arch: 'mock-pkg', ubuntu: 'mock-pkg', flatpak: 'org.mock.App' }
};

const mockAppAur: AppData = {
    id: 'mock-aur',
    name: 'Mock AUR App',
    description: 'A mock app from AUR',
    category: 'System',
    icon: { type: 'iconify', set: 'mdi', name: 'test' },
    targets: { arch: 'mock-aur-bin' }
};

describe('Script Generators', () => {
    describe('Arch Linux Generator', () => {
        const officialPkg: PackageInfo = { app: mockAppOfficial, pkg: 'mock-pkg' };
        const aurPkg: PackageInfo = { app: mockAppAur, pkg: 'mock-aur-bin' };

        it('should generate script for official packages only', () => {
            const script = generateArchScript([officialPkg]);
            expect(script).toContain('sudo pacman');
            expect(script).toContain('install_pkg "Mock Official App" "mock-pkg" "sudo pacman"');
            expect(script).not.toContain('yay');
            expect(script).not.toContain('paru');
        });

        it('should include AUR helper logic if AUR packages are present', () => {
            const scriptWithYay = generateArchScript([officialPkg, aurPkg], 'yay');
            expect(scriptWithYay).toContain('command -v yay');
            expect(scriptWithYay).toContain('install_pkg "Mock AUR App" "mock-aur-bin" "yay"');

            const scriptWithParu = generateArchScript([officialPkg, aurPkg], 'paru');
            expect(scriptWithParu).toContain('command -v paru');
            expect(scriptWithParu).toContain('install_pkg "Mock AUR App" "mock-aur-bin" "paru"');
        });

        it('should contain standard bash boilerplates', () => {
            const script = generateArchScript([officialPkg]);
            expect(script).toContain('#!/bin/bash');
            expect(script).toContain('set -euo pipefail');
            expect(script).toContain('wait_for_lock');
        });
    });

    describe('Ubuntu/Debian Generator', () => {
        const pkg: PackageInfo = { app: mockAppOfficial, pkg: 'mock-pkg' };

        it('should generate apt install commands', () => {
            const script = generateUbuntuScript([pkg]);
            expect(script).toContain('sudo apt-get update');
            expect(script).toContain('install_pkg "Mock Official App" "mock-pkg"');
        });
    });

    describe('Flatpak Generator', () => {
        const pkg: PackageInfo = { app: mockAppOfficial, pkg: 'org.mock.App' };

        it('should add flathub remote and install app', () => {
            const script = generateFlatpakScript([pkg]);
            expect(script).toContain('flatpak remote-add --if-not-exists flathub');
            expect(script).toContain('install_pkg "Mock Official App" "org.mock.App"');
        });
    });
});
