import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { ReactNode } from 'react';

interface ButtonProps {
  onPress: () => void;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
  loading?: boolean;
  disabled?: boolean;
}

export const Button = ({ onPress, children, variant = 'primary', loading = false, disabled = false }: ButtonProps) => {
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} style={[styles.button, variant === 'primary' ? styles.primary : styles.secondary, (disabled || loading) && styles.disabled]}>
      {loading ? <ActivityIndicator color="#F5F2EB" /> : <Text style={styles.buttonText}>{children}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: '#A3B18A',
  },
  secondary: {
    backgroundColor: '#DAD7CD',
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#F5F2EB',
    fontSize: 16,
    fontWeight: '600',
  },
});
