import React, { useRef, useMemo } from 'react';
import { View, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, interpolate, withTiming } from 'react-native-reanimated';
import Svg, { Path, Circle, Text as SvgText, Defs, LinearGradient as SvgGradient, Stop, Rect, Line, G } from 'react-native-svg';
import tw from '../../lib/tailwind';

const { width: screenWidth } = Dimensions.get('window');

// ============================================
// TYPES
// ============================================
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

// ============================================
// COMPONENT
// ============================================
export const SwipeableChart: React.FC<SwipeableChartProps> = ({ data, mode, onPointSelect, selectedIndex, isDark, colors, formatCurrency, globalScale }) => {
  // ============================================
  // SHARED VALUES
  // ============================================
  const scrollX = useSharedValue(0);
  const currentIndex = useSharedValue(0);

  // ============================================
  // REFS
  // ============================================
  const lastModeRef = useRef(mode);
  const isInitialMount = useRef(true);

  // ============================================
  // DIMENSIONS & CONSTANTS
  // ============================================
  // Pas de CARD_PADDING car la Card a padding: 0
  const CONTAINER_WIDTH = screenWidth - 32; // px-4 de AnalyticsScreen (16px * 2)
  const CHART_WIDTH = CONTAINER_WIDTH;
  const CHART_HEIGHT = 220;
  const PADDING_TOP = 20;
  const PADDING_BOTTOM = 35;
  const PADDING_LEFT = 10; // Plus d'espace pour le premier point
  const PADDING_RIGHT = 60; // Plus d'espace pour que le dernier mois soit visible

  const chartableHeight = CHART_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
  const chartableWidth = CHART_WIDTH - PADDING_LEFT - PADDING_RIGHT;

  // ============================================
  // MEMOIZED VALUES
  // ============================================

  // Extraire les valeurs selon le mode (expenses ou savings)
  const values = useMemo(() => {
    return data.map((d) => (mode === 'expenses' ? d.expenses : d.savings));
  }, [data, mode]);

  // Calculer l'échelle globale pour tous les graphiques
  const { maxValue, minValue, range } = useMemo(() => {
    const max = mode === 'expenses' ? globalScale.maxExpenses : globalScale.maxSavings;
    const min = mode === 'expenses' ? globalScale.minExpenses : globalScale.minSavings;
    const r = max - min || 1;
    return { maxValue: max, minValue: min, range: r };
  }, [mode, globalScale]);

  // Calculer les hauteurs des barres pour le bar chart
  const barHeights = useMemo(() => {
    return values.map((value) => {
      return ((Math.abs(value) - minValue) / range) * chartableHeight;
    });
  }, [values, minValue, range, chartableHeight]);

  // Calculer les points pour le line chart - TOUS LES POINTS VISIBLES
  const linePoints = useMemo(() => {
    const totalPoints = data.length;
    const availableWidth = chartableWidth;

    // Répartir uniformément tous les points sur la largeur disponible
    const stepX = totalPoints > 1 ? availableWidth / (totalPoints - 1) : availableWidth / 2;

    return values.map((value, i) => ({
      x: PADDING_LEFT + i * stepX,
      y: PADDING_TOP + chartableHeight - ((value - minValue) / range) * chartableHeight,
      value: value,
    }));
  }, [data.length, values, minValue, range, chartableWidth, PADDING_LEFT, chartableHeight, PADDING_TOP]);

  // Générer le path SVG pour le line chart avec courbes
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

  // Calculer les positions des barres pour le bar chart - TOUTES LES BARRES VISIBLES
  const bars = useMemo(() => {
    const totalBars = data.length;
    const availableWidth = chartableWidth;

    // Ajuster la largeur des barres selon le nombre
    const barSpacing = availableWidth / totalBars;
    const barWidth = barSpacing * 0.6; // 60% pour la barre, 40% pour l'espace
    const barGap = barSpacing * 0.2; // Centrer la barre dans son espace

    return values.map((value, i) => {
      const height = barHeights[i] || 0;
      return {
        x: PADDING_LEFT + i * barSpacing + barGap,
        y: PADDING_TOP + chartableHeight - height,
        width: barWidth,
        height: height,
        value: value,
      };
    });
  }, [data.length, values, barHeights, chartableWidth, PADDING_LEFT, chartableHeight, PADDING_TOP]);

  // ============================================
  // HANDLERS
  // ============================================

  // Gérer le scroll entre les graphiques
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      currentIndex.value = Math.round(event.contentOffset.x / CONTAINER_WIDTH);
    },
  });

  // Gérer les touches sur les graphiques
  const handleTouch = (locationX: number, chartType: 'line' | 'bar') => {
    if (!onPointSelect) return;

    if (chartType === 'line') {
      // Trouver le point le plus proche pour le line chart
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
      // Trouver la barre touchée pour le bar chart
      const index = bars.findIndex((bar) => locationX >= bar.x && locationX <= bar.x + bar.width);
      onPointSelect(index >= 0 ? index : null);
    }
  };

  // ============================================
  // ANIMATIONS & STYLES
  // ============================================

  // Lignes de grille pour les deux graphiques
  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  // Animation de l'indicateur du premier graphique (line chart)
  const indicator1Style = useAnimatedStyle(() => {
    const width = interpolate(
      scrollX.value,
      [0, CONTAINER_WIDTH],
      [16, 8] // Large (16) quand scrollX = 0 (1er chart), petit (8) quand scrollX = CONTAINER_WIDTH (2ème chart)
    );
    const opacity = interpolate(
      scrollX.value,
      [0, CONTAINER_WIDTH],
      [1, 0.3] // Opacité complète sur le 1er chart, réduite sur le 2ème
    );
    return {
      width: withTiming(width, { duration: 120 }),
      opacity: withTiming(opacity, { duration: 120 }),
    };
  });

  // Animation de l'indicateur du deuxième graphique (bar chart)
  const indicator2Style = useAnimatedStyle(() => {
    const width = interpolate(
      scrollX.value,
      [0, CONTAINER_WIDTH],
      [8, 16] // Petit (8) quand scrollX = 0 (1er chart), large (16) quand scrollX = CONTAINER_WIDTH (2ème chart)
    );
    const opacity = interpolate(
      scrollX.value,
      [0, CONTAINER_WIDTH],
      [0.3, 1] // Opacité réduite sur le 1er chart, complète sur le 2ème
    );
    return {
      width: withTiming(width, { duration: 120 }),
      opacity: withTiming(opacity, { duration: 120 }),
    };
  });

  // Couleur du graphique selon le mode
  const chartColor = mode === 'savings' ? colors.primary : colors.secondary || '#9B8AA0';

  // ============================================
  // RENDER
  // ============================================
  return (
    <View>
      {/* Indicateur de graphique actif */}
      <View style={tw`flex-row justify-center mb-2`}>
        <View style={tw`flex-row gap-1`}>
          {/* Indicateur 1: Line Chart - actif (large + opaque) quand scrollX = 0 */}
          <Animated.View style={[tw`h-1 rounded-full`, { backgroundColor: colors.primary }, indicator1Style]} />

          {/* Indicateur 2: Bar Chart - actif (large + opaque) quand scrollX = CONTAINER_WIDTH */}
          <Animated.View style={[tw`h-1 rounded-full`, { backgroundColor: colors.primary }, indicator2Style]} />
        </View>
      </View>

      {/* Carousel swipeable avec les deux graphiques */}
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
        {/* ==================== LINE CHART ==================== */}
        <View style={{ width: CONTAINER_WIDTH }}>
          <Svg width={CHART_WIDTH} height={CHART_HEIGHT} onPress={(e) => handleTouch(e.nativeEvent.locationX, 'line')}>
            {/* Dégradé pour l'aire sous la courbe */}
            <Defs>
              <SvgGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={chartColor} stopOpacity="0.12" />
                <Stop offset="1" stopColor={chartColor} stopOpacity="0" />
              </SvgGradient>
            </Defs>

            {/* Grille horizontale */}
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

            {/* Aire sous la courbe */}
            <Path
              d={`${path} L ${linePoints[linePoints.length - 1]?.x || 0} ${CHART_HEIGHT - PADDING_BOTTOM} L ${linePoints[0]?.x || 0} ${CHART_HEIGHT - PADDING_BOTTOM} Z`}
              fill="url(#lineGradient)"
            />

            {/* Courbe principale */}
            <Path d={path} stroke={chartColor} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />

            {/* Points et labels sur la courbe */}
            {linePoints.map((point, i) => (
              <G key={`line-point-${i}`}>
                {/* Point sur la courbe */}
                <Circle cx={point.x} cy={point.y} r={selectedIndex === i ? '7' : '4'} fill="white" stroke={chartColor} strokeWidth={selectedIndex === i ? '3' : '2'} />

                {/* Tooltip au-dessus du point sélectionné */}
                {selectedIndex === i && (
                  <G>
                    {(() => {
                      const tooltipWidth = 72;
                      const tooltipHeight = 26;
                      let tooltipX = point.x - tooltipWidth / 2;
                      let tooltipY = point.y - 36;

                      // Ajuster la position si le tooltip dépasse
                      if (tooltipX < PADDING_LEFT) tooltipX = PADDING_LEFT + 5;
                      if (tooltipX + tooltipWidth > CHART_WIDTH - PADDING_RIGHT) {
                        tooltipX = CHART_WIDTH - PADDING_RIGHT - tooltipWidth - 5;
                      }
                      if (tooltipY < PADDING_TOP) tooltipY = point.y + 15;

                      return (
                        <>
                          {/* Rectangle du tooltip */}
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
                          {/* Texte du tooltip */}
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

                {/* Label du mois en bas */}
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

        {/* ==================== BAR CHART ==================== */}
        <View style={{ width: CONTAINER_WIDTH }}>
          <Svg width={CHART_WIDTH} height={CHART_HEIGHT} onPress={(e) => handleTouch(e.nativeEvent.locationX, 'bar')}>
            {/* Grille horizontale */}
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

            {/* Barres */}
            {bars.map((bar, i) => (
              <G key={`bar-${i}`}>
                {/* Rectangle de la barre */}
                <Rect x={bar.x} y={bar.y} width={bar.width} height={bar.height} fill={chartColor} opacity={selectedIndex === i ? 1 : 0.85} rx={3} />

                {/* Valeur au-dessus de la barre sélectionnée */}
                {selectedIndex === i && (
                  <SvgText x={bar.x + bar.width / 2} y={bar.y - 8} fontSize="11" fontWeight="700" fill={chartColor} textAnchor="middle">
                    {formatCurrency(bar.value).replace(/\s/g, '')}
                  </SvgText>
                )}

                {/* Label du mois en bas */}
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
