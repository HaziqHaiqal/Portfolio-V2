export const COLORS = {
  contribution: {
    light: ['#e5e7eb', '#86efac', '#22c55e', '#15803d'],
    dark: ['#374151', '#16a34a', '#22c55e', '#4ade80'],
  },
} as const;

export type PageAccent = 'blue' | 'purple' | 'green' | 'yellow';

/** Each page's colour, shared by its nav tab and its titles. */
export const PAGE_ACCENTS: Record<
  PageAccent,
  {
    icon: string;
    bar: string;
    underline: string;
    hoverText: string;
    decoration: string;
  }
> = {
  blue: {
    icon: 'text-blue-500',
    bar: 'from-blue-600 to-blue-400',
    underline: 'bg-blue-600',
    hoverText: 'hover:text-blue-600',
    decoration: 'decoration-blue-600',
  },
  purple: {
    icon: 'text-purple-500',
    bar: 'from-purple-600 to-purple-400',
    underline: 'bg-purple-600',
    hoverText: 'hover:text-purple-600',
    decoration: 'decoration-purple-600',
  },
  green: {
    icon: 'text-green-500',
    bar: 'from-green-600 to-green-400',
    underline: 'bg-green-600',
    hoverText: 'hover:text-green-600',
    decoration: 'decoration-green-600',
  },
  yellow: {
    icon: 'text-yellow-500',
    bar: 'from-yellow-600 to-yellow-400',
    underline: 'bg-yellow-600',
    hoverText: 'hover:text-yellow-600',
    decoration: 'decoration-yellow-600',
  },
};
