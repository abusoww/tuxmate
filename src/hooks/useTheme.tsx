"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"

type Theme = 'dark' | 'light'

interface ThemeContextType {
    theme: Theme
    toggle: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    // Initial state reads from DOM to match what the inline script set
    const [theme, setTheme] = useState<Theme>(() => {
        if (typeof window !== 'undefined') {
            return document.documentElement.classList.contains('light') ? 'light' : 'dark'
        }
        return 'light' // SSR default
    })
    const [hydrated, setHydrated] = useState(false)

    useEffect(() => {
        // On mount, sync with localStorage (which should match DOM already)
        const saved = localStorage.getItem('theme') as Theme | null
        if (saved) {
            setTheme(saved)
            document.documentElement.classList.toggle('light', saved === 'light')
        }
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
        <ThemeContext.Provider value= {{ theme, toggle }
}>
    { children }
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
