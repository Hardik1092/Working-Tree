import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { loginSchema, type LoginInput } from '@krishiconnect/shared';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { typography } from '@/theme/typography';

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
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { color: theme.foreground }]}>Log in</Text>
          {error ? (
            <View style={[styles.errorBox, { backgroundColor: `${theme.destructive}14`, borderColor: `${theme.destructive}40` }]}>
              <Text style={[styles.errorText, { color: theme.destructive }]}>{error}</Text>
            </View>
          ) : null}
          <View style={styles.form}>
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
          </View>
          <View style={styles.actions}>
            <Button title="Log in" onPress={handleSubmit(onSubmit)} loading={loading} style={styles.primaryBtn} />
            <Button
              title="Create account"
              variant="outline"
              onPress={() => router.push('/(auth)/register')}
              style={styles.secondaryBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  keyboard: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xl,
    justifyContent: 'center',
    minHeight: '100%',
  },
  title: {
    ...typography.title,
    marginBottom: spacing.lg,
  },
  errorBox: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  errorText: {
    fontSize: 14,
  },
  form: { marginBottom: spacing.lg },
  actions: {},
  primaryBtn: { marginBottom: spacing.sm },
  secondaryBtn: {},
});
