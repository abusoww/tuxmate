'use client';

import { useState } from 'react';
import { Check, Copy, X, Download, Beaker } from 'lucide-react';
import { AurDrawerSettings } from './AurDrawerSettings';
import { cn } from '@/lib/utils';
import { generateNixFlake, generateNixProfileCommand } from '@/lib/scripts';
import { type DistroId, type AppData } from '@/lib/data';
import { useI18n } from '@/hooks/useI18n';

interface CommandDrawerProps {
    isOpen: boolean;
    isClosing: boolean;
    onClose: () => void;
    command: string;
    selectedCount: number;
    selectedDistro: DistroId;
    copied: boolean;
    onCopy: () => void;
    onDownload: () => void;
    showAur: boolean;
    aurAppNames: string[];
    hasYayInstalled: boolean;
    setHasYayInstalled: (value: boolean) => void;
    selectedHelper: 'yay' | 'paru';
    setSelectedHelper: (helper: 'yay' | 'paru') => void;
    nixPackages: { app: AppData; pkg: string }[];
    showNixGenerator: boolean;
}

export function CommandDrawer({
    isOpen,
    isClosing,
    onClose,
    command,
    selectedCount,
    selectedDistro,
    copied,
    onCopy,
    onDownload,
    showAur,
    aurAppNames,
    hasYayInstalled,
    setHasYayInstalled,
    selectedHelper,
    setSelectedHelper,
    nixPackages,
    showNixGenerator,
}: CommandDrawerProps) {
    const [activeTab, setActiveTab] = useState<'distro' | 'nix'>('distro');
    const { t, fmt, dir } = useI18n();
    const isRtl = dir === 'rtl';

    if (!isOpen) return null;

    const handleCopyAndClose = () => {
        onCopy();
        setTimeout(onClose, 3000);
    };

    const appsLabel = selectedCount === 1
        ? fmt(t.footer.appsCount, { count: selectedCount })
        : fmt(t.footer.appsCount_plural, { count: selectedCount });

    return (
        <>
            <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
                onClick={onClose}
                aria-hidden="true"
                style={{ animation: isClosing ? 'fadeOut 0.3s ease-out forwards' : 'fadeIn 0.3s ease-out' }}
            />

            <div
                role="dialog"
                aria-modal="true"
                aria-labelledby="drawer-title"
                className="fixed z-50 bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-2xl
                    bottom-0 left-0 right-0 rounded-t-2xl
                    md:bottom-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:max-w-2xl md:w-[90vw]"
                style={{
                    animation: isClosing
                        ? 'slideDown 0.3s cubic-bezier(0.32, 0, 0.67, 0) forwards'
                        : 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                    maxHeight: '80vh'
                }}
            >
                <div className="flex justify-center pt-3 pb-2 md:hidden">
                    <button
                        className="w-12 h-1.5 bg-[var(--text-muted)]/40 rounded-full cursor-pointer hover:bg-[var(--text-muted)] transition-colors"
                        onClick={onClose}
                        aria-label="Close drawer"
                    />
                </div>

                <div className={`flex items-center justify-between px-4 sm:px-6 pb-3 md:pt-4 border-b border-[var(--border-primary)] ${isRtl ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex items-center gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                            <span className="text-emerald-500 font-bold text-sm">$</span>
                        </div>
                        <div className={`${isRtl ? 'text-right' : ''}`}>
                            <h3 id="drawer-title" className="text-sm font-semibold text-[var(--text-primary)]">{t.footer.terminalCommand}</h3>
                            <p className="text-xs text-[var(--text-muted)]">{appsLabel} &bull; {t.footer.pressEsc}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[var(--bg-hover)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                        aria-label="Close drawer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 sm:p-6 overflow-y-auto" style={{ maxHeight: 'calc(80vh - 200px)' }}>
                    {showAur && (
                        <AurDrawerSettings
                            aurAppNames={aurAppNames}
                            hasYayInstalled={hasYayInstalled}
                            setHasYayInstalled={setHasYayInstalled}
                            selectedHelper={selectedHelper}
                            setSelectedHelper={setSelectedHelper}
                        />
                    )}

                    {/* Tab bar for distro vs experimental */}
                    <div className="flex gap-1 mb-3 bg-[var(--bg-tertiary)] rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab('distro')}
                            className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all ${
                                activeTab === 'distro'
                                    ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-sm'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                            }`}
                        >
                            {selectedDistro === 'arch' ? t.distro.parch : t.distro.flatpak}
                        </button>
                        {showNixGenerator && (
                            <button
                                onClick={() => setActiveTab('nix')}
                                className={`flex-1 py-1.5 px-3 rounded-md text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                                    activeTab === 'nix'
                                        ? 'bg-purple-500/20 text-purple-400 shadow-sm'
                                        : 'text-[var(--text-muted)] hover:text-purple-400'
                                }`}
                            >
                                <Beaker className="w-3 h-3" />
                                {t.footer.nixExperimental}
                            </button>
                        )}
                    </div>

                    {activeTab === 'distro' && (
                        <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-[var(--border-primary)]">
                            <div className={`flex items-center justify-between px-4 py-2 bg-[#252525] border-b border-[var(--border-primary)] ${isRtl ? 'flex-row-reverse' : ''}`}>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                    <span className="text-xs text-stone-500" style={{ [isRtl ? 'marginRight' : 'marginLeft']: '0.5rem' }}>{t.footer.bash}</span>
                                </div>
                                <div className="hidden md:flex items-center gap-2">
                                    <button
                                        onClick={onDownload}
                                        className="h-7 px-3 flex items-center gap-1.5 rounded-md bg-[var(--bg-tertiary)]/75 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors text-xs font-medium cursor-pointer"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        {t.footer.download}
                                    </button>
                                    <button
                                        onClick={handleCopyAndClose}
                                        className={cn('h-7 px-3 flex items-center gap-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer', copied
                                            ? 'bg-emerald-600 text-white'
                                            : 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600 hover:text-white'
                                        )}
                                    >
                                        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                        {copied ? t.footer.copied : t.footer.copy}
                                    </button>
                                </div>
                            </div>
                            <div className="p-4 font-mono text-sm overflow-x-auto">
                                <div className="flex gap-2">
                                    <span className="text-emerald-400 select-none shrink-0">$</span>
                                    <code className="text-gray-300 break-all whitespace-pre-wrap" style={{ lineHeight: '1.6', direction: 'ltr', textAlign: 'left' }}>
                                        {command}
                                    </code>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'nix' && nixPackages.length > 0 && (
                        <div className="space-y-3">
                            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl px-4 py-3">
                                <div className={`flex items-start gap-3 ${isRtl ? 'flex-row-reverse' : ''}`}>
                                    <Beaker className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                                    <div className={`${isRtl ? 'text-right' : ''}`}>
                                        <p className="text-sm font-medium text-purple-300">{t.footer.nixGenerator}</p>
                                        <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                                            {t.footer.nixDesc}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Profile command */}
                            <div className="bg-[#1a1a1a] rounded-xl overflow-hidden border border-[var(--border-primary)]">
                                <div className={`flex items-center justify-between px-4 py-2 bg-[#252525] border-b border-[var(--border-primary)] ${isRtl ? 'flex-row-reverse' : ''}`}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                        <span className="text-xs text-stone-400" style={{ [isRtl ? 'marginRight' : 'marginLeft']: '0.5rem' }}>{t.footer.nixProfile}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                const cmd = generateNixProfileCommand(nixPackages);
                                                navigator.clipboard.writeText(cmd);
                                            }}
                                            className="h-7 px-3 flex items-center gap-1.5 rounded-md bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white transition-colors text-xs font-medium cursor-pointer"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                            {t.footer.copy}
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 font-mono text-sm overflow-x-auto">
                                    <code className="text-gray-300 whitespace-pre-wrap break-all" style={{ lineHeight: '1.6', direction: 'ltr', textAlign: 'left' }}>
                                        {generateNixProfileCommand(nixPackages)}
                                    </code>
                                </div>
                            </div>

                            {/* Flake output */}
                            <details className="group">
                                <summary className="cursor-pointer text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors select-none py-1">
                                    <span className="group-open:hidden">▶</span>
                                    <span className="hidden group-open:inline">▼</span>
                                    {' '}{t.footer.showFlake}
                                </summary>
                                <div className="mt-2 bg-[#1a1a1a] rounded-xl overflow-hidden border border-[var(--border-primary)]">
                                    <div className={`flex items-center justify-between px-4 py-2 bg-[#252525] border-b border-[var(--border-primary)] ${isRtl ? 'flex-row-reverse' : ''}`}>
                                        <div className="flex items-center gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                            <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                            <span className="text-xs text-stone-400" style={{ [isRtl ? 'marginRight' : 'marginLeft']: '0.5rem' }}>flake.nix</span>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const flake = generateNixFlake(nixPackages);
                                                navigator.clipboard.writeText(flake);
                                            }}
                                            className="h-7 px-3 flex items-center gap-1.5 rounded-md bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white transition-colors text-xs font-medium cursor-pointer"
                                        >
                                            <Copy className="w-3.5 h-3.5" />
                                            {t.footer.copy}
                                        </button>
                                    </div>
                                    <div className="p-4 font-mono text-sm overflow-x-auto max-h-80 overflow-y-auto">
                                        <pre className="text-gray-300 whitespace-pre-wrap break-all" style={{ lineHeight: '1.5', direction: 'ltr', textAlign: 'left' }}>
                                            {generateNixFlake(nixPackages)}
                                        </pre>
                                    </div>
                                </div>
                            </details>

                            <p className="text-[10px] text-[var(--text-muted)]/50 leading-relaxed">
                                {t.footer.nixNote}
                            </p>
                        </div>
                    )}
                </div>

                <div className={`md:hidden flex flex-col items-stretch gap-3 px-4 py-4 border-t border-[var(--border-primary)]`}>
                    <button
                        onClick={onDownload}
                        className="flex-1 h-14 flex items-center justify-center gap-2 rounded-xl bg-[var(--bg-tertiary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition-colors font-medium text-base"
                    >
                        <Download className="w-5 h-5" />
                        {t.footer.downloadScript}
                    </button>
                    <button
                        onClick={handleCopyAndClose}
                        className={`flex-1 h-14 flex items-center justify-center gap-2 rounded-xl font-medium text-base transition-colors ${copied
                            ? 'bg-emerald-600 text-white'
                            : 'bg-[var(--text-primary)] text-[var(--bg-primary)] hover:opacity-90'
                        }`}
                    >
                        {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                        {copied ? t.footer.copied : t.footer.copyCommand}
                    </button>
                </div>
            </div>
        </>
    );
}
