import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useState } from 'react';
import { Card } from '../components/Card';
import { colors, spacing, borderRadius, fontSize } from '../theme/colors';
import { useTranslation } from '../hooks/useTranslation';
import { Globe, Download, Info, Check } from 'lucide-react-native';

const LANGUAGES = [
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

export const SettingsScreen = () => {
  const { t, locale, changeLanguage } = useTranslation();
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

  const handleExportData = () => {
    // Sera implémenté dans la prochaine étape
    Alert.alert(t('settings.export'), t('exportComingSoon'));
  };

  const handleAbout = () => {
    Alert.alert('Luma', t('aboutText'), [{ text: 'OK' }]);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {/* Language Section */}
        <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
        <Card>
          {LANGUAGES.map((lang) => {
            const isSelected = selectedLanguage === lang.code;

            return (
              <TouchableOpacity key={lang.code} onPress={() => handleLanguageChange(lang.code)} style={[styles.settingRow, isSelected && styles.settingRowSelected]}>
                <View style={styles.settingLeft}>
                  <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
                    <Globe size={20} color={isSelected ? colors.sage : colors.warmGray} strokeWidth={2} />
                  </View>
                  <View>
                    <Text style={[styles.settingLabel, isSelected && styles.settingLabelSelected]}>
                      {lang.flag} {lang.label}
                    </Text>
                  </View>
                </View>
                {isSelected && <Check size={20} color={colors.sage} strokeWidth={2.5} />}
              </TouchableOpacity>
            );
          })}
        </Card>

        {/* Data Section */}
        <Text style={styles.sectionTitle}>{t('data')}</Text>
        <Card>
          <TouchableOpacity onPress={handleExportData} style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Download size={20} color={colors.warmGray} strokeWidth={2} />
              </View>
              <Text style={styles.settingLabel}>{t('settings.export')}</Text>
            </View>
          </TouchableOpacity>
        </Card>

        {/* About Section */}
        <Text style={styles.sectionTitle}>{t('settings.about')}</Text>
        <Card>
          <TouchableOpacity onPress={handleAbout} style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={styles.iconContainer}>
                <Info size={20} color={colors.warmGray} strokeWidth={2} />
              </View>
              <Text style={styles.settingLabel}>{t('settings.about')}</Text>
            </View>
          </TouchableOpacity>
        </Card>

        <Text style={styles.versionText}>Luma v1.0.0</Text>
        <Text style={styles.taglineText}>{t('tagline')}</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.black,
    marginTop: spacing.md,
    marginBottom: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.cream,
  },
  settingRowSelected: {
    backgroundColor: colors.sage + '08',
    marginHorizontal: -spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.warmGray + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainerSelected: {
    backgroundColor: colors.sage + '15',
  },
  settingLabel: {
    fontSize: fontSize.md,
    color: colors.gray,
    fontWeight: '500',
  },
  settingLabelSelected: {
    color: colors.sage,
    fontWeight: '600',
  },
  versionText: {
    fontSize: fontSize.sm,
    color: colors.warmGray,
    textAlign: 'center',
    marginTop: spacing.xxl,
  },
  taglineText: {
    fontSize: fontSize.sm,
    color: colors.warmGray,
    textAlign: 'center',
    marginTop: spacing.xs,
    fontStyle: 'italic',
  },
});
