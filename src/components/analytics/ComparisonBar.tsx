import React from 'react';
import { View, Text } from 'react-native';
import tw from '../../lib/tailwind';

interface ComparisonBarProps {
  leftValue: number;
  rightValue: number;
  leftLabel: string;
  rightLabel: string;
  formatValue: (value: number) => string;
  isDark: boolean;
  colors: any;
  showPercentage?: boolean;
}

export const ComparisonBar: React.FC<ComparisonBarProps> = ({ leftValue, rightValue, leftLabel, rightLabel, formatValue, isDark, colors, showPercentage = true }) => {
  const maxValue = Math.max(leftValue, rightValue, 1);
  const leftHeight = (leftValue / maxValue) * 100;
  const rightHeight = (rightValue / maxValue) * 100;

  const diff = rightValue - leftValue;
  const percentChange = leftValue !== 0 ? (diff / leftValue) * 100 : 0;

  return (
    <View style={tw`flex-row gap-4 items-end justify-center px-8`}>
      {/* Left Bar */}
      <View style={tw`flex-1 items-center`}>
        {/* Value on top */}
        <Text
          style={{
            fontSize: 20,
            fontWeight: '700',
            marginBottom: 8,
            color: isDark ? colors.dark?.textPrimary : colors.light?.textPrimary,
          }}
        >
          {formatValue(leftValue)}
        </Text>

        {/* Bar */}
        <View
          style={[
            tw`w-full rounded-t-2xl`,
            {
              height: Math.max(leftHeight * 1.6, 60), // Barres plus hautes
              backgroundColor: isDark ? `${colors.dark?.border}50` : `${colors.light?.border}70`,
            },
          ]}
        />

        {/* Label */}
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            marginTop: 10,
            textAlign: 'center',
            color: isDark ? colors.dark?.textTertiary : colors.light?.textTertiary,
          }}
        >
          {leftLabel}
        </Text>
      </View>

      {/* Right Bar */}
      <View style={tw`flex-1 items-center`}>
        {/* Value on top with percentage */}
        <View style={tw`mb-8 items-center`}>
          <Text
            style={{
              fontSize: 20,
              fontWeight: '700',
              color: isDark ? colors.dark?.textPrimary : colors.light?.textPrimary,
            }}
          >
            {formatValue(rightValue)}
          </Text>
          {showPercentage && percentChange !== 0 && (
            <Text
              style={{
                fontSize: 13,
                fontWeight: '700',
                marginTop: 3,
                color: diff > 0 ? colors.primary : '#ef4444',
              }}
            >
              {diff > 0 ? '+' : ''}
              {percentChange.toFixed(0)}%
            </Text>
          )}
        </View>

        {/* Bar */}
        <View
          style={[
            tw`w-full rounded-t-2xl`,
            {
              height: Math.max(rightHeight * 1.6, 60),
              backgroundColor: colors.primary,
            },
          ]}
        />

        {/* Label */}
        <Text
          style={{
            fontSize: 12,
            fontWeight: '600',
            marginTop: 10,
            textAlign: 'center',
            color: isDark ? colors.dark?.textTertiary : colors.light?.textTertiary,
          }}
        >
          {rightLabel}
        </Text>
      </View>
    </View>
  );
};
