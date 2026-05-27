import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { colors } from '../src/theme/colors';
import ScreenWrapper from '../src/ui/ScreenWrapper';

if (Platform.OS !== 'web') {
  const SplashScreen = require('expo-splash-screen');
  SplashScreen.preventAutoHideAsync();
}

function RootLayoutNav() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (loading) return;

    if (Platform.OS !== 'web') {
      try { const SplashScreen = require('expo-splash-screen'); SplashScreen.hideAsync(); } catch {}
    }

    const inAdmin = segments[0] === '(admin)';
    const inTecnico = segments[0] === '(tecnico)';

    if (!user) {
      if (inAdmin || inTecnico) router.replace('/');
    } else if (profile) {
      if (profile.role === 'admin' && !inAdmin) router.replace('/(admin)');
      else if (profile.role === 'tecnico' && !inTecnico) router.replace('/(tecnico)');
    } else {
      if (inAdmin || inTecnico) router.replace('/');
    }
  }, [user, profile, loading]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <ScreenWrapper>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg }, animation: 'fade' }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(admin)" />
          <Stack.Screen name="(tecnico)" />
        </Stack>
      </ScreenWrapper>
    </>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.bg,
  },
});
