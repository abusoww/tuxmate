'use client';

import { Heart } from 'lucide-react';
import { analytics } from '@/lib/analytics';

// Heart icon link to CONTRIBUTING.md
export function ContributeLink({ href = "https://github.com/abusoww/tuxmate/blob/main/CONTRIBUTING.md" }: { href?: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Contribute to ParchMate on GitHub"
            className="group flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors duration-300"
            onClick={() => analytics.contributeClicked()}
        >
            <Heart className="w-4 h-4 transition-[color,transform] duration-300 group-hover:text-rose-400 group-hover:scale-110" />
            <span className="hidden sm:inline relative">
                Contribute
                <span className="absolute bottom-0 left-0 w-0 h-px bg-[var(--text-muted)] transition-[width] duration-300 group-hover:w-full" />
            </span>
        </a>
    );
}
