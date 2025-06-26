'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

interface ThemeContextType {
  isDarkMode: boolean
  toggleDarkMode: () => void
  setDarkMode: (isDark: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Handle hydration
  useEffect(() => {
    setMounted(true)
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem('portfolio-theme')
    if (savedTheme) {
      try {
        const parsedTheme = JSON.parse(savedTheme)
        // Handle both old and new storage formats
        const darkMode = parsedTheme.state ? parsedTheme.state.isDarkMode : parsedTheme.isDarkMode
        setIsDarkMode(darkMode)
      } catch (error) {
        console.warn('Error parsing saved theme:', error)
        // Fallback to system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        setIsDarkMode(prefersDark)
      }
    } else {
      // Fallback to system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setIsDarkMode(prefersDark)
    }
  }, [])

  // Save theme preference
  useEffect(() => {
    if (mounted) {
      localStorage.setItem('portfolio-theme', JSON.stringify({ state: { isDarkMode } }))
    }
  }, [isDarkMode, mounted])

  // Apply theme to document
  useEffect(() => {
    if (mounted) {
      document.documentElement.classList.toggle('dark', isDarkMode)
    }
  }, [isDarkMode, mounted])

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev)
  }

  const setDarkMode = (isDark: boolean) => {
    setIsDarkMode(isDark)
  }

  const value = {
    isDarkMode,
    toggleDarkMode,
    setDarkMode,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    // Return fallback values instead of throwing error
    console.warn('useTheme called outside ThemeProvider, using fallback values')
    return {
      isDarkMode: false,
      toggleDarkMode: () => {},
      setDarkMode: () => {},
    }
  }
  return context
}

// CSS classes hook for consistent styling
export function useThemeClasses() {
  const { isDarkMode } = useTheme()

  return {
    // Background variants
    bg: {
      primary: isDarkMode ? 'bg-gray-800' : 'bg-gray-50',
      secondary: isDarkMode ? 'bg-gray-900' : 'bg-white',
      card: isDarkMode ? 'bg-gray-700/80' : 'bg-white/80',
      surface: isDarkMode ? 'bg-gray-700' : 'bg-white',
    },

    // Text variants
    text: {
      primary: isDarkMode ? 'text-gray-100' : 'text-gray-900',
      secondary: isDarkMode ? 'text-gray-300' : 'text-gray-700',
      muted: isDarkMode ? 'text-gray-400' : 'text-gray-500',
      accent: 'text-blue-600',
    },

    // Border variants
    border: {
      primary: isDarkMode ? 'border-gray-700/20' : 'border-white/20',
      secondary: isDarkMode ? 'border-gray-700' : 'border-gray-200',
      muted: isDarkMode ? 'border-gray-600' : 'border-gray-300',
    },

    // Interactive states
    hover: {
      bg: isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100/50',
      text: isDarkMode ? 'hover:text-gray-200' : 'hover:text-gray-800',
    },

    // Component-specific
    navbar: isDarkMode
      ? 'bg-gray-800/70 border-gray-700/20'
      : 'bg-white/70 border-white/20',
    modal: isDarkMode
      ? 'bg-gray-800 border-gray-700'
      : 'bg-white border-gray-200',
  }
} 