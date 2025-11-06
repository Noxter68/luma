import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, LayoutChangeEvent } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, interpolate } from 'react-native-reanimated';
import tw from '../../lib/tailwind';
import { useTheme } from '../../contexts/ThemeContext';

interface Option<T> {
  value: T;
  label: string;
  icon?: React.ReactNode;
}

interface SegmentedControlProps<T> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  type?: 'compact' | 'icon';
}

export const SegmentedControl = <T extends string | number>({ options, value, onChange, type = 'compact' }: SegmentedControlProps<T>) => {
  const { isDark, colors } = useTheme();
  const slideAnim = useSharedValue(0);
  const containerWidth = useSharedValue(0);

  // Calculer l'index sélectionné
  const selectedIndex = options.findIndex((opt) => opt.value === value);

  // Animer la position du slider
  useEffect(() => {
    slideAnim.value = withSpring(selectedIndex, {
      damping: 15,
      stiffness: 150,
      mass: 0.5,
    });
  }, [selectedIndex]);

  const handleLayout = (event: LayoutChangeEvent) => {
    containerWidth.value = event.nativeEvent.layout.width;
  };

  // Calculer la largeur d'un segment (en tenant compte du padding)
  const segmentCount = options.length;

  // Animation du slider basée sur la largeur réelle du container
  const animatedStyle = useAnimatedStyle(() => {
    // Calculer la largeur disponible (container - padding des côtés)
    const padding = 4; // 0.25rem de padding de chaque côté = 4px total
    const availableWidth = containerWidth.value - padding * 2;
    const segmentWidth = availableWidth / segmentCount;

    // Position de départ (avec padding initial)
    const startX = padding;

    // Calculer la position X basée sur l'index
    const translateX = interpolate(
      slideAnim.value,
      options.map((_, i) => i),
      options.map((_, i) => startX + i * segmentWidth)
    );

    return {
      transform: [{ translateX }],
      width: segmentWidth,
    };
  });

  const isCompact = type === 'compact';
  const containerBg = isDark ? `${colors.dark?.surface}` : `${colors.light?.border}40`;
  const slideBg = isDark ? colors.dark?.card : 'white';

  return (
    <View style={[tw`flex-row rounded-xl p-1 relative`, { backgroundColor: containerBg }]} onLayout={handleLayout}>
      {/* Sliding background */}
      <Animated.View
        style={[
          tw`absolute rounded-lg`,
          {
            top: 4,
            bottom: 4,
            backgroundColor: slideBg,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05,
            shadowRadius: 2,
            elevation: 2,
          },
          animatedStyle,
        ]}
      />

      {/* Options */}
      {options.map((option) => {
        const isSelected = option.value === value;

        return (
          <TouchableOpacity
            key={String(option.value)}
            onPress={() => onChange(option.value)}
            style={[tw`flex-1 rounded-lg items-center justify-center z-10`, isCompact ? tw`py-1.5` : tw`py-2`, isCompact ? tw`px-2` : tw`px-3`]}
          >
            {option.icon ? (
              <View>{option.icon}</View>
            ) : (
              <Text
                style={[
                  tw`font-semibold`,
                  {
                    fontSize: isCompact ? 12 : 13,
                    color: isSelected ? colors.primary : isDark ? colors.dark?.textSecondary : colors.light?.textSecondary,
                  },
                ]}
              >
                {option.label}
              </Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};
