'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AurFloatingCardProps {
    show: boolean;
    aurAppNames: string[];
    hasYayInstalled: boolean;
    setHasYayInstalled: (value: boolean) => void;
    selectedHelper: 'yay' | 'paru';
    setSelectedHelper: (helper: 'yay' | 'paru') => void;
}

/**
 * AurFloatingCard - Elegant floating notification cards for AUR helper configuration
 * Smooth spring animations, auto-dismisses after selection
 */
export function AurFloatingCard({
    show,
    aurAppNames,
    hasYayInstalled,
    setHasYayInstalled,
    selectedHelper,
    setSelectedHelper,
}: AurFloatingCardProps) {
    const [dismissed, setDismissed] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    // Track if user has answered the first question
    const [hasAnswered, setHasAnswered] = useState<boolean | null>(null);
    // Track if user has selected a helper (completed flow)
    const [helperChosen, setHelperChosen] = useState(false);
    // Track if user has interacted (dismissed or selected) to prevent nagging
    const [userInteracted, setUserInteracted] = useState(false);

    // Reset when new AUR packages appear, BUT ONLY if user hasn't interacted yet
    useEffect(() => {
        if (show && aurAppNames.length > 0 && !userInteracted) {
            setDismissed(false);
            setIsExiting(false);
            setShowConfirmation(false);
            setHelperChosen(false);
            setHasAnswered(null);
        }
    }, [aurAppNames.length, show, userInteracted]);

    if (!show || dismissed) return null;

    const handleFirstAnswer = (hasHelper: boolean) => {
        setHasYayInstalled(hasHelper);
        setHasAnswered(hasHelper);
    };

    const handleHelperSelect = (helper: 'yay' | 'paru') => {
        setSelectedHelper(helper);
        setHelperChosen(true);
        setUserInteracted(true); // Don't ask again

        // Start exit animation after a brief moment
        setTimeout(() => {
            setIsExiting(true);
            setTimeout(() => {
                setShowConfirmation(true);
            }, 250);
        }, 400);
    };

    const handleDismiss = () => {
        setUserInteracted(true); // Don't ask again
        setIsExiting(true);
        setTimeout(() => {
            setDismissed(true);
            setIsExiting(false);
        }, 200);
    };

    const handleConfirmationDismiss = () => {
        setDismissed(true);
    };

    // Show confirmation message after selecting helper, auto-dismiss after 3s
    if (showConfirmation) {
        // Auto dismiss after 3 seconds
        setTimeout(() => {
            setDismissed(true);
        }, 3000);

        return (
            <div className="fixed bottom-24 right-4 z-30">
                <p
                    className="text-[13px] text-[var(--text-muted)]"
                    style={{
                        animation: 'cardSlideIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                    }}
                >
                    You can change this later in preview tab
                </p>
            </div>
        );
    }

    // Hide cards while exiting
    if (isExiting && helperChosen) {
        return (
            <div className="fixed bottom-24 right-4 z-30 flex flex-col gap-3 items-end">
                <div
                    className="w-72 bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)]/60 rounded-2xl shadow-xl shadow-black/10 overflow-hidden"
                    style={{ animation: 'cardSlideOut 0.25s ease-out forwards' }}
                >
                    <div className="p-4" />
                </div>
                {hasAnswered !== null && (
                    <div
                        className="w-72 bg-[var(--bg-secondary)] backdrop-blur-xl border border-[var(--border-primary)]/60 rounded-2xl shadow-xl shadow-black/10 overflow-hidden"
                        style={{ animation: 'cardSlideOut 0.2s ease-out forwards' }}
                    >
                        <div className="p-4" />
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="fixed bottom-24 right-4 z-30 flex flex-col gap-3 items-end">
            {/* Card 1: Do you have an AUR helper? */}
            <div
                className={`
                    w-72 bg-[var(--bg-secondary)] backdrop-blur-xl 
                    border border-[var(--border-primary)]/60 
                    rounded-2xl shadow-xl shadow-black/10
                    overflow-hidden
                    transition-all duration-200
                `}
                style={{
                    animation: isExiting
                        ? 'cardSlideOut 0.2s ease-out forwards'
                        : 'cardSlideIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
                }}
            >
                {/* Header */}
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

                {/* Buttons */}
                <div className="px-4 pb-3 flex gap-2">
                    <button
                        onClick={() => handleFirstAnswer(true)}
                        className={`
                            flex-1 py-2 px-4 rounded-xl text-sm font-medium 
                            transition-all duration-200 ease-out
                            ${hasAnswered === true
                                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm'
                                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                            }
                        `}
                    >
                        Yes
                    </button>
                    <button
                        onClick={() => handleFirstAnswer(false)}
                        className={`
                            flex-1 py-2 px-4 rounded-xl text-sm font-medium 
                            transition-all duration-200 ease-out
                            ${hasAnswered === false
                                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm'
                                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
                            }
                        `}
                    >
                        No
                    </button>
                </div>

                {/* Hint */}
                <div className="px-4 pb-3 -mt-1">
                    <p className="text-[10px] text-[var(--text-muted)]/50 leading-relaxed">
                        Change anytime in preview window
                    </p>
                </div>
            </div>

            {/* Card 2: Which helper? (appears after first answer) */}
            {hasAnswered !== null && (
                <div
                    className={`
                        w-72 bg-[var(--bg-secondary)] backdrop-blur-xl 
                        border border-[var(--border-primary)]/60 
                        rounded-2xl shadow-xl shadow-black/10
                        overflow-hidden
                    `}
                    style={{
                        animation: isExiting
                            ? 'cardSlideOut 0.15s ease-out forwards'
                            : 'cardSlideInSecond 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) 0.05s forwards',
                        opacity: 0
                    }}
                >
                    {/* Header */}
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

                    {/* Helper selection */}
                    <div className="px-4 pb-4 flex gap-2">
                        <button
                            onClick={() => handleHelperSelect('yay')}
                            className={`
                                flex-1 py-2.5 px-4 rounded-xl text-sm font-medium 
                                transition-all duration-200 ease-out
                                ${selectedHelper === 'yay' && helperChosen
                                    ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm'
                                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
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
                                flex-1 py-2.5 px-4 rounded-xl text-sm font-medium 
                                transition-all duration-200 ease-out
                                ${selectedHelper === 'paru' && helperChosen
                                    ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm'
                                    : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
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
