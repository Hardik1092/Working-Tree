import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/userService';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

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
      <View style={[styles.container, { backgroundColor: theme.background }]}>
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
      <Avatar uri={avatarUri} name={user.name} size={80} />
      <Text style={[styles.name, { color: theme.foreground }]}>{user.name}</Text>
      {user.bio ? <Text style={[styles.bio, { color: theme.muted }]}>{user.bio}</Text> : null}
      <Button
        title="Edit profile"
        variant="outline"
        onPress={() => router.push('/(tabs)/profile/edit')}
        style={styles.btn}
      />
      <Button
        title="My posts"
        variant="outline"
        onPress={() => router.push('/(tabs)/profile/posts')}
        style={styles.btn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, alignItems: 'center', paddingTop: spacing.xl },
  text: { fontSize: 16 },
  name: { fontSize: 22, fontWeight: '700', marginTop: spacing.md },
  bio: { marginTop: spacing.sm, textAlign: 'center' },
  hint: { marginTop: spacing.lg, fontSize: 14 },
  btn: { marginTop: spacing.md, width: '100%', maxWidth: 280 },
});
