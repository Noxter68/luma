import tw from './tailwind';

/**
 * Classe helper pour appliquer des styles conditionnels selon le thème
 */
export const themed = (isDark: boolean, lightClass: string, darkClass: string): string => {
  return isDark ? darkClass : lightClass;
};

/**
 * Retourne les classes de background selon le thème
 */
export const bgThemed = (isDark: boolean): string => {
  return isDark ? 'bg-[#0A0E12]' : 'bg-[#F5F7FA]';
};

/**
 * Retourne les classes de surface selon le thème
 */
export const surfaceThemed = (isDark: boolean): string => {
  return isDark ? 'bg-[#151B21]' : 'bg-white';
};

/**
 * Retourne les classes de card selon le thème
 */
export const cardThemed = (isDark: boolean): string => {
  return isDark ? 'bg-[#1C242C]' : 'bg-white';
};

/**
 * Retourne les classes de texte principal selon le thème
 */
export const textThemed = (isDark: boolean): string => {
  return isDark ? 'text-[#F5F7FA]' : 'text-[#2B3A42]';
};

/**
 * Retourne les classes de texte secondaire selon le thème
 */
export const textSecondaryThemed = (isDark: boolean): string => {
  return isDark ? 'text-[#B8C5D0]' : 'text-[#5C7A89]';
};

/**
 * Retourne les classes de bordure selon le thème
 */
export const borderThemed = (isDark: boolean): string => {
  return isDark ? 'border-[#2B3A42]' : 'border-[#E7EBEF]';
};

/**
 * Retourne une couleur brute selon le thème
 */
export const colorThemed = (isDark: boolean, lightColor: string, darkColor: string): string => {
  return isDark ? darkColor : lightColor;
};

/**
 * Classes complètes pour les composants communs
 */
export const themedClasses = {
  screen: (isDark: boolean) => tw.style(isDark ? 'bg-[#0A0E12]' : 'bg-[#F5F7FA]', 'flex-1'),

  card: (isDark: boolean) => tw.style('rounded-2xl p-4', isDark ? 'bg-[#1C242C] border border-[#2B3A42]' : 'bg-white shadow-sm'),

  button: {
    primary: (isDark: boolean) => tw.style('px-6 py-4 rounded-2xl items-center', 'bg-storm-500'),
    secondary: (isDark: boolean) => tw.style('px-6 py-4 rounded-2xl items-center', isDark ? 'bg-[#151B21]' : 'bg-[#F5F7FA]'),
  },

  text: {
    primary: (isDark: boolean) => tw.style('text-base', isDark ? 'text-[#F5F7FA]' : 'text-[#2B3A42]'),
    secondary: (isDark: boolean) => tw.style('text-sm', isDark ? 'text-[#B8C5D0]' : 'text-[#5C7A89]'),
  },
};
