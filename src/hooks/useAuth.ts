import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Platform } from 'react-native';

interface User {
  id: string;
  email?: string;
  fullName?: string;
}

/**
 * Hook pour gérer l'authentification Apple avec Supabase
 *
 * @returns {object} - Fonctions et état d'authentification
 * - user: Utilisateur connecté ou null
 * - loading: État de chargement
 * - signInWithApple: Fonction pour se connecter avec Apple
 * - signOut: Fonction pour se déconnecter
 */
export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vérifier si l'utilisateur est déjà connecté au montage
  useEffect(() => {
    checkUser();

    // Écouter les changements d'état d'authentification
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);

      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          fullName: session.user.user_metadata?.full_name,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  /**
   * Vérifier si un utilisateur est déjà connecté
   */
  const checkUser = async () => {
    try {
      setLoading(true);
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email,
          fullName: session.user.user_metadata?.full_name,
        });
      }
    } catch (err) {
      console.error('Error checking user:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Se connecter avec Apple Sign In
   */
  const signInWithApple = async () => {
    try {
      setLoading(true);
      setError(null);

      // Vérifier si Apple Sign In est disponible (iOS 13+)
      if (Platform.OS !== 'ios') {
        throw new Error('Apple Sign In is only available on iOS');
      }

      const isAvailable = await AppleAuthentication.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Apple Sign In is not available on this device');
      }

      // Demander les credentials Apple
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [AppleAuthentication.AppleAuthenticationScope.FULL_NAME, AppleAuthentication.AppleAuthenticationScope.EMAIL],
      });

      console.log('Apple credential received:', credential);

      // Vérifier que nous avons un identityToken
      if (!credential.identityToken) {
        throw new Error('No identity token received from Apple');
      }

      // Se connecter à Supabase avec le token Apple
      const { data, error: signInError } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      if (signInError) {
        throw signInError;
      }

      console.log('Successfully signed in with Apple:', data);

      // Mettre à jour le profil utilisateur si c'est la première connexion
      if (data.user && credential.fullName) {
        const fullName = `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim();

        if (fullName) {
          const { error: updateError } = await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: fullName,
            email: credential.email || data.user.email,
            updated_at: new Date().toISOString(),
          });

          if (updateError) {
            console.error('Error updating profile:', updateError);
          }
        }
      }

      return data;
    } catch (err: any) {
      console.error('Error signing in with Apple:', err);

      // Gérer l'annulation par l'utilisateur
      if (err.code === 'ERR_CANCELED') {
        setError('Sign in cancelled');
      } else {
        setError(err.message || 'Failed to sign in with Apple');
      }

      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Se déconnecter
   */
  const signOut = async () => {
    try {
      setLoading(true);
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        throw signOutError;
      }

      setUser(null);
    } catch (err) {
      console.error('Error signing out:', err);
      setError(err instanceof Error ? err.message : 'Failed to sign out');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * 🚨 DEV ONLY - Simuler une authentification sans Apple
   */
  const signInDev = async () => {
    if (!__DEV__) {
      throw new Error('signInDev is only available in development mode');
    }

    try {
      setLoading(true);
      // Créer un utilisateur fictif pour le dev
      setUser({
        id: 'dev-user-123',
        email: 'dev@luma.app',
        fullName: 'Dev User',
      });
      console.log('✅ Signed in as dev user');
    } catch (err) {
      console.error('Error in dev sign in:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    signInWithApple,
    signOut,
    signInDev: __DEV__ ? signInDev : undefined,
    isAuthenticated: !!user,
  };
};
