import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import tw from '../lib/tailwind';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { Globe, Download, Info, Check, Moon, Sun, Monitor, Snowflake, Sparkles } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

const THEMES = [
  { mode: 'light' as const, label: 'Clair', icon: Sun },
  { mode: 'dark' as const, label: 'Sombre', icon: Moon },
  { mode: 'system' as const, label: 'Système', icon: Monitor },
];

const PALETTES = [
  {
    id: 'nordic' as const,
    label: 'Nordic',
    icon: Snowflake,
    colors: ['#2B3A42', '#5C7A89', '#A8B5BF'],
    description: 'Corporate theme',
  },
  {
    id: 'mauve' as const,
    label: 'Dusty Mauve',
    icon: Sparkles,
    colors: ['#6B5B73', '#9B8AA0', '#C4B5C9'],
    description: 'Cozy theme',
  },
];
export const SettingsScreen = () => {
  const { t, locale, changeLanguage } = useTranslation();
  const { themeMode, setThemeMode, isDark, palette, setPalette, colors } = useTheme();
  const [selectedLanguage, setSelectedLanguage] = useState(locale);

  const handleLanguageChange = async (langCode: string) => {
    try {
      await changeLanguage(langCode);
      setSelectedLanguage(langCode);
      Alert.alert(t('success'), t('languageChanged'));
    } catch (error) {
      Alert.alert(t('error'), t('cannotChangeLanguage'));
    }
  };

  const handlePaletteChange = async (paletteId: 'nordic' | 'mauve') => {
    setPalette(paletteId);
  };

  const handleExportData = () => {
    Alert.alert(t('settings.export'), t('exportComingSoon'));
  };

  const handleAbout = () => {
    Alert.alert('Luma', t('aboutText'), [{ text: 'OK' }]);
  };

  return (
    <View style={tw.style('flex-1', `bg-[${isDark ? colors.dark.bg : colors.light.bg}]`)}>
      <SafeAreaView edges={['top']} style={tw`flex-1`}>
        <ScrollView style={tw`flex-1`} contentContainerStyle={tw`pb-6`}>
          {/* Header */}
          <View style={tw`px-6 pt-4 pb-6`}>
            <Text style={tw.style('text-3xl font-bold', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{t('settings.title')}</Text>
          </View>

          {/* Theme Palette Section */}
          <View style={tw`px-6 mb-8`}>
            <Text style={tw.style('text-sm font-semibold uppercase tracking-wider mb-4', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>Palette de couleurs</Text>

            {/* Palette Tabs */}
            <View style={tw`flex-row gap-3`}>
              {PALETTES.map((pal) => {
                const isSelected = palette === pal.id;
                const IconComponent = pal.icon;

                return (
                  <TouchableOpacity
                    key={pal.id}
                    onPress={() => handlePaletteChange(pal.id)}
                    style={tw.style(
                      'flex-1 rounded-2xl p-4 border-2',
                      isSelected
                        ? `border-[${colors.primary}] bg-[${colors.primary}]/10`
                        : isDark
                        ? `border-[${colors.dark.border}] bg-[${colors.dark.card}]`
                        : `border-[${colors.light.border}] bg-white`
                    )}
                  >
                    {/* Icon et Check */}
                    <View style={tw`flex-row items-center justify-between mb-3`}>
                      <View
                        style={tw.style(
                          'w-10 h-10 rounded-xl items-center justify-center',
                          isSelected ? `bg-[${colors.primary}]/20` : isDark ? `bg-[${colors.dark.surface}]` : `bg-[${colors.light.bg}]`
                        )}
                      >
                        <IconComponent size={22} color={isSelected ? colors.primary : isDark ? colors.dark.textSecondary : colors.light.textSecondary} strokeWidth={2} />
                      </View>
                      {isSelected && (
                        <View style={tw.style('w-6 h-6 rounded-full items-center justify-center', `bg-[${colors.primary}]`)}>
                          <Check size={14} color="white" strokeWidth={3} />
                        </View>
                      )}
                    </View>

                    {/* Color dots */}
                    <View style={tw`flex-row gap-1.5 mb-3`}>
                      {pal.colors.map((color, idx) => (
                        <View key={idx} style={tw.style('w-6 h-6 rounded-full', `bg-[${color}]`)} />
                      ))}
                    </View>

                    {/* Label */}
                    <Text style={tw.style('text-base font-semibold mb-1', isSelected ? `text-[${colors.primary}]` : `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>
                      {pal.label}
                    </Text>

                    {/* Description */}
                    <Text style={tw.style('text-xs', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>{pal.description}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Appearance Section */}
          <View style={tw`px-6 mb-8`}>
            <Text style={tw.style('text-sm font-semibold uppercase tracking-wider mb-4', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>Apparence</Text>

            <View style={tw.style('rounded-2xl overflow-hidden', isDark ? `bg-[${colors.dark.card}] border border-[${colors.dark.border}]` : 'bg-white shadow-sm')}>
              {THEMES.map((themeOption, index) => {
                const IconComponent = themeOption.icon;
                const isSelected = themeMode === themeOption.mode;
                const isLast = index === THEMES.length - 1;

                return (
                  <TouchableOpacity
                    key={themeOption.mode}
                    onPress={() => setThemeMode(themeOption.mode)}
                    style={tw.style('flex-row items-center px-4 py-4', !isLast && `border-b border-[${isDark ? colors.dark.border : colors.light.border}]`)}
                  >
                    <View
                      style={tw.style(
                        'w-11 h-11 rounded-xl items-center justify-center mr-4',
                        isSelected ? `bg-[${colors.primary}]/15` : isDark ? `bg-[${colors.dark.surface}]` : `bg-[${colors.light.bg}]`
                      )}
                    >
                      <IconComponent size={20} color={isSelected ? colors.primary : isDark ? colors.dark.textSecondary : colors.light.textSecondary} strokeWidth={2.5} />
                    </View>

                    <Text style={tw.style('flex-1 text-base font-medium', isSelected ? `text-[${colors.primary}]` : `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>
                      {themeOption.label}
                    </Text>

                    {isSelected && <Check size={20} color={colors.primary} strokeWidth={2.5} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Language Section */}
          <View style={tw`px-6 mb-8`}>
            <Text style={tw.style('text-sm font-semibold uppercase tracking-wider mb-4', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>{t('settings.language')}</Text>

            <View style={tw.style('rounded-2xl overflow-hidden', isDark ? `bg-[${colors.dark.card}] border border-[${colors.dark.border}]` : 'bg-white shadow-sm')}>
              {LANGUAGES.map((lang, index) => {
                const isSelected = selectedLanguage === lang.code;
                const isLast = index === LANGUAGES.length - 1;

                return (
                  <TouchableOpacity
                    key={lang.code}
                    onPress={() => handleLanguageChange(lang.code)}
                    style={tw.style('flex-row items-center px-4 py-4', !isLast && `border-b border-[${isDark ? colors.dark.border : colors.light.border}]`)}
                  >
                    <View
                      style={tw.style(
                        'w-11 h-11 rounded-xl items-center justify-center mr-4',
                        isSelected ? `bg-[${colors.primary}]/15` : isDark ? `bg-[${colors.dark.surface}]` : `bg-[${colors.light.bg}]`
                      )}
                    >
                      <Globe size={20} color={isSelected ? colors.primary : isDark ? colors.dark.textSecondary : colors.light.textSecondary} strokeWidth={2.5} />
                    </View>

                    <Text style={tw.style('flex-1 text-base font-medium', isSelected ? `text-[${colors.primary}]` : `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>
                      {lang.flag} {lang.label}
                    </Text>

                    {isSelected && <Check size={20} color={colors.primary} strokeWidth={2.5} />}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Data Section */}
          <View style={tw`px-6 mb-8`}>
            <Text style={tw.style('text-sm font-semibold uppercase tracking-wider mb-4', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>{t('data')}</Text>

            <View style={tw.style('rounded-2xl overflow-hidden', isDark ? `bg-[${colors.dark.card}] border border-[${colors.dark.border}]` : 'bg-white shadow-sm')}>
              <TouchableOpacity onPress={handleExportData} style={tw`flex-row items-center px-4 py-4`}>
                <View style={tw.style('w-11 h-11 rounded-xl items-center justify-center mr-4', isDark ? `bg-[${colors.dark.surface}]` : `bg-[${colors.light.bg}]`)}>
                  <Download size={20} color={isDark ? colors.dark.textSecondary : colors.light.textSecondary} strokeWidth={2.5} />
                </View>

                <Text style={tw.style('flex-1 text-base font-medium', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{t('settings.export')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* About Section */}
          <View style={tw`px-6 mb-8`}>
            <Text style={tw.style('text-sm font-semibold uppercase tracking-wider mb-4', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>À propos</Text>

            <View style={tw.style('rounded-2xl overflow-hidden', isDark ? `bg-[${colors.dark.card}] border border-[${colors.dark.border}]` : 'bg-white shadow-sm')}>
              <TouchableOpacity onPress={handleAbout} style={tw`flex-row items-center px-4 py-4`}>
                <View style={tw.style('w-11 h-11 rounded-xl items-center justify-center mr-4', isDark ? `bg-[${colors.dark.surface}]` : `bg-[${colors.light.bg}]`)}>
                  <Info size={20} color={isDark ? colors.dark.textSecondary : colors.light.textSecondary} strokeWidth={2.5} />
                </View>

                <Text style={tw.style('flex-1 text-base font-medium', `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}>{t('settings.about')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Footer */}
          <View style={tw`px-6 items-center mt-4`}>
            <Text style={tw.style('text-sm', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>Luma v1.0.0</Text>
            <Text style={tw.style('text-sm italic mt-1', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>{t('tagline')}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};
