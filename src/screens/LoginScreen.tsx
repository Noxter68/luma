import { View, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import { useState } from 'react';
import tw from '../lib/tailwind';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from '../contexts/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { getPaletteGradient } from '../lib/palettes';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as AppleAuthentication from 'expo-apple-authentication';
import { useAuth } from '../hooks/useAuth';

interface LoginScreenProps {
  navigation: any;
}

export const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const { t, locale } = useTranslation();
  const { isDark, colors, palette } = useTheme();
  const { signInWithApple, signInDev, loading } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const headerGradient = getPaletteGradient(palette, isDark, 'header');

  const handleAppleSignIn = async () => {
    try {
      setIsSigningIn(true);
      await signInWithApple();
    } catch (error: any) {
      if (error.code !== 'ERR_CANCELED') {
        Alert.alert(locale === 'fr' ? 'Erreur' : 'Error', locale === 'fr' ? 'Impossible de se connecter avec Apple. Veuillez réessayer.' : 'Failed to sign in with Apple. Please try again.');
      }
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSkip = async () => {
    if (!signInDev) return;

    try {
      console.log('🔄 Attempting dev sign in...');
      await signInDev();
      console.log('✅ Dev sign in completed');
    } catch (error) {
      console.error('❌ Error in dev sign in:', error);
      Alert.alert('Dev Error', 'Failed to skip authentication. Check console for details.');
    }
  };

  return (
    <View style={tw`flex-1`}>
      <LinearGradient colors={headerGradient} style={tw`flex-1`}>
        <SafeAreaView edges={['top', 'bottom']} style={tw`flex-1 px-6`}>
          {/* Logo et Titre */}
          <View style={tw`flex-1 justify-center items-center`}>
            <Text style={tw`text-6xl font-bold text-white mb-4`}>Luma</Text>
            <Text style={tw`text-white/80 text-lg text-center mb-2`}>{locale === 'fr' ? 'Gérez vos finances avec clarté' : 'Manage your finances with clarity'}</Text>
            <Text style={tw`text-white/60 text-sm italic`}>{t('tagline')}</Text>
          </View>

          {/* Bouton Apple Sign In */}
          <View style={tw`pb-8`}>
            {Platform.OS === 'ios' ? (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={isDark ? AppleAuthentication.AppleAuthenticationButtonStyle.WHITE : AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
                cornerRadius={12}
                style={tw`w-full h-14 mb-4`}
                onPress={handleAppleSignIn}
              />
            ) : (
              <TouchableOpacity
                onPress={handleAppleSignIn}
                disabled={loading || isSigningIn}
                style={tw.style('w-full py-4 rounded-xl items-center justify-center mb-4', loading || isSigningIn ? 'opacity-50' : '', 'bg-white')}
              >
                <Text style={tw`text-black text-base font-semibold`}>{loading || isSigningIn ? '...' : locale === 'fr' ? 'Se connecter avec Apple' : 'Sign in with Apple'}</Text>
              </TouchableOpacity>
            )}

            {/* Bouton Skip (seulement en dev) */}
            {__DEV__ && signInDev && (
              <TouchableOpacity onPress={handleSkip} disabled={loading} style={tw.style('w-full py-3 rounded-xl items-center', loading && 'opacity-50')}>
                <Text style={tw`text-white/60 text-sm`}>{loading ? '...' : locale === 'fr' ? 'Passer (dev)' : 'Skip (dev)'}</Text>
              </TouchableOpacity>
            )}

            {/* Informations */}
            <Text style={tw`text-white/60 text-xs text-center mt-6 leading-relaxed`}>
              {locale === 'fr'
                ? "En continuant, vous acceptez nos conditions d'utilisation et notre politique de confidentialité."
                : 'By continuing, you agree to our Terms of Service and Privacy Policy.'}
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    </View>
  );
};
