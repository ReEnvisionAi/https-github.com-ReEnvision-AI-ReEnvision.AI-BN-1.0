import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useState } from 'react';
import { Desktop } from './src/components/Desktop/Desktop';
import { AuthPage } from './src/components/Auth/AuthPage';
import { useAuthStore } from './src/store/useAuthStore';
import supabase from './src/services/supabaseService';

export default function App() {
  const { user, setUser, loading, setLoading } = useAuthStore();
  const [configError, setConfigError] = useState(false);

  useEffect(() => {
    // Check if Supabase is properly configured
    console.log('Checking variables...');
    if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
      setConfigError(true);
      setLoading(false);
      return;
    }

    console.log('Checking active sessions...');
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Session results:', session);
      global.user_id = session?.user ? session.user.id : null;
      setUser(
        session?.user
          ? {
              id: session.user.id,
              email: session.user.email ?? '',
            }
          : null,
      );
      setLoading(false);
    });

    // Listen for changes on auth state (sign in, sign out, etc.)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state change:', _event, session);
      global.user_id = session?.user ? session.user.id : null;
      setUser(
        session?.user
          ? {
              id: session.user.id,
              email: session.user.email ?? '',
            }
          : null,
      );
    });

    return () => subscription.unsubscribe();
  }, [setUser, setLoading]);

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="light" />
        {user ? <Desktop /> : <AuthPage />}
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}