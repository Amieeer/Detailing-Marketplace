// Design System - Centralized theme configuration
// Use this across all screens for consistent styling

export const colors = {
    // Primary colors (Metallic Gold)
    primary: '#D4AF37',
    primaryDark: '#B8962E',
    primaryLight: '#E5C45B',

    // Secondary colors (Neutral)
    secondary: '#FFFFFF',
    secondaryDark: '#A1A1AA',

    // Background colors
    background: '#121212',
    surface: '#1e1e1e',
    surfaceLight: '#2a2a2a',

    // Border colors
    border: '#333',
    borderLight: '#444',

    // Text colors
    text: '#ffffff',
    textSecondary: '#b0bec5',
    textMuted: '#666',

    // Status colors
    success: '#00e676',
    warning: '#ffd600',
    error: '#ff1744',
    info: '#00b0ff',
};

export const typography = {
    h1: {
        fontSize: 32,
        fontWeight: 'bold',
        lineHeight: 40,
    },
    h2: {
        fontSize: 24,
        fontWeight: 'bold',
        lineHeight: 32,
    },
    h3: {
        fontSize: 20,
        fontWeight: 'bold',
        lineHeight: 28,
    },
    h4: {
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 24,
    },
    body: {
        fontSize: 16,
        lineHeight: 24,
    },
    bodySmall: {
        fontSize: 14,
        lineHeight: 20,
    },
    caption: {
        fontSize: 12,
        lineHeight: 16,
    },
};

export const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

export const borderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
};

export const shadows = {
    small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 2,
    },
    medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 4,
    },
    large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.37,
        shadowRadius: 7.49,
        elevation: 8,
    },
};

// Animation configurations
export const animations = {
    fast: 150,
    normal: 300,
    slow: 500,
};

// Common component styles
export const commonStyles = {
    card: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardElevated: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        ...shadows.medium,
    },
    button: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderRadius: borderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: '#000',
        fontSize: 16,
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: colors.surface,
        borderRadius: borderRadius.sm,
        padding: spacing.md,
        color: colors.text,
        borderWidth: 1,
        borderColor: colors.border,
    },
};

export default {
    colors,
    typography,
    spacing,
    borderRadius,
    shadows,
    animations,
    commonStyles,
};
