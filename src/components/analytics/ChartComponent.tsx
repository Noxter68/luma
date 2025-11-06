import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Animated, Dimensions, TouchableOpacity } from 'react-native';
import Svg, { Path, Circle, Text as SvgText, Defs, LinearGradient as SvgGradient, Stop, Rect, Line, G } from 'react-native-svg';
import { BarChart3, TrendingUp } from 'lucide-react-native';
import tw from '../../lib/tailwind';

const { width: screenWidth } = Dimensions.get('window');

interface ChartData {
  month: string;
  monthFull: string;
  value: number;
  income?: number;
  expenses?: number;
  savings?: number;
}

interface ChartComponentProps {
  data: ChartData[];
  mode: 'expenses' | 'savings';
  onPointSelect?: (index: number | null) => void;
  selectedIndex?: number | null;
  isDark: boolean;
  colors: any;
  formatCurrency: (value: number) => string;
}

export const ChartComponent: React.FC<ChartComponentProps> = ({ data, mode, onPointSelect, selectedIndex, isDark, colors, formatCurrency }) => {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const animationValues = useRef(data.map(() => new Animated.Value(0))).current;
  const barAnimations = useRef(data.map(() => new Animated.Value(0))).current;

  const CHART_WIDTH = screenWidth - 48;
  const CHART_HEIGHT = 220;
  const PADDING_TOP = 20;
  const PADDING_BOTTOM = 50;
  const PADDING_HORIZONTAL = 5;

  const chartableHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const chartableWidth = CHART_WIDTH - PADDING_HORIZONTAL * 2;

  // Animate bars on mount or type change
  useEffect(() => {
    if (chartType === 'bar') {
      barAnimations.forEach((anim, index) => {
        Animated.spring(anim, {
          toValue: 1,
          delay: index * 50,
          useNativeDriver: true,
          damping: 15,
          stiffness: 150,
        }).start();
      });
    } else {
      barAnimations.forEach((anim) => {
        anim.setValue(0);
      });
    }
  }, [chartType, data]);

  const getValues = () => {
    return data.map((d) => {
      if (mode === 'expenses') {
        return d.expenses || d.value || 0;
      } else {
        return d.savings || d.value || 0;
      }
    });
  };

  const values = getValues();
  const maxValue = Math.max(...values, 100);
  const minValue = Math.min(...values, 0);
  const range = maxValue - minValue || 1;

  // Calculate points for line chart
  const calculateLinePoints = () => {
    const stepX = data.length > 1 ? chartableWidth / (data.length - 1) : chartableWidth;

    return values.map((value, i) => ({
      x: PADDING_HORIZONTAL + i * stepX,
      y: PADDING_TOP + chartableHeight - ((value - minValue) / range) * chartableHeight,
      value: value,
    }));
  };

  // Generate smooth path for line chart
  const generatePath = () => {
    const points = calculateLinePoints();
    if (points.length === 0) return '';

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cp1x = prev.x + (curr.x - prev.x) * 0.3;
      const cp1y = prev.y;
      const cp2x = prev.x + (curr.x - prev.x) * 0.7;
      const cp2y = curr.y;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
    }

    return path;
  };

  // Calculate bar dimensions
  const calculateBars = () => {
    const barWidth = (chartableWidth / data.length) * 0.6;
    const barSpacing = (chartableWidth / data.length) * 0.4;
    const totalBarWidth = barWidth + barSpacing;

    return values.map((value, i) => {
      const barHeight = ((Math.abs(value) - minValue) / range) * chartableHeight;
      return {
        x: PADDING_HORIZONTAL + i * totalBarWidth + barSpacing / 2,
        y: PADDING_TOP + chartableHeight - barHeight,
        width: barWidth,
        height: barHeight,
        value: value,
      };
    });
  };

  const handleTouch = (event: any) => {
    const { locationX } = event.nativeEvent;
    if (!onPointSelect) return;

    if (chartType === 'line') {
      const points = calculateLinePoints();
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
      const bars = calculateBars();
      const index = bars.findIndex((bar) => locationX >= bar.x && locationX <= bar.x + bar.width);
      onPointSelect(index >= 0 ? index : null);
    }
  };

  const linePoints = calculateLinePoints();
  const bars = calculateBars();
  const path = generatePath();

  // Grid lines values
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  return (
    <View>
      {/* Chart Type Toggle */}
      <View style={tw`flex-row justify-end mb-3 pr-2`}>
        <View style={[tw`flex-row rounded-lg p-0.5`, { backgroundColor: isDark ? colors.dark?.surface : colors.light?.border }]}>
          <TouchableOpacity
            onPress={() => setChartType('line')}
            style={[tw`px-3 py-1.5 rounded-md flex-row items-center gap-1`, chartType === 'line' && { backgroundColor: isDark ? colors.dark?.card : 'white' }]}
          >
            <TrendingUp size={14} color={chartType === 'line' ? colors.primary : isDark ? colors.dark?.textSecondary : colors.light?.textSecondary} strokeWidth={2} />
            <Text style={[{ fontSize: 11, fontWeight: '600' }, { color: chartType === 'line' ? colors.primary : isDark ? colors.dark?.textSecondary : colors.light?.textSecondary }]}>Line</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setChartType('bar')}
            style={[tw`px-3 py-1.5 rounded-md flex-row items-center gap-1`, chartType === 'bar' && { backgroundColor: isDark ? colors.dark?.card : 'white' }]}
          >
            <BarChart3 size={14} color={chartType === 'bar' ? colors.primary : isDark ? colors.dark?.textSecondary : colors.light?.textSecondary} strokeWidth={2} />
            <Text style={[{ fontSize: 11, fontWeight: '600' }, { color: chartType === 'bar' ? colors.primary : isDark ? colors.dark?.textSecondary : colors.light?.textSecondary }]}>Bars</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chart */}
      <Svg
        width={CHART_WIDTH}
        height={CHART_HEIGHT}
        onPress={handleTouch}
        onMoveShouldSetResponder={() => true}
        onResponderMove={handleTouch}
        onResponderRelease={() => onPointSelect && onPointSelect(null)}
      >
        <Defs>
          <SvgGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={mode === 'savings' ? colors.primary : colors.secondary || '#9B8AA0'} stopOpacity="0.15" />
            <Stop offset="1" stopColor={mode === 'savings' ? colors.primary : colors.secondary || '#9B8AA0'} stopOpacity="0.01" />
          </SvgGradient>
        </Defs>

        {/* Grid lines */}
        {gridLines.map((ratio, i) => (
          <G key={`grid-${i}`}>
            <Line
              x1={PADDING_HORIZONTAL}
              x2={CHART_WIDTH - PADDING_HORIZONTAL}
              y1={PADDING_TOP + chartableHeight * ratio}
              y2={PADDING_TOP + chartableHeight * ratio}
              stroke={isDark ? colors.dark?.border : colors.light?.border}
              strokeWidth="0.5"
              strokeOpacity="0.2"
              strokeDasharray={i === 0 || i === gridLines.length - 1 ? '0' : '3 3'}
            />

            {/* Value labels on the left */}
            {i % 2 === 0 && (
              <SvgText
                x={PADDING_HORIZONTAL - 5}
                y={PADDING_TOP + chartableHeight * ratio + 3}
                fontSize="9"
                fill={isDark ? colors.dark?.textTertiary : colors.light?.textTertiary}
                textAnchor="end"
                opacity="0.5"
              >
                {formatCurrency(maxValue - (maxValue - minValue) * ratio)
                  .replace(/[€$]/, '')
                  .replace(/\s/g, '')}
              </SvgText>
            )}
          </G>
        ))}

        {/* Line Chart */}
        {chartType === 'line' && (
          <G>
            {/* Area fill */}
            <Path
              d={`${path} L ${linePoints[linePoints.length - 1]?.x || 0} ${CHART_HEIGHT - PADDING_BOTTOM} L ${linePoints[0]?.x || 0} ${CHART_HEIGHT - PADDING_BOTTOM} Z`}
              fill="url(#chartGradient)"
            />

            {/* Main line */}
            <Path d={path} stroke={mode === 'savings' ? colors.primary : colors.secondary || '#9B8AA0'} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

            {/* Points */}
            {linePoints.map((point, i) => (
              <G key={`point-${i}`}>
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r={selectedIndex === i ? '7' : '5'}
                  fill="white"
                  stroke={mode === 'savings' ? colors.primary : colors.secondary || '#9B8AA0'}
                  strokeWidth={selectedIndex === i ? '3' : '2'}
                />

                {/* Value tooltip */}
                {selectedIndex === i && (
                  <G>
                    <Rect
                      x={point.x - 38}
                      y={point.y - 38}
                      width={76}
                      height={28}
                      rx={6}
                      fill={isDark ? colors.dark?.card : 'white'}
                      stroke={isDark ? colors.dark?.border : colors.light?.border}
                      strokeWidth="1"
                      opacity="0.95"
                    />
                    <SvgText x={point.x} y={point.y - 20} fontSize="12" fontWeight="700" fill={isDark ? colors.dark?.textPrimary : colors.light?.textPrimary} textAnchor="middle">
                      {formatCurrency(point.value).replace(/\s/g, '')}
                    </SvgText>
                  </G>
                )}
              </G>
            ))}
          </G>
        )}

        {/* Bar Chart */}
        {chartType === 'bar' &&
          bars.map((bar, i) => (
            <G key={`bar-${i}`}>
              <AnimatedRect
                x={bar.x}
                y={bar.y}
                width={bar.width}
                height={bar.height}
                fill={mode === 'savings' ? colors.primary : colors.secondary || '#9B8AA0'}
                opacity={selectedIndex === i ? 1 : 0.8}
                rx={4}
                style={{
                  transform: [
                    {
                      scaleY: barAnimations[i],
                    },
                  ],
                  transformOrigin: `${bar.x + bar.width / 2}px ${CHART_HEIGHT - PADDING_BOTTOM}px`,
                }}
              />

              {/* Value on top of bar */}
              {selectedIndex === i && (
                <SvgText x={bar.x + bar.width / 2} y={bar.y - 8} fontSize="11" fontWeight="700" fill={mode === 'savings' ? colors.primary : colors.secondary || '#9B8AA0'} textAnchor="middle">
                  {formatCurrency(bar.value).replace(/\s/g, '')}
                </SvgText>
              )}
            </G>
          ))}

        {/* Month labels */}
        {data.map((item, i) => {
          const x = chartType === 'bar' ? bars[i].x + bars[i].width / 2 : linePoints[i]?.x;

          return (
            <SvgText
              key={`label-${i}`}
              x={x}
              y={CHART_HEIGHT - 25}
              fontSize="10"
              fontWeight={selectedIndex === i ? '700' : '500'}
              fill={selectedIndex === i ? (mode === 'savings' ? colors.primary : colors.secondary || '#9B8AA0') : isDark ? colors.dark?.textTertiary : colors.light?.textTertiary}
              textAnchor="middle"
            >
              {item.month}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
};

// Animated Rect component
const AnimatedRect = Animated.createAnimatedComponent(Rect);
