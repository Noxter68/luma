import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PaletteType, getPalette, PaletteColors } from '../lib/palettes';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: 'light' | 'dark';
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
  palette: PaletteType;
  setPalette: (palette: PaletteType) => void;
  colors: PaletteColors;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  themeMode: 'system',
  setThemeMode: () => {},
  isDark: false,
  palette: 'nordic',
  setPalette: () => {},
  colors: getPalette('nordic'),
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemTheme = useColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [palette, setPaletteState] = useState<PaletteType>('nordic');

  useEffect(() => {
    loadPreferences();
  }, []);

  useEffect(() => {
    const effectiveTheme = themeMode === 'system' ? systemTheme || 'light' : themeMode;
    setTheme(effectiveTheme);
  }, [themeMode, systemTheme]);

  const loadPreferences = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme_preference');
      const savedPalette = await AsyncStorage.getItem('palette_preference');

      if (savedTheme) {
        setThemeModeState(savedTheme as ThemeMode);
      }
      if (savedPalette) {
        setPaletteState(savedPalette as PaletteType);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
  };

  const setThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem('theme_preference', mode);
      setThemeModeState(mode);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const setPalette = async (newPalette: PaletteType) => {
    try {
      await AsyncStorage.setItem('palette_preference', newPalette);
      setPaletteState(newPalette);
    } catch (error) {
      console.error('Failed to save palette preference:', error);
    }
  };

  const isDark = theme === 'dark';
  const colors = getPalette(palette);

  return <ThemeContext.Provider value={{ theme, themeMode, setThemeMode, isDark, palette, setPalette, colors }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  return context;
};
