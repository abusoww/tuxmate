'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { DistroId } from '@/lib/data';
import {
    fetchFlathubVerifiedApps,
    isFlathubVerified,
    isSnapVerified,
} from '@/lib/verification';

export interface UseVerificationResult {
    isLoading: boolean;
    hasError: boolean;
    isVerified: (distro: DistroId, packageName: string) => boolean;
    getVerificationSource: (distro: DistroId, packageName: string) => 'flathub' | 'snap' | null;
}

// Fetches Flathub data on mount, Snap uses static list (instant)
export function useVerification(): UseVerificationResult {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [flathubReady, setFlathubReady] = useState(false);
    const fetchedRef = useRef(false);

    useEffect(() => {
        if (fetchedRef.current) return;
        fetchedRef.current = true;

        let isMounted = true;

        fetchFlathubVerifiedApps()
            .then(() => {
                if (isMounted) setFlathubReady(true);
            })
            .catch((error) => {
                if (isMounted) {
                    console.error('Failed to fetch Flathub verification:', error);
                    setHasError(true);
                }
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, []);

    // Check if package is verified for the distro
    const isVerified = useCallback((distro: DistroId, packageName: string): boolean => {
        if (distro === 'flatpak' && flathubReady) {
            return isFlathubVerified(packageName);
        }
        if (distro === 'snap') {
            return isSnapVerified(packageName);
        }
        return false;
    }, [flathubReady]);

    // Get verification source for badge styling
    const getVerificationSource = useCallback((distro: DistroId, packageName: string): 'flathub' | 'snap' | null => {
        if (distro === 'flatpak' && flathubReady && isFlathubVerified(packageName)) {
            return 'flathub';
        }
        if (distro === 'snap' && isSnapVerified(packageName)) {
            return 'snap';
        }
        return null;
    }, [flathubReady]);

    return {
        isLoading,
        hasError,
        isVerified,
        getVerificationSource,
    };
}
