import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { initApi, setOnUnauthorized } from '@/services/api';
import { SocketProvider } from '@/context/SocketContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function RootLayoutNav() {
  const router = useRouter();
  const { hydrate } = useAuthStore();

  initApi();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    setOnUnauthorized(() => {
      router.replace('/(auth)/login');
    });
  }, [router]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <SocketProvider>
            <Stack screenOptions={{ headerShown: false }} />
          </SocketProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  return <RootLayoutNav />;
}
