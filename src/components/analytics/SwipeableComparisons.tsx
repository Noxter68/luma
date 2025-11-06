import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, interpolate, withTiming } from 'react-native-reanimated';
import tw from '../../lib/tailwind';
import { ComparisonBar } from './ComparisonBar';

const { width: screenWidth } = Dimensions.get('window');

// ============================================
// TYPES
// ============================================
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

// ============================================
// COMPONENT
// ============================================
export const SwipeableComparisons: React.FC<SwipeableComparisonsProps> = ({ expensesData, savingsData, dailyData, formatCurrency, isDark, colors, locale }) => {
  // ============================================
  // SHARED VALUES
  // ============================================
  const scrollX = useSharedValue(0);
  const currentIndex = useSharedValue(0);

  // ============================================
  // DIMENSIONS
  // ============================================
  const CARD_PADDING = 16;
  const CONTAINER_WIDTH = screenWidth - 32 - CARD_PADDING * 2;

  // ============================================
  // HANDLERS
  // ============================================
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      currentIndex.value = Math.round(event.contentOffset.x / CONTAINER_WIDTH);
    },
  });

  // ============================================
  // ANIMATIONS
  // ============================================

  // Indicateur 1: Expenses (actif quand scrollX = 0)
  const indicator1Style = useAnimatedStyle(() => {
    const width = interpolate(
      scrollX.value,
      [0, CONTAINER_WIDTH, CONTAINER_WIDTH * 2],
      [16, 8, 8] // Large sur 1er chart, petit sur les autres
    );
    const opacity = interpolate(
      scrollX.value,
      [0, CONTAINER_WIDTH, CONTAINER_WIDTH * 2],
      [1, 0.3, 0.3] // Opacité complète sur 1er chart, réduite sur les autres
    );
    return {
      width: withTiming(width, { duration: 120 }),
      opacity: withTiming(opacity, { duration: 120 }),
    };
  });

  // Indicateur 2: Savings (actif quand scrollX = CONTAINER_WIDTH)
  const indicator2Style = useAnimatedStyle(() => {
    const width = interpolate(
      scrollX.value,
      [0, CONTAINER_WIDTH, CONTAINER_WIDTH * 2],
      [8, 16, 8] // Petit, puis large sur 2ème chart, puis petit
    );
    const opacity = interpolate(
      scrollX.value,
      [0, CONTAINER_WIDTH, CONTAINER_WIDTH * 2],
      [0.3, 1, 0.3] // Opacité réduite, puis complète sur 2ème chart, puis réduite
    );
    return {
      width: withTiming(width, { duration: 120 }),
      opacity: withTiming(opacity, { duration: 120 }),
    };
  });

  // Indicateur 3: Daily Average (actif quand scrollX = CONTAINER_WIDTH * 2)
  const indicator3Style = useAnimatedStyle(() => {
    const width = interpolate(
      scrollX.value,
      [0, CONTAINER_WIDTH, CONTAINER_WIDTH * 2],
      [8, 8, 16] // Petit sur les 2 premiers, large sur le 3ème
    );
    const opacity = interpolate(
      scrollX.value,
      [0, CONTAINER_WIDTH, CONTAINER_WIDTH * 2],
      [0.3, 0.3, 1] // Opacité réduite sur les 2 premiers, complète sur le 3ème
    );
    return {
      width: withTiming(width, { duration: 120 }),
      opacity: withTiming(opacity, { duration: 120 }),
    };
  });

  // ============================================
  // RENDER
  // ============================================
  return (
    <View>
      {/* Indicateurs des 3 comparaisons */}
      <View style={tw`flex-row justify-center mb-4`}>
        <View style={tw`flex-row gap-1`}>
          {/* Indicateur 1: Expenses */}
          <Animated.View style={[tw`h-1 rounded-full`, { backgroundColor: colors.primary }, indicator1Style]} />

          {/* Indicateur 2: Savings */}
          <Animated.View style={[tw`h-1 rounded-full`, { backgroundColor: colors.primary }, indicator2Style]} />

          {/* Indicateur 3: Daily Average */}
          <Animated.View style={[tw`h-1 rounded-full`, { backgroundColor: colors.primary }, indicator3Style]} />
        </View>
      </View>

      {/* Carousel swipeable avec les 3 comparaisons */}
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
        {/* ==================== EXPENSES COMPARISON ==================== */}
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

        {/* ==================== SAVINGS COMPARISON ==================== */}
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

        {/* ==================== DAILY AVERAGE COMPARISON ==================== */}
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

          {/* Projection du total du mois */}
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

      {/* Indication de swipe */}
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
