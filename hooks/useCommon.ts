import { useState, useEffect, useCallback } from 'react'
import { useTheme } from '../components/providers/ThemeProvider'

// Hook for current time with automatic updates
export function useCurrentTime(updateInterval = 1000) {
  const [currentTime, setCurrentTime] = useState(() => new Date())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, updateInterval)
    return () => clearInterval(timer)
  }, [updateInterval])

  return { currentTime, mounted }
}

// Hook for scroll-based animations
export function useScrollAnimation() {
  const [scrollY, setScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const registerElement = useCallback((id: string, threshold = 0.1) => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(prev => ({
          ...prev,
          [id]: entry.isIntersecting
        }))
      },
      { threshold }
    )

    return (element: Element | null) => {
      if (element) {
        observer.observe(element)
      }
      return () => {
        if (element) {
          observer.unobserve(element)
        }
      }
    }
  }, [])

  return { scrollY, isVisible, registerElement }
}

// Hook for responsive design breakpoints
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('md')

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      if (width < 640) setBreakpoint('sm')
      else if (width < 768) setBreakpoint('md')
      else if (width < 1024) setBreakpoint('lg')
      else if (width < 1280) setBreakpoint('xl')
      else setBreakpoint('2xl')
    }

    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])

  return {
    breakpoint,
    isMobile: breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: ['lg', 'xl', '2xl'].includes(breakpoint),
  }
}

// Hook for component animations with theme awareness
export function useThemeAnimation() {
  const { isDarkMode } = useTheme()
  
  const getAnimationVariants = useCallback((type: 'fadeIn' | 'slideUp' | 'scale' | 'rotate') => {
    const baseVariants = {
      fadeIn: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      },
      slideUp: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 }
      },
      scale: {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 }
      },
      rotate: {
        initial: { opacity: 0, rotate: -10 },
        animate: { opacity: 1, rotate: 0 },
        exit: { opacity: 0, rotate: 10 }
      }
    }

    return baseVariants[type]
  }, [])

  const getThemeTransition = useCallback((duration = 0.3) => ({
    duration,
    ease: 'easeInOut',
    ...(isDarkMode && { type: 'spring', stiffness: 100 })
  }), [isDarkMode])

  return { getAnimationVariants, getThemeTransition }
}

// Hook for managing loading states across multiple async operations
export function useAsyncOperations() {
  const [operations, setOperations] = useState<Record<string, boolean>>({})

  const startOperation = useCallback((key: string) => {
    setOperations(prev => ({ ...prev, [key]: true }))
  }, [])

  const endOperation = useCallback((key: string) => {
    setOperations(prev => ({ ...prev, [key]: false }))
  }, [])

  const isLoading = useCallback((key?: string) => {
    if (key) return operations[key] || false
    return Object.values(operations).some(Boolean)
  }, [operations])

  return { startOperation, endOperation, isLoading, operations }
}

// Hook for keyboard shortcuts
export function useKeyboardShortcuts() {
  const { toggleDarkMode } = useTheme()

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl/Cmd + D for dark mode toggle
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault()
        toggleDarkMode()
      }
      
      // Escape to close modals (handled by UI store in components)
      if (event.key === 'Escape') {
        // Components should listen for this
        window.dispatchEvent(new CustomEvent('closeModal'))
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [toggleDarkMode])
}

// Hook for localStorage with type safety
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  return [storedValue, setValue] as const
} 