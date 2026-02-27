import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const VISIBLE_TABS = ['home', 'search', 'create', 'messages', 'news'];
const TAB_BAR_RADIUS = 16;
const TAB_BAR_PADDING_TOP = 8;
const TAB_BAR_PADDING_BOTTOM_MIN = 10;
const TAB_BAR_HEIGHT_BASE = 70;
const ICON_SIZE = 26;
const ICON_SIZE_CREATE = 28;
const LABEL_SIZE = 11;
const ACTIVE_INDICATOR_HEIGHT = 3;
const CREATE_FAB_SIZE = 52;

const TAB_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  home: 'home-outline',
  search: 'sparkles-outline',
  create: 'add',
  messages: 'chatbubble-outline',
  news: 'newspaper-outline',
  profile: 'person-outline',
};

const TAB_LABELS: Record<string, string> = {
  home: 'Home',
  search: 'Assistant',
  create: 'Add Post',
  messages: 'Messages',
  news: 'News',
  profile: 'Profile',
};

export function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const theme = colors.light;
  const paddingBottom = Math.max(TAB_BAR_PADDING_BOTTOM_MIN, insets.bottom);

  const visibleRoutes = state.routes.filter((r: { name: string }) => VISIBLE_TABS.includes(r.name));

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.card,
          paddingTop: TAB_BAR_PADDING_TOP,
          paddingBottom,
          minHeight: TAB_BAR_HEIGHT_BASE + paddingBottom,
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: theme.border,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.06,
              shadowRadius: 8,
            },
            android: { elevation: 8 },
          }),
        },
      ]}
    >
      <View style={styles.row} pointerEvents="box-none">
        {visibleRoutes.map((route: { key: string; name: string }) => {
          const currentRoute = state.routes[state.index];
          const isFocused = currentRoute && currentRoute.key === route.key;
          const color = isFocused ? theme.primary : theme.muted;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const iconName = TAB_ICONS[route.name] ?? 'ellipse-outline';
          const label = TAB_LABELS[route.name] ?? route.name;
          const isCreate = route.name === 'create';

          return (
            <TouchableOpacity
              key={route.key}
              onPress={onPress}
              style={[styles.tabItem, isCreate && styles.tabItemCreate]}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={label}
            >
              {isCreate ? (
                <>
                  <View
                    style={[
                      styles.createFab,
                      {
                        backgroundColor: theme.primary,
                        shadowColor: '#000',
                      },
                    ]}
                  >
                    <Ionicons name={iconName} size={ICON_SIZE_CREATE} color={theme.primaryForeground} />
                  </View>
                  <Text style={[styles.label, { color }]} numberOfLines={1}>
                    {label}
                  </Text>
                </>
              ) : (
                <>
                  <View style={styles.iconWrap}>
                    <Ionicons name={iconName} size={ICON_SIZE} color={color} />
                    {isFocused ? (
                      <View style={[styles.activeIndicator, { backgroundColor: theme.primary }]} />
                    ) : null}
                  </View>
                  <Text style={[styles.label, { color }]} numberOfLines={1}>
                    {label}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderTopLeftRadius: TAB_BAR_RADIUS,
    borderTopRightRadius: TAB_BAR_RADIUS,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    width: '100%',
  },
  tabItem: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingTop: spacing.xs,
    paddingBottom: spacing.sm,
  },
  tabItemCreate: {
    paddingBottom: spacing.xs,
  },
  createFab: {
    width: CREATE_FAB_SIZE,
    height: CREATE_FAB_SIZE,
    borderRadius: CREATE_FAB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
    marginBottom: 6,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.18,
        shadowRadius: 10,
      },
      android: { elevation: 10 },
    }),
  },
  iconWrap: {
    alignItems: 'center',
    marginBottom: 4,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -6,
    width: 20,
    height: ACTIVE_INDICATOR_HEIGHT,
    borderRadius: ACTIVE_INDICATOR_HEIGHT / 2,
  },
  label: {
    fontSize: LABEL_SIZE,
    fontWeight: '600',
  },
});
