"use client"

import { useState } from "react"
import { Moon, Sun } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/hooks/use-theme"
import { analytics } from "@/lib/analytics"

interface ThemeToggleProps {
    className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
    const { theme, toggle } = useTheme()
    const isDark = theme === "dark"

    // next-themes
    // const { resolvedTheme, setTheme } = useTheme()
    // const isDark = resolvedTheme === "dark"
    // onClick={() => setTheme(isDark ? "light" : "dark")}

    return (
        <div
            className={cn(
                "flex w-20 h-10 p-1 rounded-full cursor-pointer transition-all duration-300",
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
            <div className="flex justify-between items-center w-full">
                <div
                    className={cn(
                        "flex justify-center items-center w-8 h-8 rounded-full transition-transform duration-300",
                        isDark ? "transform translate-x-0" : "transform translate-x-10",
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
                            : "transform -translate-x-10"
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
