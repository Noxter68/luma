import { View, ViewStyle } from 'react-native';
import { ReactNode } from 'react';
import tw from '../lib/tailwind';
import { useTheme } from '../contexts/ThemeContext';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
}

export const Card = ({ children, style }: CardProps) => {
  const { isDark, colors } = useTheme();

  return <View style={tw.style('rounded-2xl p-6', isDark ? `bg-[${colors.dark.card}] border border-[${colors.dark.border}]` : 'bg-white shadow-sm', style)}>{children}</View>;
};
