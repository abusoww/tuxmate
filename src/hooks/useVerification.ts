'use client';

import { useCallback } from 'react';
import type { DistroId } from '@/lib/data';
import { isFlathubVerified } from '@/lib/verification';

export interface UseVerificationResult {
    isLoading: boolean;
    hasError: boolean;
    isVerified: (distro: DistroId, packageName: string) => boolean;
    getVerificationSource: (distro: DistroId, packageName: string) => 'flathub' | null;
}

export function useVerification(): UseVerificationResult {
    const isVerified = useCallback((distro: DistroId, packageName: string): boolean => {
        if (distro === 'flatpak') {
            return isFlathubVerified(packageName);
        }
        return false;
    }, []);

    const getVerificationSource = useCallback((distro: DistroId, packageName: string): 'flathub' | null => {
        if (distro === 'flatpak' && isFlathubVerified(packageName)) {
            return 'flathub';
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
