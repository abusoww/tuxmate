'use client';

import React from 'react';

export interface TooltipData {
    text: string;
    x: number;
    y: number;
    width: number;
    key: number;
}

interface TooltipProps {
    tooltip: TooltipData | null;
    onEnter?: () => void;
    onLeave?: () => void;
}

// Floating tooltip with markdown rendering - follows the cursor around
export function Tooltip({ tooltip, onEnter, onLeave }: TooltipProps) {
    if (!tooltip) return null;

    // Center horizontally relative to the element
    const left = tooltip.x;
    const top = tooltip.y;

    // Helper to render markdown content
    const renderContent = (text: string) => {
        // Split by **bold**, `code`, or [link](url)
        return text.split(/(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g).map((part, i) => {
            // Bold
            if (part.startsWith('**') && part.endsWith('**')) {
                return (
                    <strong key={i} className="font-bold text-[var(--accent)]">
                        {part.slice(2, -2)}
                    </strong>
                );
            }
            // Code
            if (part.startsWith('`') && part.endsWith('`')) {
                return (
                    <code key={i} className="bg-[var(--bg-secondary)] px-1 rounded font-mono text-[var(--accent)] text-[10px]">
                        {part.slice(1, -1)}
                    </code>
                );
            }
            // Link
            if (part.startsWith('[') && part.includes('](') && part.endsWith(')')) {
                const match = part.match(/\[(.*?)\]\((.*?)\)/);
                if (match) {
                    return (
                        <a
                            key={i}
                            href={match[2]}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[var(--accent)] underline decoration-[var(--accent)]/50 hover:decoration-[var(--accent)] font-semibold transition-colors hover:text-emerald-500"
                            onClick={(e) => e.stopPropagation()} // Prevent triggering parent clicks
                        >
                            {match[1]}
                        </a>
                    );
                }
            }
            return <span key={i}>{part}</span>;
        });
    };

    // Hide tooltips on mobile - they don't work with touch
    return (
        <div
            role="tooltip"
            className="hidden md:block fixed z-50 pointer-events-auto"
            style={{
                left: left,
                top: top,
                transform: 'translate(-50%, -100%)',
                // Using the specific key ensures fresh animation on new tooltip
                animation: 'tooltipSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                maxWidth: '400px', // Limit width
                width: 'max-content'
            }}
            onMouseEnter={onEnter}
            onMouseLeave={onLeave}
        >
            <div className="relative mb-2 px-3 py-2 rounded-lg bg-[var(--bg-tertiary)] text-[var(--text-primary)] text-xs font-medium shadow-xl border border-[var(--border-primary)]/40 backdrop-blur-sm whitespace-normal break-words leading-relaxed">
                {renderContent(tooltip.text)}

                {/* Arrow pointer */}
                <div
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[var(--bg-tertiary)] border-b border-r border-[var(--border-primary)]/40 rotate-45"
                />
            </div>
        </div>
    );
}
