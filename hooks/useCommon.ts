import { useState, useEffect, useSyncExternalStore } from 'react';
import { useTheme } from '@components/Provider/ThemeProvider';

const emptySubscribe = () => () => {};
export function useHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

// Hook for current time with automatic updates
export function useCurrentTime(updateInterval = 1000) {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const mounted = useHydrated();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, updateInterval);
    return () => clearInterval(timer);
  }, [updateInterval]);

  return { currentTime, mounted };
}

// Hook for keyboard shortcuts
export function useKeyboardShortcuts() {
  const { toggleDarkMode } = useTheme();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // Ctrl/Cmd + D for dark mode toggle
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
        toggleDarkMode();
      }

      // Escape to close modals (handled by UI store in components)
      if (event.key === 'Escape') {
        // Components should listen for this
        window.dispatchEvent(new CustomEvent('closeModal'));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleDarkMode]);
}
