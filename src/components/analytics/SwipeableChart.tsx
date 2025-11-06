import React, { useRef, useMemo } from 'react';
import { View, Text, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, interpolate, withTiming, withDelay, withSpring } from 'react-native-reanimated';
import Svg, { Path, Circle, Text as SvgText, Defs, LinearGradient as SvgGradient, Stop, Rect, Line, G } from 'react-native-svg';
import tw from '../../lib/tailwind';

const { width: screenWidth } = Dimensions.get('window');

interface ChartData {
  month: string;
  monthFull: string;
  expenses: number;
  savings: number;
}

interface SwipeableChartProps {
  data: ChartData[];
  mode: 'expenses' | 'savings';
  onPointSelect?: (index: number | null) => void;
  selectedIndex?: number | null;
  isDark: boolean;
  colors: any;
  formatCurrency: (value: number) => string;
  globalScale: {
    maxExpenses: number;
    minExpenses: number;
    maxSavings: number;
    minSavings: number;
  };
}

export const SwipeableChart: React.FC<SwipeableChartProps> = ({ data, mode, onPointSelect, selectedIndex, isDark, colors, formatCurrency, globalScale }) => {
  const scrollX = useSharedValue(0);
  const currentIndex = useSharedValue(0);

  // Utiliser useRef pour éviter des re-renders inutiles
  const lastModeRef = useRef(mode);
  const isInitialMount = useRef(true);

  // Dimensions
  const CARD_PADDING = 16;
  const CONTAINER_WIDTH = screenWidth - 32 - CARD_PADDING * 2;
  const CHART_WIDTH = CONTAINER_WIDTH;
  const CHART_HEIGHT = 220;
  const PADDING_TOP = 25;
  const PADDING_BOTTOM = 45;
  const PADDING_LEFT = 15;
  const PADDING_RIGHT = 15;

  const chartableHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const chartableWidth = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;

  // Valeurs et échelle - MÉMORISÉES
  const values = useMemo(() => {
    return data.map((d) => (mode === 'expenses' ? d.expenses : d.savings));
  }, [data, mode]);

  const { maxValue, minValue, range } = useMemo(() => {
    const max = mode === 'expenses' ? globalScale.maxExpenses : globalScale.maxSavings;
    const min = mode === 'expenses' ? globalScale.minExpenses : globalScale.minSavings;
    const r = max - min || 1;
    return { maxValue: max, minValue: min, range: r };
  }, [mode, globalScale]);

  // Calculer les hauteurs des barres - MÉMORISÉ
  const barHeights = useMemo(() => {
    return values.map((value) => {
      return ((Math.abs(value) - minValue) / range) * chartableHeight;
    });
  }, [values, minValue, range, chartableHeight]);

  // Points pour le line chart - MÉMORISÉ
  const linePoints = useMemo(() => {
    const stepX = data.length > 1 ? chartableWidth / (data.length - 1) : chartableWidth;

    return values.map((value, i) => ({
      x: PADDING_LEFT + i * stepX,
      y: PADDING_TOP + chartableHeight - ((value - minValue) / range) * chartableHeight,
      value: value,
    }));
  }, [data.length, values, minValue, range, chartableWidth]);

  // Path pour le line chart - MÉMORISÉ
  const path = useMemo(() => {
    const points = linePoints;
    if (points.length === 0) return '';

    let p = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cp1x = prev.x + (curr.x - prev.x) * 0.3;
      const cp1y = prev.y;
      const cp2x = prev.x + (curr.x - prev.x) * 0.7;
      const cp2y = curr.y;
      p += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }

    return p;
  }, [linePoints]);

  // Bars - MÉMORISÉ
  const bars = useMemo(() => {
    const barWidth = (chartableWidth / data.length) * 0.5;
    const barGap = (chartableWidth / data.length) * 0.5;
    const stepX = chartableWidth / data.length;

    return values.map((value, i) => {
      const height = barHeights[i] || 0;
      return {
        x: PADDING_LEFT + i * stepX + barGap / 2,
        y: PADDING_TOP + chartableHeight - height,
        width: barWidth,
        height: height,
        value: value,
      };
    });
  }, [data.length, values, barHeights, chartableWidth]);

  // Scroll handler
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      currentIndex.value = Math.round(event.contentOffset.x / CONTAINER_WIDTH);
    },
  });

  // Touch handlers
  const handleTouch = (locationX: number, chartType: 'line' | 'bar') => {
    if (!onPointSelect) return;

    if (chartType === 'line') {
      const points = linePoints;
      let closestIndex = 0;
      let minDistance = Math.abs(points[0].x - locationX);

      points.forEach((point, index) => {
        const distance = Math.abs(point.x - locationX);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });
      onPointSelect(closestIndex);
    } else {
      const index = bars.findIndex((bar) => locationX >= bar.x && locationX <= bar.x + bar.width);
      onPointSelect(index >= 0 ? index : null);
    }
  };

  // Grid lines
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  // Indicator animations
  const indicator1Style = useAnimatedStyle(() => {
    const width = interpolate(scrollX.value, [0, CONTAINER_WIDTH], [16, 8]);
    return { width: withTiming(width, { duration: 200 }) };
  });

  const indicator2Style = useAnimatedStyle(() => {
    const width = interpolate(scrollX.value, [0, CONTAINER_WIDTH], [8, 16]);
    return { width: withTiming(width, { duration: 200 }) };
  });

  const chartColor = mode === 'savings' ? colors.primary : colors.secondary || '#9B8AA0';

  return (
    <View>
      {/* Chart Indicator */}
      <View style={tw`flex-row justify-center mb-2`}>
        <View style={tw`flex-row gap-1`}>
          <Animated.View style={[tw`h-1 rounded-full`, { backgroundColor: colors.primary }, indicator1Style]} />
          <Animated.View style={[tw`h-1 rounded-full`, { backgroundColor: isDark ? colors.dark?.border : colors.light?.border }, indicator2Style]} />
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
        contentContainerStyle={{ width: CONTAINER_WIDTH * 2 }}
      >
        {/* Line Chart */}
        <View style={{ width: CONTAINER_WIDTH }}>
          <Svg width={CHART_WIDTH} height={CHART_HEIGHT} onPress={(e) => handleTouch(e.nativeEvent.locationX, 'line')}>
            <Defs>
              <SvgGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={chartColor} stopOpacity="0.12" />
                <Stop offset="1" stopColor={chartColor} stopOpacity="0" />
              </SvgGradient>
            </Defs>

            {/* Grid */}
            {gridLines.map((ratio, i) => (
              <Line
                key={`grid-line-${i}`}
                x1={PADDING_LEFT}
                x2={CHART_WIDTH - PADDING_RIGHT}
                y1={PADDING_TOP + chartableHeight * ratio}
                y2={PADDING_TOP + chartableHeight * ratio}
                stroke={isDark ? colors.dark?.border : colors.light?.border}
                strokeWidth="0.5"
                strokeOpacity="0.15"
                strokeDasharray={i === 0 || i === gridLines.length - 1 ? '0' : '2 4'}
              />
            ))}

            {/* Area */}
            <Path
              d={`${path} L ${linePoints[linePoints.length - 1]?.x || 0} ${CHART_HEIGHT - PADDING_BOTTOM} L ${linePoints[0]?.x || 0} ${CHART_HEIGHT - PADDING_BOTTOM} Z`}
              fill="url(#lineGradient)"
            />

            {/* Line */}
            <Path d={path} stroke={chartColor} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

            {/* Points */}
            {linePoints.map((point, i) => (
              <G key={`line-point-${i}`}>
                <Circle cx={point.x} cy={point.y} r={selectedIndex === i ? '7' : '4'} fill="white" stroke={chartColor} strokeWidth={selectedIndex === i ? '3' : '2'} />

                {/* Tooltip */}
                {selectedIndex === i && (
                  <G>
                    {(() => {
                      const tooltipWidth = 72;
                      const tooltipHeight = 26;
                      let tooltipX = point.x - tooltipWidth / 2;
                      let tooltipY = point.y - 36;

                      if (tooltipX < PADDING_LEFT) tooltipX = PADDING_LEFT + 5;
                      if (tooltipX + tooltipWidth > CHART_WIDTH - PADDING_RIGHT) {
                        tooltipX = CHART_WIDTH - PADDING_RIGHT - tooltipWidth - 5;
                      }
                      if (tooltipY < PADDING_TOP) tooltipY = point.y + 15;

                      return (
                        <>
                          <Rect
                            x={tooltipX}
                            y={tooltipY}
                            width={tooltipWidth}
                            height={tooltipHeight}
                            rx={6}
                            fill={isDark ? colors.dark?.card : 'white'}
                            stroke={isDark ? colors.dark?.border : colors.light?.border}
                            strokeWidth="1"
                          />
                          <SvgText
                            x={tooltipX + tooltipWidth / 2}
                            y={tooltipY + tooltipHeight / 2 + 4}
                            fontSize="11"
                            fontWeight="700"
                            fill={isDark ? colors.dark?.textPrimary : colors.light?.textPrimary}
                            textAnchor="middle"
                          >
                            {formatCurrency(point.value).replace(/\s/g, '')}
                          </SvgText>
                        </>
                      );
                    })()}
                  </G>
                )}

                {/* Month label */}
                <SvgText
                  x={point.x}
                  y={CHART_HEIGHT - 20}
                  fontSize="10"
                  fontWeight={selectedIndex === i ? '700' : '500'}
                  fill={selectedIndex === i ? chartColor : isDark ? colors.dark?.textTertiary : colors.light?.textTertiary}
                  textAnchor="middle"
                >
                  {data[i].month}
                </SvgText>
              </G>
            ))}
          </Svg>
        </View>

        {/* Bar Chart */}
        <View style={{ width: CONTAINER_WIDTH }}>
          <Svg width={CHART_WIDTH} height={CHART_HEIGHT} onPress={(e) => handleTouch(e.nativeEvent.locationX, 'bar')}>
            {/* Grid */}
            {gridLines.map((ratio, i) => (
              <Line
                key={`grid-bar-${i}`}
                x1={PADDING_LEFT}
                x2={CHART_WIDTH - PADDING_RIGHT}
                y1={PADDING_TOP + chartableHeight * ratio}
                y2={PADDING_TOP + chartableHeight * ratio}
                stroke={isDark ? colors.dark?.border : colors.light?.border}
                strokeWidth="0.5"
                strokeOpacity="0.15"
                strokeDasharray={i === 0 || i === gridLines.length - 1 ? '0' : '2 4'}
              />
            ))}

            {/* Bars */}
            {bars.map((bar, i) => (
              <G key={`bar-${i}`}>
                <Rect x={bar.x} y={bar.y} width={bar.width} height={bar.height} fill={chartColor} opacity={selectedIndex === i ? 1 : 0.85} rx={3} />

                {/* Value on top */}
                {selectedIndex === i && (
                  <SvgText x={bar.x + bar.width / 2} y={bar.y - 8} fontSize="11" fontWeight="700" fill={chartColor} textAnchor="middle">
                    {formatCurrency(bar.value).replace(/\s/g, '')}
                  </SvgText>
                )}

                {/* Month label */}
                <SvgText
                  x={bar.x + bar.width / 2}
                  y={CHART_HEIGHT - 20}
                  fontSize="10"
                  fontWeight={selectedIndex === i ? '700' : '500'}
                  fill={selectedIndex === i ? chartColor : isDark ? colors.dark?.textTertiary : colors.light?.textTertiary}
                  textAnchor="middle"
                >
                  {data[i].month}
                </SvgText>
              </G>
            ))}
          </Svg>
        </View>
      </Animated.ScrollView>
    </View>
  );
};
