'use client';

import { useCallback } from 'react';
import type { DistroId } from '@/lib/data';
import {
    isFlathubVerified,
    isSnapVerified,
} from '@/lib/verification';

export interface UseVerificationResult {
    isLoading: boolean;
    hasError: boolean;
    isVerified: (distro: DistroId, packageName: string) => boolean;
    getVerificationSource: (distro: DistroId, packageName: string) => 'flathub' | 'snap' | null;
}

export function useVerification(): UseVerificationResult {
    const isVerified = useCallback((distro: DistroId, packageName: string): boolean => {
        if (distro === 'flatpak') {
            return isFlathubVerified(packageName);
        }
        if (distro === 'snap') {
            return isSnapVerified(packageName);
        }
        return false;
    }, []);

    const getVerificationSource = useCallback((distro: DistroId, packageName: string): 'flathub' | 'snap' | null => {
        if (distro === 'flatpak' && isFlathubVerified(packageName)) {
            return 'flathub';
        }
        if (distro === 'snap' && isSnapVerified(packageName)) {
            return 'snap';
        }
        return null;
    }, []);

    return {
        isLoading: false,
        hasError: false,
        isVerified,
        getVerificationSource,
    };
}

