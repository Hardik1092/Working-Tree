import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { notificationService } from '@/services/notificationService';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const HEADER_H_PADDING = 18;

type MainHeaderProps = {
  openDrawer?: () => void;
};

export function MainHeader({ openDrawer }: MainHeaderProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = colors.light;

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 60000,
  });

  const handleMenuPress = () => {
    openDrawer?.();
  };

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: theme.card,
          borderBottomColor: theme.border,
          paddingTop: insets.top + spacing.md,
        },
      ]}
    >
      <Text style={[styles.logo, { color: theme.foreground }]} numberOfLines={1}>
        KrishiConnect
      </Text>
      <View style={styles.icons}>
        <TouchableOpacity
          onPress={() => router.push('/(drawer)/(tabs)/search')}
          style={styles.iconBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="search-outline" size={22} color={theme.foreground} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.push('/(drawer)/(tabs)/alerts')}
          style={styles.iconBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="notifications-outline" size={22} color={theme.foreground} />
          {unreadCount > 0 && (
            <View style={[styles.badge, { backgroundColor: theme.primary }]}>
              <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleMenuPress}
          style={styles.iconBtn}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="menu" size={22} color={theme.foreground} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HEADER_H_PADDING,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logo: { fontSize: 18, fontWeight: '600', flex: 1, paddingRight: spacing.sm },
  icons: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { padding: spacing.xs, position: 'relative', marginLeft: spacing.sm },
  badge: {
    position: 'absolute',
    top: 0,
    right: 0,
    minWidth: 14,
    height: 14,
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '600' },
});
