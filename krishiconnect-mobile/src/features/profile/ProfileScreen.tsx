import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/userService';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { typography } from '@/theme/typography';

export function ProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const theme = colors.light;

  useFocusEffect(
    useCallback(() => {
      if (!user) return;
      userService
        .getMe()
        .then((me) => setUser(me))
        .catch(() => {});
    }, [user?._id, setUser])
  );

  if (!user) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: theme.background }]}>
        <Text style={[styles.text, { color: theme.muted }]}>Not logged in</Text>
      </View>
    );
  }

  const avatarUri =
    typeof user.avatar === 'string'
      ? user.avatar
      : (user.avatar as { url?: string } | undefined)?.url ??
        (user.profilePhoto as { url?: string } | undefined)?.url;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Avatar uri={avatarUri} name={user.name} size={88} />
        <Text style={[styles.name, { color: theme.foreground }]}>{user.name}</Text>
        {user.bio ? <Text style={[styles.bio, { color: theme.muted }]}>{user.bio}</Text> : null}
      </View>
      <View style={styles.actions}>
        <Button
          title="Edit profile"
          variant="outline"
          onPress={() => router.push('/(drawer)/(tabs)/profile/edit')}
          style={styles.btn}
        />
        <Button
          title="My posts"
          variant="outline"
          onPress={() => router.push('/(drawer)/(tabs)/profile/posts')}
          style={styles.btn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { justifyContent: 'center', alignItems: 'center' },
  header: {
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  text: { ...typography.body },
  name: { ...typography.title, marginTop: spacing.md },
  bio: { ...typography.bodySmall, marginTop: spacing.sm, textAlign: 'center', paddingHorizontal: spacing.lg },
  actions: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  btn: { marginBottom: spacing.sm },
});
