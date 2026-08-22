// ThemeProvider keeps the `dark` class on <html> in sync with these.
export const themeClasses = {
  bg: {
    primary: 'bg-gray-50 dark:bg-gray-800',
    secondary: 'bg-white dark:bg-gray-900',
    card: 'bg-white/80 dark:bg-gray-700/80',
    surface: 'bg-white dark:bg-gray-700',
  },

  text: {
    primary: 'text-gray-900 dark:text-gray-100',
    secondary: 'text-gray-700 dark:text-gray-300',
    muted: 'text-gray-500 dark:text-gray-400',
    accent: 'text-blue-600',
  },

  border: {
    primary: 'border-white/20 dark:border-gray-700/20',
    secondary: 'border-gray-200 dark:border-gray-700',
    muted: 'border-gray-300 dark:border-gray-600',
  },

  hover: {
    bg: 'hover:bg-gray-100/50 dark:hover:bg-gray-700/50',
    text: 'hover:text-gray-800 dark:hover:text-gray-200',
  },

  navbar:
    'bg-white/70 border-white/20 dark:bg-gray-800/70 dark:border-gray-700/20',
  modal: 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700',
} as const;

export type ThemeClasses = typeof themeClasses;
