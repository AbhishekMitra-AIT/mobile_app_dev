import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from './AuthContext';

function AuthGuard() {
  const { user, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === 'login';

    console.log('AuthGuard - User:', user, 'Segments:', segments, 'isLoading:', isLoading);

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      console.log('Redirecting to login');
      router.replace('/login');
    } else if (user && inAuthGroup) {
      // Redirect to home if authenticated and on login screen
      console.log('Redirecting to home');
      router.replace('/');
    }
  }, [user, segments, isLoading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="index" />
      <Stack.Screen name="settings" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGuard />
    </AuthProvider>
  );
}