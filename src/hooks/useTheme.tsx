"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"

type Theme = 'dark' | 'light'

interface ThemeContextType {
    theme: Theme
    toggle: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

// Theme provider.
export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            return document.documentElement.classList.contains('light') ? 'light' : 'dark'
        }
        return 'light'
    })
    const [hydrated, setHydrated] = useState(false)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setHydrated(true)
    }, [])

    useEffect(() => {
        if (!hydrated) return
        localStorage.setItem('theme', theme)
        document.documentElement.classList.toggle('light', theme === 'light')
    }, [theme, hydrated])

    const toggle = useCallback(() => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark')
    }, [])

    return (
        <ThemeContext.Provider value={{ theme, toggle }
        }>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    const context = useContext(ThemeContext)
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider")
    }
    return context
}
