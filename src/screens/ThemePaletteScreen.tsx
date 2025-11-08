// src/screens/ThemePaletteScreen.tsx

import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import tw from '../lib/tailwind';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Check, X, Snowflake, Sparkles, Sprout, Gem, Waves } from 'lucide-react-native';
import { PaletteType } from '../lib/palettes';

interface ThemePaletteScreenProps {
  navigation: any;
}

const PALETTES = [
  ,
  {
    id: 'aurora' as const,
    icon: Waves,
    colors: ['#9B91E8', '#7B6FD9', '#5B8FE8'],
  },
  {
    id: 'nordic' as const,
    icon: Snowflake,
    colors: ['#2B3A42', '#5C7A89', '#A8B5BF'],
  },
  {
    id: 'mauve' as const,
    icon: Sparkles,
    colors: ['#6B5B73', '#9B8AA0', '#C4B5C9'],
  },
  {
    id: 'sage' as const,
    icon: Sprout,
    colors: ['#3A4238', '#6B7A68', '#A5B3A2'],
  },
  {
    id: 'amber' as const,
    icon: Gem,
    colors: ['#6B6661', '#B8936A', '#D4C5B0'],
  },
];

export const ThemePaletteScreen = ({ navigation }: ThemePaletteScreenProps) => {
  const { t } = useTranslation();
  const { isDark, colors, palette, setPalette } = useTheme();

  const handlePaletteChange = async (paletteId: PaletteType) => {
    await setPalette(paletteId);
  };

  return (
    <View style={tw.style('flex-1', `bg-[${isDark ? colors.dark.bg : colors.light.bg}]`)}>
      <SafeAreaView edges={['top']} style={tw`flex-1`}>
        <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-6`}>
          {/* Header */}
          <View style={tw`px-6 pt-4 pb-2 flex-row items-center justify-between`}>
            <View style={tw`flex-1`}>
              <Text style={tw.style('text-3xl font-bold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{t('settings.colorPalette')}</Text>
              <Text style={tw.style('text-sm mt-2', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('settings.choosePalette')}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.goBack()} style={tw.style('w-10 h-10 rounded-full items-center justify-center', `bg-[${isDark ? colors.dark.surface : colors.light.border}]`)}>
              <X size={20} color={isDark ? colors.dark.textSecondary : colors.light.textSecondary} strokeWidth={2.5} />
            </TouchableOpacity>
          </View>

          {/* Palettes */}
          <View style={tw`px-6 mt-6 gap-4`}>
            {PALETTES.map((pal) => {
              const isSelected = palette === pal.id;
              const IconComponent = pal.icon;

              return (
                <TouchableOpacity
                  key={pal.id}
                  onPress={() => handlePaletteChange(pal.id)}
                  style={tw.style(
                    'rounded-2xl p-5 border-2 flex-row items-center',
                    isSelected
                      ? `border-[${colors.primary}] bg-[${colors.primary}]/10`
                      : isDark
                      ? `border-[${colors.dark.border}] bg-[${colors.dark.card}]`
                      : `border-[${colors.light.border}] bg-white`
                  )}
                >
                  {/* Icon */}
                  <View
                    style={tw.style(
                      'w-14 h-14 rounded-xl items-center justify-center mr-4',
                      isSelected ? `bg-[${colors.primary}]/20` : isDark ? `bg-[${colors.dark.surface}]` : `bg-[${colors.light.bg}]`
                    )}
                  >
                    <IconComponent size={26} color={isSelected ? colors.primary : isDark ? colors.dark.textSecondary : colors.light.textSecondary} strokeWidth={2} />
                  </View>

                  {/* Info */}
                  <View style={tw`flex-1`}>
                    <View style={tw`flex-row items-center justify-between mb-3`}>
                      <Text style={tw.style('text-lg font-semibold', isSelected ? `text-[${colors.primary}]` : `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>
                        {t(`settings.palettes.${pal.id}.name`)}
                      </Text>
                      {isSelected && (
                        <View style={tw.style('w-7 h-7 rounded-full items-center justify-center', `bg-[${colors.primary}]`)}>
                          <Check size={16} color="white" strokeWidth={3} />
                        </View>
                      )}
                    </View>

                    {/* Color Preview */}
                    <View style={tw`flex-row gap-2 mb-3`}>
                      {pal.colors.map((color, idx) => (
                        <View key={idx} style={tw.style('w-8 h-8 rounded-lg', `bg-[${color}]`)} />
                      ))}
                    </View>

                    <Text style={tw.style('text-sm', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t(`settings.palettes.${pal.id}.description`)}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Info Section */}
          <View style={tw.style('mx-6 mt-8 p-4 rounded-xl', isDark ? `bg-[${colors.dark.card}]` : `bg-[${colors.light.bg}]`)}>
            <Text style={tw.style('text-sm leading-5', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('settings.paletteInfo')}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
