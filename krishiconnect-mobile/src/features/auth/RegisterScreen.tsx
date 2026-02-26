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
import { registerSchema, type RegisterInput } from '@krishiconnect/shared';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export function RegisterScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [step, setStep] = React.useState<'form' | 'otp'>('form');
  const [otpId, setOtpId] = React.useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = React.useState<string | null>(null);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      password: '',
      confirmPassword: '',
      phoneNumber: '',
      email: '',
    },
  });

  const onRegisterSubmit = async (data: RegisterInput) => {
    setError(null);
    setLoading(true);
    try {
      const res = await authService.register({
        name: data.name,
        password: data.password,
        phoneNumber: data.phoneNumber || undefined,
        email: data.email || undefined,
        location:
          data.state || data.district
            ? { state: data.state, district: data.district }
            : undefined,
      });
      const payload = res.data;
      if (payload?.otpId) {
        setOtpId(payload.otpId);
        setStep('otp');
      } else if (payload?.phoneNumber) {
        setPhoneNumber(payload.phoneNumber);
        setStep('otp');
      } else {
        setError(res.message ?? 'Registration failed');
      }
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(msg ?? (e instanceof Error ? e.message : 'Registration failed'));
    } finally {
      setLoading(false);
    }
  };

  const onOtpSubmit = async (otp: string) => {
    setError(null);
    setLoading(true);
    try {
      if (otpId) {
        const res = await authService.verifyRegistrationOTP({ otpId, otp });
        if (res.data && 'tokens' in res.data) {
          const d = res.data as { user: unknown; tokens: { accessToken: string; refreshToken: string } };
          await setAuth(d.user as Parameters<typeof setAuth>[0], d.tokens.accessToken, d.tokens.refreshToken);
          router.replace('/(tabs)/home');
        } else {
          setError(res.message ?? 'Verification failed');
        }
      } else if (phoneNumber) {
        const res = await authService.verifyOTP({ phoneNumber, otp });
        if (res.data && 'tokens' in res.data) {
          const d = res.data as { user: unknown; tokens: { accessToken: string; refreshToken: string } };
          await setAuth(d.user as Parameters<typeof setAuth>[0], d.tokens.accessToken, d.tokens.refreshToken);
          router.replace('/(tabs)/home');
        } else {
          setError(res.message ?? 'Verification failed');
        }
      }
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : null;
      setError(msg ?? (e instanceof Error ? e.message : 'Verification failed'));
    } finally {
      setLoading(false);
    }
  };

  const theme = colors.light;

  if (step === 'otp') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
        <KeyboardAvoidingView
          style={styles.keyboard}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
        >
          <View style={styles.otpContainer}>
            <Text style={[styles.title, { color: theme.foreground }]}>Enter OTP</Text>
            <Text style={[styles.subtitle, { color: theme.muted }]}>Enter the 6-digit code sent to you</Text>
            {error ? (
              <View style={[styles.errorBox, { backgroundColor: `${theme.destructive}14`, borderColor: `${theme.destructive}40` }]}>
                <Text style={[styles.errorText, { color: theme.destructive }]}>{error}</Text>
              </View>
            ) : null}
            <View style={styles.otpInputWrap}>
              <Input
                placeholder="6-digit code"
                keyboardType="number-pad"
                maxLength={6}
                onChangeText={(text) => text.length === 6 && onOtpSubmit(text)}
              />
            </View>
            <Button title="Back" variant="outline" onPress={() => setStep('form')} style={styles.backBtn} />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

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
          <Text style={[styles.title, { color: theme.foreground }]}>Create account</Text>
          {error ? (
            <View style={[styles.errorBox, { backgroundColor: `${theme.destructive}14`, borderColor: `${theme.destructive}40` }]}>
              <Text style={[styles.errorText, { color: theme.destructive }]}>{error}</Text>
            </View>
          ) : null}
          <View style={styles.form}>
            <Controller
              control={form.control}
              name="name"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Name" placeholder="Your name" value={value} onChangeText={onChange} onBlur={onBlur} error={form.formState.errors.name?.message} />
              )}
            />
            <Controller
              control={form.control}
              name="phoneNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Phone" placeholder="9876543210" value={value ?? ''} onChangeText={onChange} onBlur={onBlur} error={form.formState.errors.phoneNumber?.message} />
              )}
            />
            <Controller
              control={form.control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Email (optional)" placeholder="you@example.com" value={value ?? ''} onChangeText={onChange} onBlur={onBlur} error={form.formState.errors.email?.message} />
              )}
            />
            <Controller
              control={form.control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Password" placeholder="Min 6 characters" value={value} onChangeText={onChange} onBlur={onBlur} secureTextEntry error={form.formState.errors.password?.message} />
              )}
            />
            <Controller
              control={form.control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input label="Confirm password" placeholder="••••••••" value={value} onChangeText={onChange} onBlur={onBlur} secureTextEntry error={form.formState.errors.confirmPassword?.message} />
              )}
            />
          </View>
          <View style={styles.actions}>
            <Button title="Register" onPress={form.handleSubmit(onRegisterSubmit)} loading={loading} style={styles.primaryBtn} />
            <Button title="Already have an account? Log in" variant="ghost" onPress={() => router.replace('/(auth)/login')} style={styles.secondaryBtn} />
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
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  otpContainer: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxl,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: spacing.lg,
  },
  errorBox: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  errorText: { fontSize: 14 },
  form: { marginBottom: spacing.lg },
  otpInputWrap: { marginBottom: spacing.lg },
  backBtn: { marginTop: spacing.sm },
  actions: {},
  primaryBtn: { marginBottom: spacing.sm },
  secondaryBtn: {},
});
