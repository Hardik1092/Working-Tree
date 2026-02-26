import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { loginSchema, type LoginInput } from '@krishiconnect/shared';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { password: '', phoneNumber: '', email: '' },
  });

  const onSubmit = async (data: LoginInput) => {
    setError(null);
    setLoading(true);
    try {
      const payload = {
        password: data.password,
        phoneNumber: data.phoneNumber?.trim() || undefined,
        email: data.email?.trim() || undefined,
      };
      const res = await authService.login(payload);
      const loginData = res.data;
      if (!loginData) {
        setError(res.message ?? 'Login failed');
        return;
      }
      if ('requires2FA' in loginData && loginData.requires2FA) {
        setError('2FA not yet supported in app. Use web to complete login.');
        return;
      }
      if ('user' in loginData && 'tokens' in loginData) {
        await setAuth(loginData.user, loginData.tokens.accessToken, loginData.tokens.refreshToken);
        router.replace('/(tabs)/home');
      } else {
        setError(res.message ?? 'Login failed');
      }
    } catch (e: unknown) {
      const isNetworkError =
        e && typeof e === 'object' && 'message' in e && (e as { message?: string }).message === 'Network Error';
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      if (isNetworkError) {
        setError(
          'Cannot reach server. Ensure the backend is running at ' +
            (typeof window !== 'undefined' ? window.location.hostname : 'localhost') +
            ':5005. On a physical device, set EXPO_PUBLIC_API_URL in .env to http://YOUR_IP:5005/api/v1'
        );
      } else {
        setError(msg ?? (e instanceof Error ? e.message : 'Login failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const theme = colors.light;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.foreground }]}>Log in</Text>
      {error ? <Text style={[styles.error, { color: theme.destructive }]}>{error}</Text> : null}
      <Controller
        control={control}
        name="phoneNumber"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Phone (10 digits)"
            placeholder="9876543210"
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="phone-pad"
            error={errors.phoneNumber?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Or email"
            placeholder="you@example.com"
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Password"
            placeholder="••••••••"
            value={value ?? ''}
            onChangeText={onChange}
            onBlur={onBlur}
            secureTextEntry
            error={errors.password?.message}
          />
        )}
      />
      <Button title="Log in" onPress={handleSubmit(onSubmit)} loading={loading} style={styles.btn} />
      <Button
        title="Create account"
        variant="outline"
        onPress={() => router.push('/(auth)/register')}
        style={styles.btn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, justifyContent: 'center' },
  title: { fontSize: 24, fontWeight: '700', marginBottom: spacing.lg },
  error: { marginBottom: spacing.md },
  btn: { marginTop: spacing.sm },
});
