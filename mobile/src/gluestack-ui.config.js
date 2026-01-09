import { config as defaultConfig } from '@gluestack-ui/config';

// Custom Midnight Plasma Theme
export const config = {
    ...defaultConfig,
    tokens: {
        ...defaultConfig.tokens,
        colors: {
            ...defaultConfig.tokens.colors,
            // Luxury Automotive Palette (Gold & Black)
            primary0: '#1a1405',
            primary50: '#2d2208',
            primary100: '#4a380d',
            primary200: '#6d5214',
            primary300: '#94701b',
            primary400: '#bc8f23',
            primary500: '#d4af37', // Metallic Gold
            primary600: '#b8962e',
            primary700: '#9c7f27',
            primary800: '#806820',
            primary900: '#645119',

            secondary0: '#1f2937',
            secondary50: '#374151',
            secondary100: '#4b5563',
            secondary200: '#6b7280',
            secondary300: '#9ca3af',
            secondary400: '#d1d5db',
            secondary500: '#e5e7eb',
            secondary600: '#f3f4f6',
            secondary700: '#f9fafb',
            secondary800: '#1f2937',
            secondary900: '#111827',

            // Dark Mode Backgrounds
            backgroundDark: '#121212', // Deep Black
            backgroundCard: '#1e1e1e', // Charcoal
            textLight: '#ffffff',
            textDim: '#a1a1aa', // Lighter gray for better contrast on black
        },
    },
};
