// src/lib/palettes.ts

export type PaletteType = 'nordic' | 'mauve';

export interface PaletteColors {
  // Light mode
  light: {
    bg: string;
    surface: string;
    card: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
  };
  // Dark mode
  dark: {
    bg: string;
    surface: string;
    card: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    textTertiary: string;
  };
  // Accent colors (same for light/dark)
  primary: string;
  primaryLight: string;
  primaryDark: string;
  secondary: string;
  accent: string;
  // Gradients
  gradients: {
    light: {
      header: string[];
      primary: string[];
      secondary: string[];
    };
    dark: {
      header: string[];
      primary: string[];
      secondary: string[];
    };
  };
}

export const PALETTES: Record<PaletteType, PaletteColors> = {
  // ❄️ Nordic Minimalism (actuel)
  nordic: {
    light: {
      bg: '#F5F7FA',
      surface: '#FFFFFF',
      card: '#FFFFFF',
      border: '#E7EBEF',
      textPrimary: '#2B3A42',
      textSecondary: '#5C7A89',
      textTertiary: '#8794A0',
    },
    dark: {
      bg: '#0A0E12',
      surface: '#151B21',
      card: '#1C242C',
      border: '#2B3A42',
      textPrimary: '#F5F7FA',
      textSecondary: '#B8C5D0',
      textTertiary: '#8794A0',
    },
    primary: '#5C7A89',
    primaryLight: '#7F9FAF',
    primaryDark: '#4A626E',
    secondary: '#A8B5BF',
    accent: '#B8C5D0',
    gradients: {
      light: {
        header: ['#2B3A42', '#374952', '#475F6F'],
        primary: ['#2B3A42', '#5C7A89'],
        secondary: ['#5C7A89', '#A8B5BF'],
      },
      dark: {
        header: ['#0A0E12', '#151B21', '#1C242C'],
        primary: ['#151B21', '#1C242C'],
        secondary: ['#1C242C', '#2B3A42'],
      },
    },
  },

  // 💜 Dusty Mauve (féminin)
  mauve: {
    light: {
      bg: '#F7F4F8',
      surface: '#FFFFFF',
      card: '#FFFFFF',
      border: '#E8E1EC',
      textPrimary: '#544556',
      textSecondary: '#6B5B73',
      textTertiary: '#9B8AA0',
    },
    dark: {
      bg: '#1A141D',
      surface: '#2A2230',
      card: '#342D39',
      border: '#544556',
      textPrimary: '#F7F4F8',
      textSecondary: '#C4B5C9',
      textTertiary: '#9B8AA0',
    },
    primary: '#9B8AA0',
    primaryLight: '#B5A9BC',
    primaryDark: '#7d6c82',
    secondary: '#C4B5C9',
    accent: '#B5A9BC',
    gradients: {
      light: {
        header: ['#6B5B73', '#7d6c82', '#9B8AA0'],
        primary: ['#6B5B73', '#9B8AA0'],
        secondary: ['#9B8AA0', '#C4B5C9'],
      },
      dark: {
        header: ['#1A141D', '#2A2230', '#342D39'],
        primary: ['#2A2230', '#342D39'],
        secondary: ['#342D39', '#544556'],
      },
    },
  },
};

// Helper pour récupérer la palette active
export const getPalette = (paletteType: PaletteType): PaletteColors => {
  return PALETTES[paletteType];
};

// Helper pour récupérer un gradient
export const getPaletteGradient = (paletteType: PaletteType, isDark: boolean, gradientName: 'header' | 'primary' | 'secondary'): string[] => {
  const palette = getPalette(paletteType);
  return isDark ? palette.gradients.dark[gradientName] : palette.gradients.light[gradientName];
};
