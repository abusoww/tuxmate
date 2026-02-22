'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface AurFloatingCardProps {
    show: boolean;
    aurAppNames: string[];
    hasYayInstalled: boolean;
    setHasYayInstalled: (value: boolean) => void;
    selectedHelper: 'yay' | 'paru';
    setSelectedHelper: (helper: 'yay' | 'paru') => void;
}

// AUR setup prompt.
export function AurFloatingCard({
    show,
    aurAppNames,
    setHasYayInstalled,
    selectedHelper,
    setSelectedHelper,
}: AurFloatingCardProps) {
    const [dismissed, setDismissed] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [hasAnswered, setHasAnswered] = useState<boolean | null>(null);
    const [helperChosen, setHelperChosen] = useState(false);
    const userInteractedRef = useRef(false);

    // Reset on new AUR packages if no interaction
    useEffect(() => {
        if (show && aurAppNames.length > 0 && !userInteractedRef.current) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setDismissed(false);
            setIsExiting(false);
            setShowConfirmation(false);
            setHelperChosen(false);
            setHasAnswered(null);
        }
    }, [aurAppNames.length, show]);

    if (!show || dismissed) return null;

    const handleFirstAnswer = (hasHelper: boolean) => {
        setHasYayInstalled(hasHelper);
        setHasAnswered(hasHelper);
    };

    const handleHelperSelect = (helper: 'yay' | 'paru') => {
        setSelectedHelper(helper);
        setHelperChosen(true);
        userInteractedRef.current = true;

        setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => {
                setShowConfirmation(true);
            }, 250);
        }, 400);
    };

    const handleDismiss = () => {
        userInteractedRef.current = true;
        setIsExiting(true);
        setTimeout(() => {
            setDismissed(true);
            setIsExiting(false);
        }, 200);
    };

    if (showConfirmation) {
        setTimeout(() => {
            setDismissed(true);
        }, 3000);

        return (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 md:left-auto md:right-4 md:translate-x-0 z-30">
                <p
                    className="text-[13px] text-[var(--text-muted)] text-center md:text-right"
                    style={{
                        animation: 'slideInFromRight 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                    }}
                >
                    You can change this later in preview tab
                </p>
            </div>
        );
    }

    if (isExiting && helperChosen) {
        return (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 md:left-auto md:right-4 md:translate-x-0 z-30 flex flex-col gap-3 items-center md:items-end">
                <div
                    className="w-72 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl shadow-lg overflow-hidden"
                    style={{ animation: 'slideOutToRight 0.25s ease-out forwards' }}
                >
                    <div className="p-4" />
                </div>
                {hasAnswered !== null && (
                    <div
                        className="w-72 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl shadow-lg overflow-hidden"
                        style={{ animation: 'slideOutToRight 0.2s ease-out forwards' }}
                    >
                        <div className="p-4" />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 md:left-auto md:right-4 md:translate-x-0 z-30 flex flex-col gap-3 items-center md:items-end">
            <div
                className={`
                    w-72 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl shadow-lg
                    overflow-hidden
                    transition-[box-shadow] duration-200
                `}
                style={{
                    animation: isExiting
                        ? 'slideOutToRight 0.2s ease-out forwards'
                        : 'slideInFromRight 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                }}
            >
                <div className="px-4 py-3 flex items-start justify-between gap-3">
                    <div className="flex-1">
                        <p className="text-[11px] text-[var(--text-muted)] tracking-wide uppercase mb-1">
                            {aurAppNames.length} AUR package{aurAppNames.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-[15px] text-[var(--text-primary)] font-medium leading-snug">
                            Do you have an AUR helper?
                        </p>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="text-[var(--text-muted)]/60 hover:text-[var(--text-primary)] transition-colors duration-150 p-1 -mr-1 -mt-1 rounded-lg hover:bg-[var(--bg-hover)]"
                        title="Dismiss"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="px-4 pb-3 flex gap-2">
                    <button
                        onClick={() => handleFirstAnswer(true)}
                        className={`
                            flex-1 py-2 px-4 rounded-lg text-sm font-medium 
                            transition-[background-color,color] duration-200 ease-out
                            ${hasAnswered === true
                                ? 'bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] shadow-sm'
                                : 'bg-[var(--bg-tertiary)]/70 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                            }
                        `}
                    >
                        Yes
                    </button>
                    <button
                        onClick={() => handleFirstAnswer(false)}
                        className={`
                            flex-1 py-2 px-4 rounded-lg text-sm font-medium 
                            transition-[background-color,color] duration-200 ease-out
                            ${hasAnswered === false
                                ? 'bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] shadow-sm'
                                : 'bg-[var(--bg-tertiary)]/70 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                            }
                        `}
                    >
                        No
                    </button>
                </div>

                <div className="px-4 pb-3 -mt-1">
                    <p className="text-[10px] text-[var(--text-muted)]/50 leading-relaxed">
                        Change anytime in preview window
                    </p>
                </div>
            </div>

            {hasAnswered !== null && (
                <div
                    className={`
                        w-72 bg-[var(--bg-primary)] border border-[var(--border-primary)] rounded-xl shadow-lg
                        overflow-hidden
                    `}
                    style={{
                        animation: isExiting
                            ? 'slideOutToRight 0.15s ease-out forwards'
                            : 'slideInFromRightSecond 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s forwards',
                        opacity: 0
                    }}
                >
                    <div className="px-4 py-3 flex items-center justify-between gap-3">
                        <p className="text-[15px] text-[var(--text-primary)] font-medium">
                            {hasAnswered
                                ? 'Which one do you have?'
                                : 'Which one to install?'
                            }
                        </p>
                        <button
                            onClick={handleDismiss}
                            className="text-[var(--text-muted)]/60 hover:text-[var(--text-primary)] transition-colors duration-150 p-1 -mr-1 rounded-lg hover:bg-[var(--bg-hover)]"
                            title="Dismiss"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="px-4 pb-4 flex gap-2">
                        <button
                            onClick={() => handleHelperSelect('yay')}
                            className={`
                                flex-1 py-2.5 px-4 rounded-lg text-sm font-medium 
                                transition-[background-color,color] duration-200 ease-out
                                ${selectedHelper === 'yay' && helperChosen
                                    ? 'bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] shadow-sm'
                                    : 'bg-[var(--bg-tertiary)]/70 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                                }
                            `}
                        >
                            <span className="block font-semibold">yay</span>
                            <span className={`block text-[10px] mt-0.5 ${selectedHelper === 'yay' && helperChosen ? 'opacity-70' : 'opacity-50'}`}>
                                recommended
                            </span>
                        </button>
                        <button
                            onClick={() => handleHelperSelect('paru')}
                            className={`
                                flex-1 py-2.5 px-4 rounded-lg text-sm font-medium 
                                transition-[background-color,color] duration-200 ease-out
                                ${selectedHelper === 'paru' && helperChosen
                                    ? 'bg-[var(--bg-secondary)] border border-[var(--border-primary)] text-[var(--text-primary)] shadow-sm'
                                    : 'bg-[var(--bg-tertiary)]/70 text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                                }
                            `}
                        >
                            <span className="block font-semibold">paru</span>
                            <span className={`block text-[10px] mt-0.5 ${selectedHelper === 'paru' && helperChosen ? 'opacity-70' : 'opacity-50'}`}>
                                rust-based
                            </span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
