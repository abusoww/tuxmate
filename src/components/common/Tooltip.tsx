'use client';

import React, { useState, useEffect, useRef } from 'react';
import { type TooltipState } from '@/hooks/useTooltip';

interface TooltipProps {
    tooltip: TooltipState | null;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    setRef?: (el: HTMLDivElement | null) => void;
}

export function Tooltip({ tooltip, onMouseEnter, onMouseLeave, setRef }: TooltipProps) {
    const [current, setCurrent] = useState<TooltipState | null>(null);
    const [visible, setVisible] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        if (tooltip) {
            // eslint-disable-next-line
            setCurrent(tooltip);
            requestAnimationFrame(() => setVisible(true));
        } else {
            setVisible(false);
            timeoutRef.current = setTimeout(() => setCurrent(null), 60);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [tooltip]);

    if (!current) return null;

    const renderContent = (text: string) => {
        return text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g).map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i} className="font-medium text-[var(--text-primary)]">{part.slice(2, -2)}</strong>;
            }
            if (part.startsWith('`') && part.endsWith('`')) {
                return <code key={i} className="px-1 py-0.5 rounded bg-black/20 font-mono text-[var(--accent)] text-[11px]">{part.slice(1, -1)}</code>;
            }
            if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
                const match = part.match(/\[(.*?)\]\((.*?)\)/);
                if (match) {
                    return (
                        <a key={i} href={match[2]} target="_blank" rel="noopener noreferrer"
                            className="text-[var(--accent)] underline underline-offset-2 hover:brightness-125 transition-all"
                            onClick={(e) => e.stopPropagation()}>
                            {match[1]}
                        </a>
                    );
                }
            }
            return <span key={i}>{part}</span>;
        });
    };

    return (
        <div
            ref={setRef}
            role="tooltip"
            className="fixed hidden md:block pointer-events-auto z-[9999]"
            style={{ left: current.x, top: current.y - 10 }}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <div className={`
                absolute left-1/2 bottom-0 -translate-x-1/2
                transition-opacity duration-75
                ${visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            `}>
                {/* Clean tooltip bubble */}
                <div
                    className="px-3.5 py-2.5 rounded-lg shadow-lg overflow-hidden"
                    style={{
                        minWidth: '300px',
                        maxWidth: '300px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-primary)',
                    }}
                >
                    <p className="text-[13px] leading-[1.55] text-[var(--text-secondary)] break-words" style={{ wordBreak: 'break-word' }}>
                        {renderContent(current.content)}
                    </p>
                </div>

                {/* Arrow */}
                <div className="absolute left-1/2 -translate-x-1/2 -bottom-[5px]">
                    <div
                        className="w-2.5 h-2.5 rotate-45"
                        style={{
                            backgroundColor: 'var(--bg-secondary)',
                            borderRight: '1px solid var(--border-primary)',
                            borderBottom: '1px solid var(--border-primary)',
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
