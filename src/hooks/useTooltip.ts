'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

export interface TooltipState {
    content: string;
    x: number;
    y: number;
}

// Tooltip hook.
export function useTooltip() {
    const [tooltip, setTooltip] = useState<TooltipState | null>(null);
    const showTimeout = useRef<NodeJS.Timeout | null>(null);
    const hideTimeout = useRef<NodeJS.Timeout | null>(null);
    const isOverTrigger = useRef(false);
    const isOverTooltip = useRef(false);
    const tooltipRef = useRef<HTMLDivElement | null>(null);

    const setTooltipRef = useCallback((el: HTMLDivElement | null) => {
        tooltipRef.current = el;
    }, []);

    const cancel = useCallback(() => {
        if (showTimeout.current) {
            clearTimeout(showTimeout.current);
            showTimeout.current = null;
        }
        if (hideTimeout.current) {
            clearTimeout(hideTimeout.current);
            hideTimeout.current = null;
        }
    }, []);

    const tryHide = useCallback(() => {
        cancel();
        hideTimeout.current = setTimeout(() => {
            if (!isOverTrigger.current && !isOverTooltip.current) {
                setTooltip(null);
            }
        }, 100);
    }, [cancel]);

    const show = useCallback((content: string, e: React.MouseEvent) => {
        const target = e.currentTarget as HTMLElement;
        isOverTrigger.current = true;
        cancel();

        const rect = target.getBoundingClientRect();
        const clientX = e.clientX;

        const zoom = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;

        showTimeout.current = setTimeout(() => {
            setTooltip({
                content,
                x: clientX / zoom,
                y: rect.top / zoom,
            });
        }, 450);
    }, [cancel]);

    const hide = useCallback(() => {
        isOverTrigger.current = false;
        tryHide();
    }, [tryHide]);

    const tooltipMouseEnter = useCallback(() => {
        isOverTooltip.current = true;
        cancel();
    }, [cancel]);

    const tooltipMouseLeave = useCallback(() => {
        isOverTooltip.current = false;
        tryHide();
    }, [tryHide]);

    useEffect(() => {
        const dismiss = (e: MouseEvent) => {
            if (tooltipRef.current && tooltipRef.current.contains(e.target as Node)) {
                return;
            }
            cancel();
            isOverTrigger.current = false;
            isOverTooltip.current = false;
            setTooltip(null);
        };

        const dismissOnScroll = () => {
            cancel();
            isOverTrigger.current = false;
            isOverTooltip.current = false;
            setTooltip(null);
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') dismissOnScroll();
        };

        window.addEventListener('mousedown', dismiss, true);
        window.addEventListener('scroll', dismissOnScroll, true);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            cancel();
            window.removeEventListener('mousedown', dismiss, true);
            window.removeEventListener('scroll', dismissOnScroll, true);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [cancel]);

    return { tooltip, show, hide, tooltipMouseEnter, tooltipMouseLeave, setTooltipRef };
}
