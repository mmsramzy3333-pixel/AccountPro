import { Client } from '../types';

export interface ClientColorPalette {
  id: string;
  name: string;
  dotColor: string; // Tailwind bg-color for dot
  ringColor: string;
  borderClass: string;
  bgLightClass: string;
  textClass: string;
  hex: string;
}

const PRESET_PALETTES = [
  {
    dotColor: 'bg-emerald-500',
    ringColor: 'ring-emerald-400',
    borderClass: 'border-emerald-300 dark:border-emerald-700',
    bgLightClass: 'bg-emerald-50 dark:bg-emerald-950/40',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    hex: '#10b981',
  },
  {
    dotColor: 'bg-indigo-500',
    ringColor: 'ring-indigo-400',
    borderClass: 'border-indigo-300 dark:border-indigo-700',
    bgLightClass: 'bg-indigo-50 dark:bg-indigo-950/40',
    textClass: 'text-indigo-700 dark:text-indigo-300',
    hex: '#6366f1',
  },
  {
    dotColor: 'bg-amber-500',
    ringColor: 'ring-amber-400',
    borderClass: 'border-amber-300 dark:border-amber-700',
    bgLightClass: 'bg-amber-50 dark:bg-amber-950/40',
    textClass: 'text-amber-700 dark:text-amber-300',
    hex: '#f59e0b',
  },
  {
    dotColor: 'bg-rose-500',
    ringColor: 'ring-rose-400',
    borderClass: 'border-rose-300 dark:border-rose-700',
    bgLightClass: 'bg-rose-50 dark:bg-rose-950/40',
    textClass: 'text-rose-700 dark:text-rose-300',
    hex: '#f43f5e',
  },
  {
    dotColor: 'bg-sky-500',
    ringColor: 'ring-sky-400',
    borderClass: 'border-sky-300 dark:border-sky-700',
    bgLightClass: 'bg-sky-50 dark:bg-sky-950/40',
    textClass: 'text-sky-700 dark:text-sky-300',
    hex: '#0ea5e9',
  },
  {
    dotColor: 'bg-purple-500',
    ringColor: 'ring-purple-400',
    borderClass: 'border-purple-300 dark:border-purple-700',
    bgLightClass: 'bg-purple-50 dark:bg-purple-950/40',
    textClass: 'text-purple-700 dark:text-purple-300',
    hex: '#a855f7',
  },
  {
    dotColor: 'bg-teal-500',
    ringColor: 'ring-teal-400',
    borderClass: 'border-teal-300 dark:border-teal-700',
    bgLightClass: 'bg-teal-50 dark:bg-teal-950/40',
    textClass: 'text-teal-700 dark:text-teal-300',
    hex: '#14b8a6',
  },
  {
    dotColor: 'bg-orange-500',
    ringColor: 'ring-orange-400',
    borderClass: 'border-orange-300 dark:border-orange-700',
    bgLightClass: 'bg-orange-50 dark:bg-orange-950/40',
    textClass: 'text-orange-700 dark:text-orange-300',
    hex: '#f97316',
  },
  {
    dotColor: 'bg-fuchsia-500',
    ringColor: 'ring-fuchsia-400',
    borderClass: 'border-fuchsia-300 dark:border-fuchsia-700',
    bgLightClass: 'bg-fuchsia-50 dark:bg-fuchsia-950/40',
    textClass: 'text-fuchsia-700 dark:text-fuchsia-300',
    hex: '#d946ef',
  },
  {
    dotColor: 'bg-blue-600',
    ringColor: 'ring-blue-400',
    borderClass: 'border-blue-300 dark:border-blue-700',
    bgLightClass: 'bg-blue-50 dark:bg-blue-950/40',
    textClass: 'text-blue-700 dark:text-blue-300',
    hex: '#2563eb',
  },
];

export function getClientColorPalette(clientId?: string, clients: Client[] = []): ClientColorPalette {
  const index = clientId ? clients.findIndex(c => c.id === clientId) : -1;
  const client = index >= 0 ? clients[index] : null;
  const safeIndex = index >= 0 ? index % PRESET_PALETTES.length : 0;
  const palette = PRESET_PALETTES[safeIndex];

  return {
    id: clientId || 'default',
    name: client?.name || 'عميل عام',
    ...palette,
  };
}
