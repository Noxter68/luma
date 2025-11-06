import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, interpolate, withTiming } from 'react-native-reanimated';
import tw from '../../lib/tailwind';
import { ComparisonBar } from './ComparisonBar';

const { width: screenWidth } = Dimensions.get('window');

interface SwipeableComparisonsProps {
  expensesData: {
    previous: number;
    current: number;
  };
  savingsData: {
    previous: number;
    current: number;
  };
  dailyData: {
    previous: number;
    current: number;
    projected: number;
  };
  formatCurrency: (value: number) => string;
  isDark: boolean;
  colors: any;
  locale: string;
}

export const SwipeableComparisons: React.FC<SwipeableComparisonsProps> = ({ expensesData, savingsData, dailyData, formatCurrency, isDark, colors, locale }) => {
  const scrollX = useSharedValue(0);
  const currentIndex = useSharedValue(0);

  const CARD_PADDING = 16;
  const CONTAINER_WIDTH = screenWidth - 32 - CARD_PADDING * 2;

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      currentIndex.value = Math.round(event.contentOffset.x / CONTAINER_WIDTH);
    },
  });

  // Indicator animations
  const indicator1Style = useAnimatedStyle(() => {
    const width = interpolate(scrollX.value, [0, CONTAINER_WIDTH, CONTAINER_WIDTH * 2], [16, 8, 8]);
    return { width: withTiming(width, { duration: 200 }) };
  });

  const indicator2Style = useAnimatedStyle(() => {
    const width = interpolate(scrollX.value, [0, CONTAINER_WIDTH, CONTAINER_WIDTH * 2], [8, 16, 8]);
    return { width: withTiming(width, { duration: 200 }) };
  });

  const indicator3Style = useAnimatedStyle(() => {
    const width = interpolate(scrollX.value, [0, CONTAINER_WIDTH, CONTAINER_WIDTH * 2], [8, 8, 16]);
    return { width: withTiming(width, { duration: 200 }) };
  });

  return (
    <View>
      {/* Indicators */}
      <View style={tw`flex-row justify-center mb-4`}>
        <View style={tw`flex-row gap-1`}>
          <Animated.View style={[tw`h-1 rounded-full`, { backgroundColor: colors.primary }, indicator1Style]} />
          <Animated.View
            style={[
              tw`h-1 rounded-full`,
              {
                backgroundColor: isDark ? colors.dark?.border : colors.light?.border,
              },
              indicator2Style,
            ]}
          />
          <Animated.View
            style={[
              tw`h-1 rounded-full`,
              {
                backgroundColor: isDark ? colors.dark?.border : colors.light?.border,
              },
              indicator3Style,
            ]}
          />
        </View>
      </View>

      {/* Swipeable Carousel */}
      <Animated.ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={CONTAINER_WIDTH}
        snapToAlignment="start"
        contentContainerStyle={{ width: CONTAINER_WIDTH * 3 }}
      >
        {/* Expenses Comparison */}
        <View style={{ width: CONTAINER_WIDTH }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              marginBottom: 16,
              textAlign: 'center',
              color: isDark ? colors.dark?.textPrimary : colors.light?.textPrimary,
            }}
          >
            {locale === 'fr' ? 'Dépenses' : 'Expenses'}
          </Text>
          <ComparisonBar
            leftValue={expensesData.previous}
            rightValue={expensesData.current}
            leftLabel={locale === 'fr' ? 'Mois précédent' : 'Last Month'}
            rightLabel={locale === 'fr' ? 'Ce mois' : 'This Month'}
            formatValue={formatCurrency}
            isDark={isDark}
            colors={colors}
          />
        </View>

        {/* Savings Comparison */}
        <View style={{ width: CONTAINER_WIDTH }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              marginBottom: 16,
              textAlign: 'center',
              color: isDark ? colors.dark?.textPrimary : colors.light?.textPrimary,
            }}
          >
            {locale === 'fr' ? 'Épargne' : 'Savings'}
          </Text>
          <ComparisonBar
            leftValue={savingsData.previous}
            rightValue={savingsData.current}
            leftLabel={locale === 'fr' ? 'Mois précédent' : 'Last Month'}
            rightLabel={locale === 'fr' ? 'Ce mois' : 'This Month'}
            formatValue={formatCurrency}
            isDark={isDark}
            colors={colors}
          />
        </View>

        {/* Daily Average */}
        <View style={{ width: CONTAINER_WIDTH }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: '700',
              marginBottom: 16,
              textAlign: 'center',
              color: isDark ? colors.dark?.textPrimary : colors.light?.textPrimary,
            }}
          >
            {locale === 'fr' ? 'Moyenne quotidienne' : 'Daily Average'}
          </Text>
          <ComparisonBar
            leftValue={dailyData.previous}
            rightValue={dailyData.current}
            leftLabel={locale === 'fr' ? 'Mois dernier' : 'Last Month'}
            rightLabel={locale === 'fr' ? 'Ce mois' : 'This Month'}
            formatValue={formatCurrency}
            isDark={isDark}
            colors={colors}
            showPercentage={false}
          />

          {/* Projection */}
          <View
            style={[
              tw`p-3 rounded-xl mt-4 mx-8`,
              {
                backgroundColor: isDark ? `${colors.dark?.surface}80` : `${colors.light?.bg}`,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 11,
                textAlign: 'center',
                color: isDark ? colors.dark?.textSecondary : colors.light?.textSecondary,
              }}
            >
              {locale === 'fr' ? `Projection: ${formatCurrency(dailyData.projected)}` : `Projected: ${formatCurrency(dailyData.projected)}`}
            </Text>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Swipe hint */}
      <Text
        style={[
          tw`text-center mt-3`,
          {
            fontSize: 10,
            color: isDark ? colors.dark?.textTertiary : colors.light?.textTertiary,
            opacity: 0.6,
          },
        ]}
      >
        {locale === 'fr' ? '← Glissez pour voir plus →' : '← Swipe to see more →'}
      </Text>
    </View>
  );
};
