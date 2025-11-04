import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { getPaletteGradient } from '../lib/palettes';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CATEGORIES, getAllGroups, getCategoriesByGroup, CATEGORY_GROUPS } from '../utils/categories';
import { Check, X, Search } from 'lucide-react-native';
import tw from '../lib/tailwind';
import { Card } from '../components/Card';

interface CategorySelectorScreenProps {
  navigation: any;
  route: {
    params: {
      selectedCategory?: string;
      onSelect: (categoryId: string) => void;
    };
  };
}

export const CategorySelectorScreen = ({ navigation, route }: CategorySelectorScreenProps) => {
  const { selectedCategory, onSelect } = route.params;
  const { t } = useTranslation();
  const { isDark, colors, palette } = useTheme();
  const headerGradient = getPaletteGradient(palette, isDark, 'header');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectCategory = (categoryId: string) => {
    onSelect(categoryId);
    navigation.goBack();
  };

  // Filter categories based on search
  const filteredCategories = CATEGORIES.filter((cat) => {
    if (!searchQuery) return true;
    const label = t(cat.translationKey).toLowerCase();
    return label.includes(searchQuery.toLowerCase());
  });

  // Group filtered categories
  const getFilteredCategoriesByGroup = (group: string) => {
    return filteredCategories.filter((cat) => cat.group === group);
  };

  return (
    <View style={tw`flex-1`}>
      <LinearGradient colors={headerGradient} style={tw`flex-1`}>
        <SafeAreaView edges={['top']} style={tw`flex-1`}>
          {/* Header */}
          <View style={tw`px-6 pt-2 pb-4`}>
            <View style={tw`flex-row items-center justify-between mb-4`}>
              <Text style={tw`text-white text-xl font-bold`}>{t('selectCategory')}</Text>
              <TouchableOpacity onPress={() => navigation.goBack()} style={tw`w-9 h-9 rounded-full bg-white/20 items-center justify-center`}>
                <X size={20} color="white" strokeWidth={2.5} />
              </TouchableOpacity>
            </View>

            {/* Search Input */}
            <View style={tw`flex-row items-center bg-white/20 rounded-xl px-4 py-3`}>
              <Search size={18} color="white" strokeWidth={2.5} opacity={0.7} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder={t('searchCategory')}
                placeholderTextColor="rgba(255,255,255,0.5)"
                style={tw`flex-1 ml-3 text-white text-base`}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={18} color="white" strokeWidth={2.5} opacity={0.7} />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Content */}
          <View style={tw`flex-1 px-6`}>
            <LinearGradient colors={isDark ? [colors.dark.bg, colors.dark.surface, colors.dark.bg] : [colors.light.bg, colors.light.surface, colors.light.bg]} style={tw`flex-1 rounded-3xl`}>
              <ScrollView style={tw`flex-1`} contentContainerStyle={tw`p-5 pb-8`} showsVerticalScrollIndicator={false}>
                {getAllGroups().map((group, groupIndex) => {
                  const categoriesInGroup = getFilteredCategoriesByGroup(group);

                  if (categoriesInGroup.length === 0) return null;

                  const isLastGroup = groupIndex === getAllGroups().length - 1;

                  return (
                    <View key={group} style={tw`${!isLastGroup && 'mb-5'}`}>
                      {/* Group Header */}
                      <Text style={tw.style('text-xs font-semibold uppercase tracking-wider mb-3 px-1', `text-[${isDark ? colors.dark.textTertiary : colors.light.textTertiary}]`)}>
                        {t(CATEGORY_GROUPS[group])}
                      </Text>

                      {/* Categories in Group */}
                      <Card style={tw`p-0 overflow-hidden`}>
                        {categoriesInGroup.map((category, index) => {
                          const IconComponent = category.icon;
                          const isSelected = selectedCategory === category.id;
                          const isLast = index === categoriesInGroup.length - 1;

                          return (
                            <View key={category.id}>
                              <TouchableOpacity onPress={() => handleSelectCategory(category.id)} style={tw`px-4 py-3 flex-row items-center`}>
                                {/* Icon with Gradient */}
                                <View style={tw`w-9 h-9 rounded-lg mr-3 overflow-hidden`}>
                                  <LinearGradient
                                    colors={
                                      isSelected
                                        ? isDark
                                          ? [colors.primary, colors.primaryDark]
                                          : [colors.primaryLight, colors.primary]
                                        : isDark
                                        ? [colors.dark.surface, colors.dark.surface]
                                        : [colors.light.border, colors.light.border]
                                    }
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={tw`w-full h-full items-center justify-center`}
                                  >
                                    {isSelected && (
                                      <View style={tw`absolute top-0 left-0 w-full h-1/2 opacity-30`}>
                                        <LinearGradient colors={['rgba(255,255,255,0.4)', 'transparent']} style={tw`w-full h-full`} />
                                      </View>
                                    )}
                                    <IconComponent size={18} color={isSelected ? 'white' : isDark ? colors.dark.textTertiary : colors.light.textTertiary} strokeWidth={2.5} />
                                  </LinearGradient>
                                </View>

                                {/* Label */}
                                <Text
                                  style={tw.style('flex-1 text-base font-medium', isSelected ? `text-[${colors.primary}]` : `text-[${isDark ? colors.dark.textPrimary : colors.light.textPrimary}]`)}
                                >
                                  {t(category.translationKey)}
                                </Text>

                                {/* Check Icon */}
                                {isSelected && (
                                  <View style={tw.style('w-6 h-6 rounded-full items-center justify-center', `bg-[${colors.primary}]`)}>
                                    <Check size={14} color="white" strokeWidth={3} />
                                  </View>
                                )}
                              </TouchableOpacity>

                              {/* Divider */}
                              {!isLast && <View style={tw.style('h-px ml-16 mr-4', `bg-[${isDark ? colors.dark.border : colors.light.border}]`)} />}
                            </View>
                          );
                        })}
                      </Card>
                    </View>
                  );
                })}

                {filteredCategories.length === 0 && (
                  <View style={tw`py-20 items-center`}>
                    <Text style={tw.style('text-base text-center', `text-[${isDark ? colors.dark.textSecondary : colors.light.textSecondary}]`)}>{t('noCategoryFound')}</Text>
                  </View>
                )}
              </ScrollView>
            </LinearGradient>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};
