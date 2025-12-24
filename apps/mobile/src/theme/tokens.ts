/**
 * Design System Tokens
 * Centralized design tokens for consistent styling across the app
 */

export const Colors = {
    // Background
    background: {
        default: '#F8FAFC', // Slate-50
        card: '#FFFFFF',    // White for cards/surfaces only
    },

    // Primary Accent
    primary: {
        main: '#4F46E5',    // Indigo-600
        light: '#818CF8',   // Indigo-400
        dark: '#3730A3',    // Indigo-800
    },

    // Semantic Colors
    semantic: {
        income: '#10B981',  // Emerald-500
        expense: '#F43F5E', // Rose-500
        transfer: '#4F46E5', // Indigo-600
    },

    // Text Colors
    text: {
        primary: '#0F172A',   // Slate-900
        secondary: '#334155', // Slate-700
        tertiary: '#64748B',  // Slate-500
        disabled: '#94A3B8',  // Slate-400
    },

    // Border Colors
    border: {
        light: '#E2E8F0',   // Slate-200
        default: '#CBD5E1',  // Slate-300
    },

    // Status Colors
    status: {
        success: '#10B981',  // Emerald-500
        warning: '#F59E0B',  // Amber-500
        error: '#EF4444',    // Red-500
        info: '#3B82F6',     // Blue-500
    },
};

export const Typography = {
    // Font Families (React Native will use system fonts)
    fontFamily: {
        regular: 'System',
        medium: 'System',
        semibold: 'System',
        bold: 'System',
    },

    // Font Sizes
    fontSize: {
        xs: 12,
        sm: 14,
        base: 16,
        lg: 18,
        xl: 20,
        '2xl': 24,
        '3xl': 28,
        '4xl': 32,
    },

    // Font Weights
    fontWeight: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
    },

    // Line Heights
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    '4xl': 40,
    '5xl': 48,
};

export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,   // Buttons
    xl: 24,   // Cards
    full: 9999,
};

export const Shadows = {
    // Subtle shadows only
    sm: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    md: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    lg: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
};

export const Layout = {
    screenPadding: Spacing.xl,
    cardPadding: Spacing.lg,
    sectionSpacing: Spacing['2xl'],
};
