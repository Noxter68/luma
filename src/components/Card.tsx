import React, { ReactNode } from 'react';
import { View, ViewStyle } from 'react-native';
import tw from '../lib/tailwind';
import { useTheme } from '../contexts/ThemeContext';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
}

export const Card = ({ children, style }: CardProps) => {
  const { isDark, colors } = useTheme();

  // Padding par défaut : p-4 (16px)
  const baseStyles = tw`rounded-md p-3`;

  const themedStyles: ViewStyle = isDark
    ? {
        backgroundColor: colors.dark?.card ?? '#1C242C',
        borderColor: colors.dark?.border ?? '#2B3A42',
        borderWidth: 1,
      }
    : {
        backgroundColor: 'white',
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
      };

  return <View style={[baseStyles, themedStyles, style]}>{children}</View>;
};
