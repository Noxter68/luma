// src/lib/palettes.ts

export type PaletteType = 'nordic' | 'mauve' | 'sage' | 'amber';

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
  // Gradients avec effet brillance
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
  // ❄️ Nordic Minimalism - Corporate & Clean
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
        // Effet brillance lent et progressif
        header: ['#2B3A42', '#39515E', '#486879', '#567F94', '#5C7A89'],
        primary: ['#2B3A42', '#436066', '#5C7A89'],
        secondary: ['#5C7A89', '#7B95A4', '#A8B5BF'],
      },
      dark: {
        header: ['#0A0E12', '#101419', '#161D24', '#1C242C', '#2B3A42'],
        primary: ['#151B21', '#1C242C', '#2B3A42'],
        secondary: ['#1C242C', '#2B3A42', '#374952'],
      },
    },
  },

  // 💜 Dusty Mauve - Cozy & Feminine
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
        // Effet brillance lent et progressif
        header: ['#6B5B73', '#7A6B82', '#897B91', '#988AA0', '#9B8AA0'],
        primary: ['#6B5B73', '#82738A', '#9B8AA0'],
        secondary: ['#9B8AA0', '#AFA3B5', '#C4B5C9'],
      },
      dark: {
        header: ['#1A141D', '#231C28', '#2A2230', '#342D39', '#3E3742'],
        primary: ['#2A2230', '#342D39', '#3E3742'],
        secondary: ['#342D39', '#3E3742', '#544556'],
      },
    },
  },

  // 🌿 Sage - Nature & Growth
  sage: {
    light: {
      bg: '#F4F6F3',
      surface: '#FFFFFF',
      card: '#FFFFFF',
      border: '#E5E9E3',
      textPrimary: '#3A4238',
      textSecondary: '#6B7A68',
      textTertiary: '#8E9B8B',
    },
    dark: {
      bg: '#0E120D',
      surface: '#1A1F18',
      card: '#252B23',
      border: '#3A4238',
      textPrimary: '#F4F6F3',
      textSecondary: '#B8C4B5',
      textTertiary: '#8E9B8B',
    },
    primary: '#6B7A68',
    primaryLight: '#8A9D87',
    primaryDark: '#556351',
    secondary: '#A5B3A2',
    accent: '#B8C4B5',
    gradients: {
      light: {
        // Effet brillance lent et progressif
        header: ['#3A4238', '#495548', '#586758', '#677968', '#6B7A68'],
        primary: ['#3A4238', '#52614F', '#6B7A68'],
        secondary: ['#6B7A68', '#889E85', '#A5B3A2'],
      },
      dark: {
        header: ['#0E120D', '#141811', '#1A1F18', '#252B23', '#30362D'],
        primary: ['#1A1F18', '#252B23', '#30362D'],
        secondary: ['#252B23', '#30362D', '#3A4238'],
      },
    },
  },

  // 🌊 Ocean - Premium Investment (Inspiration screenshot exact)
  ocean: {
    light: {
      bg: '#F5F5F7',
      surface: '#FFFFFF',
      card: '#FFFFFF',
      border: '#E5E5E7',
      textPrimary: '#1D1D1F',
      textSecondary: '#6E6E73',
      textTertiary: '#86868B',
    },
    dark: {
      bg: '#1C1C1E',
      surface: '#2C2C2E',
      card: '#3A3A3C',
      border: '#48484A',
      textPrimary: '#F5F5F7',
      textSecondary: '#AEAEB2',
      textTertiary: '#86868B',
    },
    primary: '#C9A86A',
    primaryLight: '#D4B888',
    primaryDark: '#B5934F',
    secondary: '#8E8E93',
    accent: '#AEAEB2',
    gradients: {
      light: {
        // Gradient doré subtil progressif
        header: ['#9B8B6B', '#AE9D7E', '#C1AF91', '#C9A86A'],
        primary: ['#9B8B6B', '#B5A288', '#C9A86A'],
        secondary: ['#C9A86A', '#D4BC98', '#E0D4C0'],
      },
      dark: {
        // Gradients sombres avec touches dorées progressives
        header: ['#1C1C1E', '#2C2C2E', '#3A3A3C', '#48484A'],
        primary: ['#2C2C2E', '#3A3A3C', '#48484A'],
        secondary: ['#48484A', '#5A5A5C', '#6E6E73'],
      },
    },
  },

  // ✨ Amber - Premium & Luxury
  amber: {
    light: {
      bg: '#F7F6F4',
      surface: '#FFFFFF',
      card: '#FFFFFF',
      border: '#E8E6E3',
      textPrimary: '#3D3935',
      textSecondary: '#6B6661',
      textTertiary: '#9B9690',
    },
    dark: {
      bg: '#1A1816',
      surface: '#252320',
      card: '#2E2C28',
      border: '#3D3935',
      textPrimary: '#F7F6F4',
      textSecondary: '#C4C1BC',
      textTertiary: '#9B9690',
    },
    primary: '#B8936A',
    primaryLight: '#D4B088',
    primaryDark: '#9A7755',
    secondary: '#D4C5B0',
    accent: '#E8DCC8',
    gradients: {
      light: {
        // Effet brillance lent et progressif - tons chauds
        header: ['#6B6661', '#837B75', '#9B9088', '#B3A59C', '#B8936A'],
        primary: ['#6B6661', '#938A82', '#B8936A'],
        secondary: ['#B8936A', '#C6AC8D', '#D4C5B0'],
      },
      dark: {
        header: ['#1A1816', '#1F1D1B', '#252320', '#2E2C28', '#38352F'],
        primary: ['#252320', '#2E2C28', '#38352F'],
        secondary: ['#2E2C28', '#38352F', '#3D3935'],
      },
    },
  },
};

// Helper pour récupérer la palette active
export const getPalette = (paletteType: PaletteType): PaletteColors => {
  return PALETTES[paletteType];
};

// Helper pour récupérer un gradient avec effet brillance
export const getPaletteGradient = (paletteType: PaletteType, isDark: boolean, gradientName: 'header' | 'primary' | 'secondary'): string[] => {
  const palette = getPalette(paletteType);
  return isDark ? palette.gradients.dark[gradientName] : palette.gradients.light[gradientName];
};
