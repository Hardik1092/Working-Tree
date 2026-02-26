import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { settingsService } from '@/services/settingsService';
import { notificationService } from '@/services/notificationService';
import type { NotificationSettings } from '@krishiconnect/shared';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export function SettingsScreen() {
  const router = useRouter();
  const { logout, refreshToken } = useAuthStore();
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [activityStatusEnabled, setActivityStatusEnabled] = useState(false);
  const [loadingPrivacy, setLoadingPrivacy] = useState(true);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [notifSettings, setNotifSettings] = useState<NotificationSettings | null>(null);
  const [loadingNotif, setLoadingNotif] = useState(true);
  const [savingNotif, setSavingNotif] = useState(false);

  useEffect(() => {
    settingsService
      .getPrivacy()
      .then((p) => {
        setTwoFactorEnabled(!!p.twoFactorEnabled);
        setActivityStatusEnabled(p.activityStatusEnabled !== false);
      })
      .catch(() => {})
      .finally(() => setLoadingPrivacy(false));
  }, []);

  useEffect(() => {
    notificationService
      .getSettings()
      .then(setNotifSettings)
      .catch(() => {})
      .finally(() => setLoadingNotif(false));
  }, []);

  const handlePrivacyToggle = async (value: boolean) => {
    setTwoFactorEnabled(value);
    setSavingPrivacy(true);
    try {
      await settingsService.updatePrivacy({ twoFactorEnabled: value });
    } catch {
      setTwoFactorEnabled(!value);
    } finally {
      setSavingPrivacy(false);
    }
  };

  const handleActivityStatusToggle = async (value: boolean) => {
    setActivityStatusEnabled(value);
    setSavingPrivacy(true);
    try {
      await settingsService.updatePrivacy({ activityStatusEnabled: value });
    } catch {
      setActivityStatusEnabled(!value);
    } finally {
      setSavingPrivacy(false);
    }
  };

  const handleNotifSave = async () => {
    if (!notifSettings) return;
    setSavingNotif(true);
    try {
      await notificationService.updateSettings(notifSettings);
    } finally {
      setSavingNotif(false);
    }
  };

  const updateNotif = (path: 'social' | 'alerts' | 'delivery', key: string, value: boolean) => {
    setNotifSettings((prev) => {
      if (!prev) return prev;
      const next = { ...prev };
      const group = next[path] ?? {};
      (next[path] as Record<string, boolean>) = { ...group, [key]: value };
      return next;
    });
  };

  const handleLogout = async () => {
    try {
      await authService.logout(refreshToken ?? null);
    } catch (_) {}
    await logout();
    router.replace('/(auth)/login');
  };

  const theme = colors.light;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.sectionTitle, { color: theme.foreground }]}>Privacy</Text>
      {!loadingPrivacy && (
        <View style={[styles.row, { borderColor: theme.border }]}>
          <Text style={[styles.rowLabel, { color: theme.foreground }]}>Two-factor authentication</Text>
          <Switch
            value={twoFactorEnabled}
            onValueChange={handlePrivacyToggle}
            disabled={savingPrivacy}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#fff"
          />
        </View>
      )}
      {!loadingPrivacy && (
        <View style={[styles.row, { borderColor: theme.border }]}>
          <Text style={[styles.rowLabel, { color: theme.foreground }]}>Show activity status</Text>
          <Switch
            value={activityStatusEnabled}
            onValueChange={handleActivityStatusToggle}
            disabled={savingPrivacy}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor="#fff"
          />
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: theme.foreground, marginTop: spacing.xl }]}>Notification preferences</Text>
      {!loadingNotif && notifSettings && (
        <>
          <View style={[styles.row, { borderColor: theme.border }]}>
            <Text style={[styles.rowLabel, { color: theme.foreground }]}>Likes</Text>
            <Switch
              value={notifSettings.social?.likes ?? true}
              onValueChange={(v) => updateNotif('social', 'likes', v)}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={[styles.row, { borderColor: theme.border }]}>
            <Text style={[styles.rowLabel, { color: theme.foreground }]}>Comments</Text>
            <Switch
              value={notifSettings.social?.comments ?? true}
              onValueChange={(v) => updateNotif('social', 'comments', v)}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={[styles.row, { borderColor: theme.border }]}>
            <Text style={[styles.rowLabel, { color: theme.foreground }]}>Connections</Text>
            <Switch
              value={notifSettings.social?.connections ?? true}
              onValueChange={(v) => updateNotif('social', 'connections', v)}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>
          <View style={[styles.row, { borderColor: theme.border }]}>
            <Text style={[styles.rowLabel, { color: theme.foreground }]}>Messages</Text>
            <Switch
              value={notifSettings.social?.messages ?? true}
              onValueChange={(v) => updateNotif('social', 'messages', v)}
              trackColor={{ false: theme.border, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>
          <Button title={savingNotif ? 'Saving…' : 'Save notification preferences'} onPress={handleNotifSave} loading={savingNotif} style={styles.saveBtn} />
        </>
      )}

      <Text style={[styles.sectionTitle, { color: theme.foreground, marginTop: spacing.xl }]}>Account</Text>
      <Button title="Log out" variant="outline" onPress={handleLogout} style={styles.btn} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl * 2 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md, borderBottomWidth: 1 },
  rowLabel: { fontSize: 16 },
  saveBtn: { marginTop: spacing.md },
  btn: { marginTop: spacing.md },
});
