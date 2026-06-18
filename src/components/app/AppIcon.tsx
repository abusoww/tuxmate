'use client';

import { useState } from 'react';

export function AppIcon({ url, name }: { url: string; name: string }) {
    const [error, setError] = useState(false);

    if (error) {
        return (
            <div className="w-5 h-5 rounded-md bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center text-[11px] font-bold shrink-0">
                {name[0]}
            </div>
        );
    }

    return (
        <img
            src={url}
            alt=""
            aria-hidden="true"
            width={20}
            height={20}
            className="w-5 h-5 object-contain opacity-80 shrink-0"
            onError={() => setError(true)}
            loading="lazy"
        />
    );
}
