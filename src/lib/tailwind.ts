// src/lib/tailwind.ts
import { create } from 'twrnc';

const tw = create({
  theme: {
    extend: {
      colors: {
        // Nordic Minimalism Palette
        charcoal: {
          DEFAULT: '#2B3A42',
          50: '#E8EBED',
          100: '#D1D7DB',
          200: '#A3AFB7',
          300: '#758793',
          400: '#475F6F',
          500: '#2B3A42',
          600: '#222E35',
          700: '#1A2228',
          800: '#11171A',
          900: '#090B0D',
        },

        storm: {
          DEFAULT: '#5C7A89',
          50: '#EFF3F5',
          100: '#DFE7EB',
          200: '#BFCFD7',
          300: '#9FB7C3',
          400: '#7F9FAF',
          500: '#5C7A89',
          600: '#4A626E',
          700: '#374952',
          800: '#253137',
          900: '#12181B',
        },

        frost: {
          DEFAULT: '#A8B5BF',
          50: '#F7F8FA',
          100: '#EFF1F4',
          200: '#DFE3E9',
          300: '#CFD5DE',
          400: '#BFC7D3',
          500: '#A8B5BF',
          600: '#8794A0',
          700: '#677381',
          800: '#495360',
          900: '#2C3239',
        },

        snow: {
          DEFAULT: '#F5F7FA',
          50: '#FFFFFF',
          100: '#F5F7FA',
          200: '#EBF0F5',
          300: '#E1E8F0',
          400: '#D7E0EB',
          500: '#CDD8E6',
          600: '#B3C4D9',
          700: '#99B0CC',
          800: '#7F9CBF',
          900: '#6588B2',
        },

        steel: {
          DEFAULT: '#B8C5D0',
          50: '#F9FAFB',
          100: '#F3F5F7',
          200: '#E7EBEF',
          300: '#DBE1E7',
          400: '#CFD7DF',
          500: '#B8C5D0',
          600: '#9BADB9',
          700: '#7E95A2',
          800: '#627D8B',
          900: '#4A5F6D',
        },

        // Dark Mode Colors (aplaties pour tw.color())
        'dark-bg': '#0A0E12',
        'dark-surface': '#151B21',
        'dark-card': '#1C242C',
        'dark-border': '#2B3A42',
        'dark-text-primary': '#F5F7FA',
        'dark-text-secondary': '#B8C5D0',
        'dark-text-tertiary': '#8794A0',

        // Light Mode Colors (aplaties pour tw.color())
        'light-bg': '#F5F7FA',
        'light-surface': '#FFFFFF',
        'light-card': '#FFFFFF',
        'light-border': '#E7EBEF',
        'light-text-primary': '#2B3A42',
        'light-text-secondary': '#5C7A89',
        'light-text-tertiary': '#8794A0',

        // Aliases pour compatibilité (pointent vers Nordic)
        cream: {
          DEFAULT: '#F5F7FA',
          50: '#FFFFFF',
          100: '#F5F7FA',
          200: '#EBF0F5',
          300: '#E1E8F0',
          400: '#D7E0EB',
          500: '#CDD8E6',
          600: '#B3C4D9',
          700: '#99B0CC',
          800: '#7F9CBF',
          900: '#6588B2',
        },

        sage: {
          DEFAULT: '#5C7A89',
          50: '#EFF3F5',
          100: '#DFE7EB',
          200: '#BFCFD7',
          300: '#9FB7C3',
          400: '#7F9FAF',
          500: '#5C7A89',
          600: '#4A626E',
          700: '#374952',
          800: '#253137',
          900: '#12181B',
        },

        lavender: {
          DEFAULT: '#A8B5BF',
          50: '#F7F8FA',
          100: '#EFF1F4',
          200: '#DFE3E9',
          300: '#CFD5DE',
          400: '#BFC7D3',
          500: '#A8B5BF',
          600: '#8794A0',
          700: '#677381',
          800: '#495360',
          900: '#2C3239',
        },

        warmGray: {
          DEFAULT: '#B8C5D0',
          50: '#F9FAFB',
          100: '#F3F5F7',
          200: '#E7EBEF',
          300: '#DBE1E7',
          400: '#CFD7DF',
          500: '#B8C5D0',
          600: '#9BADB9',
          700: '#7E95A2',
          800: '#627D8B',
          900: '#4A5F6D',
        },

        oliveGreen: {
          DEFAULT: '#5C7A89',
          50: '#EFF3F5',
          100: '#DFE7EB',
          200: '#BFCFD7',
          300: '#9FB7C3',
          400: '#7F9FAF',
          500: '#5C7A89',
          600: '#4A626E',
          700: '#374952',
          800: '#253137',
          900: '#12181B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'System', 'Helvetica Neue', 'sans-serif'],
      },
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        xxl: '40px',
      },
      borderRadius: {
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
      },
      fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        md: '16px',
        lg: '20px',
        xl: '24px',
        xxl: '32px',
        xxxl: '40px',
      },
    },
  },
});

// Nordic Gradient Configurations
export const lumaGradients = {
  // Light Mode Gradients
  light: {
    primary: ['#2B3A42', '#5C7A89'], // Charcoal to Storm
    secondary: ['#5C7A89', '#A8B5BF'], // Storm to Frost
    soft: ['#A8B5BF', '#F5F7FA'], // Frost to Snow
    subtle: ['#F5F7FA', '#EBF0F5'], // Snow tones
    header: ['#2B3A42', '#374952', '#475F6F'], // Deep charcoal gradient
    card: ['#FFFFFF', '#F5F7FA'], // White to snow
    accent: ['#5C7A89', '#7F9FAF'], // Storm medium
    cool: ['#DFE7EB', '#BFCFD7', '#9FB7C3'], // Cool blues
  },

  // Dark Mode Gradients
  dark: {
    primary: ['#151B21', '#1C242C'], // Dark surfaces
    secondary: ['#1C242C', '#2B3A42'], // Card to border
    soft: ['#2B3A42', '#374952'], // Charcoal gradient
    subtle: ['#0A0E12', '#151B21'], // Deep dark
    header: ['#0A0E12', '#151B21', '#1C242C'], // Dark gradient
    card: ['#151B21', '#1C242C'], // Dark card
    accent: ['#5C7A89', '#7F9FAF'], // Storm (same as light)
    cool: ['#2B3A42', '#374952', '#475F6F'], // Dark cool
  },

  // Shared/Common Gradients
  button: {
    primary: ['#5C7A89', '#4A626E'], // Storm
    secondary: ['#A8B5BF', '#8794A0'], // Frost
    ghost: ['#F5F7FA', '#EBF0F5'], // Snow
  },

  // State-based
  success: ['#5C7A89', '#7F9FAF', '#9FB7C3'], // Storm to light
  error: ['#E74C3C', '#C0392B'], // Subtle red
  warning: ['#F39C12', '#E67E22'], // Subtle orange

  // Overlays
  overlay: {
    light: ['rgba(245, 247, 250, 0.95)', 'rgba(255, 255, 255, 0)'],
    dark: ['rgba(10, 14, 18, 0.95)', 'rgba(0, 0, 0, 0)'],
  },

  // Special effects
  shimmer: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0)'],
  glassmorphism: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
};

// Helper function to get gradient based on theme
export const getGradient = (name: string, isDark: boolean = false): string[] => {
  // Check if gradient exists in theme-specific gradients
  if (isDark && lumaGradients.dark[name as keyof typeof lumaGradients.dark]) {
    return lumaGradients.dark[name as keyof typeof lumaGradients.dark] as string[];
  }
  if (!isDark && lumaGradients.light[name as keyof typeof lumaGradients.light]) {
    return lumaGradients.light[name as keyof typeof lumaGradients.light] as string[];
  }

  // Fallback to common gradients
  return lumaGradients.button.primary;
};

export default tw;
