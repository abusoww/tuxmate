"use client"

import { useState, useEffect } from "react"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/hooks/useTheme"
import { useI18n } from "@/hooks/useI18n"
import { analytics } from "@/lib/analytics"

interface ThemeToggleProps {
    className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
    const { theme, toggle } = useTheme()
    const { dir } = useI18n()
    const [mounted, setMounted] = useState(false)
    const isRtl = dir === 'rtl'

    // Prevent hydration mismatch by only rendering after mount
    useEffect(() => {
        setMounted(true)
    }, [])

    const isDark = theme === "dark"

    // Render placeholder with same dimensions during SSR
    if (!mounted) {
        return (
            <div
                className={cn(
                    "flex w-20 h-10 p-1 rounded-full",
                    "bg-[var(--bg-secondary)] border border-[var(--border-primary)]",
                    className
                )}
            />
        )
    }

    return (
        <div
            className={cn(
                "flex w-20 h-10 p-1 rounded-full cursor-pointer transition-[background-color,box-shadow] duration-300",
                "bg-[var(--bg-secondary)] border border-[var(--border-primary)]",
                className
            )}
            onClick={() => {
                toggle();
                analytics.themeChanged(isDark ? 'light' : 'dark');
            }}
            role="button"
            tabIndex={0}
        >
            <div className={cn(
                "flex justify-between items-center w-full",
                isRtl ? "flex-row-reverse" : ""
            )}>
                <div
                    className={cn(
                        "flex justify-center items-center w-8 h-8 rounded-full transition-transform duration-300",
                        isDark
                            ? "transform translate-x-0"
                            : (isRtl ? "transform -translate-x-10" : "transform translate-x-10"),
                        "bg-[var(--bg-tertiary)]"
                    )}
                >
                    {isDark ? (
                        <Moon
                            className="w-5 h-5 text-[var(--text-primary)]"
                            strokeWidth={1.5}
                        />
                    ) : (
                        <Sun
                            className="w-5 h-5 text-[var(--text-primary)]"
                            strokeWidth={1.5}
                        />
                    )}
                </div>
                <div
                    className={cn(
                        "flex justify-center items-center w-8 h-8 rounded-full transition-transform duration-300",
                        isDark
                            ? "bg-transparent"
                            : (isRtl ? "transform translate-x-10" : "transform -translate-x-10")
                    )}
                >
                    {isDark ? (
                        <Sun
                            className="w-5 h-5 text-[var(--text-muted)]"
                            strokeWidth={1.5}
                        />
                    ) : (
                        <Moon
                            className="w-5 h-5 text-[var(--text-muted)]"
                            strokeWidth={1.5}
                        />
                    )}
                </div>
            </div>
        </div>
    )
}
