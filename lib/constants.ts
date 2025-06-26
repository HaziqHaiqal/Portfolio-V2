import { Code2, Smartphone, Monitor, Palette, Gamepad2, Server, Brain, Wrench, Tag, LucideIcon } from 'lucide-react';

// Project category constants with icons and colors
export const PROJECT_CATEGORIES = [
  { 
    value: 'web', 
    label: 'Web', 
    description: 'Web applications and websites',
    icon: Code2,
    color: 'blue',
    bgClass: 'bg-blue-500/20 text-blue-400'
  },
  { 
    value: 'mobile', 
    label: 'Mobile', 
    description: 'Mobile applications (iOS/Android)',
    icon: Smartphone,
    color: 'green',
    bgClass: 'bg-green-500/20 text-green-400'
  },
  { 
    value: 'art', 
    label: 'Art/Design', 
    description: 'Art, design, and creative projects',
    icon: Palette,
    color: 'purple',
    bgClass: 'bg-purple-500/20 text-purple-400'
  },
  { 
    value: 'game', 
    label: 'Game', 
    description: 'Games and interactive entertainment',
    icon: Gamepad2,
    color: 'red',
    bgClass: 'bg-red-500/20 text-red-400'
  },
  { 
    value: 'api', 
    label: 'API', 
    description: 'APIs and backend services',
    icon: Server,
    color: 'orange',
    bgClass: 'bg-orange-500/20 text-orange-400'
  },
  { 
    value: 'ai', 
    label: 'AI/ML', 
    description: 'Artificial Intelligence and Machine Learning',
    icon: Brain,
    color: 'pink',
    bgClass: 'bg-pink-500/20 text-pink-400'
  },
  { 
    value: 'tool', 
    label: 'Tool/Utility', 
    description: 'Developer tools and utilities',
    icon: Wrench,
    color: 'yellow',
    bgClass: 'bg-yellow-500/20 text-yellow-400'
  },
  { 
    value: 'other', 
    label: 'Other', 
    description: 'Other types of projects',
    icon: Tag,
    color: 'gray',
    bgClass: 'bg-gray-500/20 text-gray-400'
  },
] as const;

export type ProjectCategory = typeof PROJECT_CATEGORIES[number]['value'];

// Helper function to get category info
export const getCategoryInfo = (categoryValue: string) => {
  return PROJECT_CATEGORIES.find(cat => cat.value === categoryValue) || PROJECT_CATEGORIES[PROJECT_CATEGORIES.length - 1];
};

// Project status constants with colors
export const PROJECT_STATUSES = [
  { value: 'Completed', label: 'Completed', color: 'green', bgClass: 'bg-green-500/20 text-green-400' },
  { value: 'In Progress', label: 'In Progress', color: 'blue', bgClass: 'bg-blue-500/20 text-blue-400' },
  { value: 'Planned', label: 'Planned', color: 'yellow', bgClass: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'On Hold', label: 'On Hold', color: 'gray', bgClass: 'bg-gray-500/20 text-gray-400' },
] as const;

export type ProjectStatus = typeof PROJECT_STATUSES[number]['value'];

// Helper function to get status info
export const getStatusInfo = (statusValue: string) => {
  return PROJECT_STATUSES.find(s => s.value === statusValue) || PROJECT_STATUSES[PROJECT_STATUSES.length - 1];
}; 