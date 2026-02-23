'use client';

import { useState } from 'react';

export function DistroIcon({ url, name, size = 20 }: { url: string; name: string; size?: number }) {
    const [error, setError] = useState(false);

    if (error) {
        return (
            <div
                className="rounded-full bg-[var(--accent)] flex items-center justify-center text-xs font-bold text-white"
                style={{ width: size, height: size }}
            >
                {name[0]}
            </div>
        );
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
            src={url}
            alt=""
            aria-hidden="true"
            width={size}
            height={size}
            className="object-contain"
            style={{ width: size, height: size }}
            onError={() => setError(true)}
        />
    );
}
