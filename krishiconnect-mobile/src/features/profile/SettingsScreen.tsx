import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity, Modal, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';
import { settingsService } from '@/services/settingsService';
import { notificationService } from '@/services/notificationService';
import type { NotificationSettings } from '@krishiconnect/shared';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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
  const [panel, setPanel] = useState<null | 'privacy' | 'notifications' | 'account'>(null);

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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.headerTitle, { color: theme.muted }]}>SETTINGS</Text>

        <View style={[styles.card, { backgroundColor: theme.card }]}>
          <SettingsItem
            icon="person-outline"
            label="Profile"
            active
            onPress={() => router.push('/(drawer)/(tabs)/profile')}
          />
          <SettingsItem
            icon="card-outline"
            label="Account"
            onPress={() => setPanel('account')}
          />
          <SettingsItem
            icon="notifications-outline"
            label="Notifications"
            onPress={() => setPanel('notifications')}
          />
          <SettingsItem
            icon="lock-closed-outline"
            label="Privacy & Security"
            onPress={() => setPanel('privacy')}
          />
          <SettingsItem icon="options-outline" label="Preferences" onPress={() => {}} />
          <SettingsItem icon="star-outline" label="Upgrade to Expert" onPress={() => {}} />
          <SettingsItem icon="warning-outline" label="Danger Zone" onPress={() => setPanel('account')} />
        </View>
      </ScrollView>

      <Modal visible={panel !== null} transparent animationType="slide" onRequestClose={() => setPanel(null)}>
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalSheet, { backgroundColor: theme.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.foreground }]}>
                {panel === 'privacy' ? 'Privacy & Security' : panel === 'notifications' ? 'Notifications' : 'Account'}
              </Text>
              <TouchableOpacity
                onPress={() => setPanel(null)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.modalClose}
              >
                <Ionicons name="close" size={22} color={theme.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
              {panel === 'privacy' ? (
                <>
                  {!loadingPrivacy && (
                    <View style={[styles.panelRow, { borderColor: theme.border }]}>
                      <Text style={[styles.panelLabel, { color: theme.foreground }]}>Two-factor authentication</Text>
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
                    <View style={[styles.panelRow, { borderColor: theme.border }]}>
                      <Text style={[styles.panelLabel, { color: theme.foreground }]}>Show activity status</Text>
                      <Switch
                        value={activityStatusEnabled}
                        onValueChange={handleActivityStatusToggle}
                        disabled={savingPrivacy}
                        trackColor={{ false: theme.border, true: theme.primary }}
                        thumbColor="#fff"
                      />
                    </View>
                  )}
                </>
              ) : null}

              {panel === 'notifications' ? (
                <>
                  {!loadingNotif && notifSettings && (
                    <>
                      <View style={[styles.panelRow, { borderColor: theme.border }]}>
                        <Text style={[styles.panelLabel, { color: theme.foreground }]}>Likes</Text>
                        <Switch
                          value={notifSettings.social?.likes ?? true}
                          onValueChange={(v) => updateNotif('social', 'likes', v)}
                          trackColor={{ false: theme.border, true: theme.primary }}
                          thumbColor="#fff"
                        />
                      </View>
                      <View style={[styles.panelRow, { borderColor: theme.border }]}>
                        <Text style={[styles.panelLabel, { color: theme.foreground }]}>Comments</Text>
                        <Switch
                          value={notifSettings.social?.comments ?? true}
                          onValueChange={(v) => updateNotif('social', 'comments', v)}
                          trackColor={{ false: theme.border, true: theme.primary }}
                          thumbColor="#fff"
                        />
                      </View>
                      <View style={[styles.panelRow, { borderColor: theme.border }]}>
                        <Text style={[styles.panelLabel, { color: theme.foreground }]}>Connections</Text>
                        <Switch
                          value={notifSettings.social?.connections ?? true}
                          onValueChange={(v) => updateNotif('social', 'connections', v)}
                          trackColor={{ false: theme.border, true: theme.primary }}
                          thumbColor="#fff"
                        />
                      </View>
                      <View style={[styles.panelRow, { borderColor: theme.border }]}>
                        <Text style={[styles.panelLabel, { color: theme.foreground }]}>Messages</Text>
                        <Switch
                          value={notifSettings.social?.messages ?? true}
                          onValueChange={(v) => updateNotif('social', 'messages', v)}
                          trackColor={{ false: theme.border, true: theme.primary }}
                          thumbColor="#fff"
                        />
                      </View>
                      <Button
                        title={savingNotif ? 'Saving…' : 'Save notification preferences'}
                        onPress={handleNotifSave}
                        loading={savingNotif}
                        style={styles.panelBtn}
                      />
                    </>
                  )}
                </>
              ) : null}

              {panel === 'account' ? (
                <Button title="Log out" variant="outline" onPress={handleLogout} style={styles.panelBtn} />
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function SettingsItem({
  icon,
  label,
  active,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  const theme = colors.light;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.itemRow,
        active && { backgroundColor: `${theme.primary}14` },
      ]}
    >
      <Ionicons name={icon} size={22} color={active ? theme.primary : '#9CA3AF'} />
      <Text style={[styles.itemLabel, { color: active ? theme.primary : '#374151' }]} numberOfLines={1}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xl },
  headerTitle: { fontSize: 12, letterSpacing: 1.4, fontWeight: '700', marginBottom: spacing.md },
  card: {
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 10,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 14,
        shadowOffset: { width: 0, height: 6 },
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  itemLabel: { fontSize: 16, fontWeight: '600', flex: 1, marginLeft: 12, marginRight: 10 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-end' },
  modalSheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalHeader: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalTitle: { fontSize: 16, fontWeight: '700', flex: 1 },
  modalClose: { paddingLeft: spacing.md },
  modalContent: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, paddingBottom: spacing.xl },
  panelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  panelLabel: { fontSize: 16, flex: 1, paddingRight: spacing.md },
  panelBtn: { marginTop: spacing.md },
});
