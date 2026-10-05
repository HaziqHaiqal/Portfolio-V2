'use client';

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

export function useKeyboardShortcuts() {
  const { toggleDarkMode } = useTheme();

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'd') {
        event.preventDefault();
        toggleDarkMode();
      }

      if (event.key === 'Escape') {
        window.dispatchEvent(new CustomEvent('closeModal'));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleDarkMode]);
}
