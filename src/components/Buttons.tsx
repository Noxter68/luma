import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { ReactNode } from 'react';
import tw from '../lib/tailwind';
import { useTheme } from '../contexts/ThemeContext';

interface ButtonProps {
  onPress: () => void;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
}

export const Button = ({ onPress, children, variant = 'primary', loading = false, disabled = false }: ButtonProps) => {
  const { isDark, colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={tw.style(
        'px-6 py-4 rounded-2xl items-center justify-center',
        variant === 'primary' ? `bg-[${colors.primary}]` : isDark ? `bg-[${colors.dark.surface}]` : `bg-[${colors.light.border}]`,
        (disabled || loading) && 'opacity-50'
      )}
    >
      {loading ? <ActivityIndicator color="white" /> : <Text style={tw`text-white text-base font-semibold`}>{children}</Text>}
    </TouchableOpacity>
  );
};
