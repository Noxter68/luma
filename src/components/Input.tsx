import { TextInput, Text, View, TextInputProps } from 'react-native';
import tw from '../lib/tailwind';
import { useTheme } from '../contexts/ThemeContext';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: TextInputProps['keyboardType'];
  multiline?: boolean;
}

export const Input = ({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false }: InputProps) => {
  const { isDark, colors } = useTheme();

  return (
    <View style={tw`mb-4`}>
      <Text style={tw.style('text-sm mb-2 font-medium', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        multiline={multiline}
        style={tw.style(
          'rounded-2xl px-4 py-3 text-base border',
          isDark ? `bg-[${colors.dark.surface}] text-[${colors.dark.textPrimary}] border-[${colors.dark.border}]` : `bg-white text-[${colors.light.textPrimary}] border-[${colors.light.border}]`,
          multiline && 'min-h-[80px]'
        )}
        placeholderTextColor={isDark ? colors.dark.textTertiary : colors.light.textTertiary}
      />
    </View>
  );
};
