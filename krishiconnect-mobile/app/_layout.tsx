import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { initApi, setOnUnauthorized } from '@/services/api';

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
    <QueryClientProvider client={queryClient}>
      <Stack screenOptions={{ headerShown: false }} />
    </QueryClientProvider>
  );
}

export default function RootLayout() {
  return <RootLayoutNav />;
}
