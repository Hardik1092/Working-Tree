import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import type { FeedPost } from '@krishiconnect/shared';
import type { WeatherCurrent } from '@krishiconnect/shared';
import type { MarketPrice } from '@krishiconnect/shared';
import { notificationService } from '@/services/notificationService';
import { weatherService } from '@/services/weatherService';
import { marketService } from '@/services/marketService';
import { useAuthStore } from '@/store/authStore';
import { PostCard } from '@/components/common/PostCard';
import { Avatar } from '@/components/common/Avatar';
import { EmptyState } from '@/components/common/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { useFeed, type FeedMode } from './useFeed';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { typography } from '@/theme/typography';

const CARD_RADIUS = 16;
const TAB_BAR_BOTTOM_PADDING = 88;

function getWeatherTip(w: WeatherCurrent | null): string {
  if (!w) return 'Tap for full forecast';
  const temp = w.temperature != null ? Number(w.temperature) : null;
  const cRaw = typeof w.condition === 'string' ? w.condition : (typeof w.description === 'string' ? w.description : '');
  const c = cRaw.toLowerCase();
  if (c.includes('rain') || c.includes('drizzle')) return 'Rain expected. Avoid spraying pesticides today.';
  if (c.includes('thunder')) return 'Thunderstorm possible. Secure sheds & stay safe.';
  if (temp != null && temp > 38) return 'Hot day. Water crops early morning. Stay hydrated.';
  if (temp != null && temp < 10) return 'Cold. Protect sensitive crops from frost.';
  return 'Tap for full forecast & outlook';
}

export function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const theme = colors.light;
  const user = useAuthStore((s) => s.user);
  const [feedMode, setFeedMode] = useState<FeedMode>('recent');

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['notifications', 'unreadCount'],
    queryFn: () => notificationService.getUnreadCount(),
    refetchInterval: 60000,
  });

  const {
    data: posts,
    isLoading: feedLoading,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    likePost,
  } = useFeed(feedMode);

  const { data: weather, isLoading: weatherLoading } = useQuery({
    queryKey: ['weather', 'current'],
    queryFn: () => weatherService.getCurrent(),
  });

  const weatherConditionText =
    weather && typeof weather.condition === 'string'
      ? weather.condition
      : weather && typeof weather.description === 'string'
        ? weather.description
        : '—';
  const weatherLocationText = weather && typeof weather.location === 'string' ? weather.location : '';
  const weatherWindText =
    weather && (typeof weather.windSpeed === 'number' || typeof weather.windSpeed === 'string')
      ? String(weather.windSpeed)
      : null;

  const { data: marketData, isLoading: marketLoading, refetch: refetchMarket } = useQuery({
    queryKey: ['market', 'prices'],
    queryFn: () => marketService.getPrices({ limit: 6 }),
  });
  const marketPrices = marketData?.prices ?? [];

  const openCreate = useCallback(() => {
    router.push('/(drawer)/(tabs)/create');
  }, [router]);

  const renderHeader = () => (
    <>
      <View style={[styles.createCard, { backgroundColor: theme.card }]}>
        <TouchableOpacity style={styles.createCardTop} onPress={openCreate} activeOpacity={0.8}>
          <Avatar
            uri={
              typeof user?.avatar === 'string'
                ? user.avatar
                : (user as { avatar?: { url?: string } })?.avatar?.url
            }
            name={user?.name ?? 'You'}
            size={44}
          />
          <Text style={[styles.createPlaceholder, { color: theme.muted }]}>
            Share something with farmers…
          </Text>
        </TouchableOpacity>
        <View style={[styles.createDivider, { backgroundColor: theme.border }]} />
        <View style={styles.createActions}>
          {[
            { icon: 'videocam-outline' as const, label: 'Video' },
            { icon: 'image-outline' as const, label: 'Photo' },
            { icon: 'document-text-outline' as const, label: 'Article' },
          ].map(({ icon, label }) => (
            <TouchableOpacity
              key={label}
              onPress={openCreate}
              style={styles.createActionBtn}
              activeOpacity={0.7}
            >
              <Ionicons name={icon} size={20} color={theme.primary} />
              <Text style={[styles.createActionLabel, { color: theme.foreground }]}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.toggleWrap}>
        <View style={[styles.toggleContainer, { backgroundColor: theme.border }]}>
          <TouchableOpacity
            onPress={() => setFeedMode('recent')}
            style={[
              styles.toggleTab,
              feedMode === 'recent' && { backgroundColor: theme.primary },
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleLabel,
                { color: feedMode === 'recent' ? theme.primaryForeground : theme.muted },
              ]}
            >
              Recent
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setFeedMode('trending')}
            style={[
              styles.toggleTab,
              feedMode === 'trending' && { backgroundColor: theme.primary },
            ]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.toggleLabel,
                { color: feedMode === 'trending' ? theme.primaryForeground : theme.muted },
              ]}
            >
              Trending
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </>
  );

  const renderFooter = () => (
    <>
      <TouchableOpacity
        style={styles.weatherCard}
        onPress={() => router.push('/(drawer)/(tabs)/weather')}
        activeOpacity={0.9}
      >
        <View style={styles.weatherHeader}>
          <Text style={[styles.weatherTitle, { color: theme.foreground }]}>Today's Weather</Text>
          <View style={[styles.liveBadge, { backgroundColor: `${theme.primary}18`, borderColor: theme.primary }]}>
            <Text style={[styles.liveBadgeText, { color: theme.primary }]}>Live</Text>
          </View>
        </View>
        {weatherLoading && !weather ? (
          <View style={styles.weatherSkeleton}>
            <Text style={{ color: theme.muted }}>Loading…</Text>
          </View>
        ) : weather ? (
          <>
            <View style={styles.weatherMain}>
              <Text style={styles.weatherEmoji}>⛅</Text>
              <View>
                <Text style={[styles.weatherTemp, { color: theme.foreground }]}>
                  {weather.temperature != null ? Math.round(Number(weather.temperature)) : '—'}°
                  <Text style={[styles.weatherUnit, { color: theme.muted }]}>C</Text>
                </Text>
                <Text style={[styles.weatherCondition, { color: theme.muted }]}>
                  {weatherConditionText}
                </Text>
                {weatherLocationText ? (
                  <Text style={[styles.weatherLocation, { color: theme.muted }]} numberOfLines={1}>
                    📍 {weatherLocationText}
                  </Text>
                ) : null}
              </View>
            </View>
            <View style={styles.weatherStats}>
              {weather.humidity != null && (
                <View style={styles.weatherStat}>
                  <Ionicons name="water-outline" size={14} color={theme.primary} />
                  <Text style={[styles.weatherStatValue, { color: theme.foreground }]}>
                    {Math.round(Number(weather.humidity))}%
                  </Text>
                  <Text style={[styles.weatherStatLabel, { color: theme.muted }]}>Humidity</Text>
                </View>
              )}
              {weatherWindText != null && (
                <View style={styles.weatherStat}>
                  <Ionicons name="partly-sunny-outline" size={14} color={theme.primary} />
                  <Text style={[styles.weatherStatValue, { color: theme.foreground }]}>
                    {weatherWindText} km/h
                  </Text>
                  <Text style={[styles.weatherStatLabel, { color: theme.muted }]}>Wind</Text>
                </View>
              )}
            </View>
            <View style={[styles.weatherTip, { backgroundColor: theme.primary }]}>
              <Text style={styles.weatherTipText}>{getWeatherTip(weather)}</Text>
            </View>
          </>
        ) : null}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.mandiCard, { backgroundColor: theme.card }]}
        onPress={() => router.push('/(drawer)/(tabs)/market')}
        activeOpacity={0.9}
      >
        <View style={styles.mandiHeader}>
          <Text style={[styles.mandiTitle, { color: theme.foreground }]}>Mandi Prices</Text>
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation(); refetchMarket(); }}
            style={styles.mandiRefresh}
          >
            <Ionicons name="refresh" size={18} color={theme.muted} />
          </TouchableOpacity>
        </View>
        {marketLoading && marketPrices.length === 0 ? (
          <View style={styles.mandiSkeleton}>
            <Text style={{ color: theme.muted }}>Loading…</Text>
          </View>
        ) : (
          <>
            {marketPrices.slice(0, 6).map((item, i) => (
              <View
                key={item._id ?? i}
                style={[styles.mandiRow, i < marketPrices.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border }]}
              >
                <Text style={[styles.mandiCrop, { color: theme.foreground }]} numberOfLines={1}>
                  {item.commodity ?? '—'}
                </Text>
                <Text style={[styles.mandiPrice, { color: theme.foreground }]}>
                  ₹{item.price ?? item.minPrice ?? item.maxPrice ?? '—'}
                  {item.unit ? ` / ${item.unit}` : ''}
                </Text>
              </View>
            ))}
            <Text style={[styles.mandiUpdated, { color: theme.muted }]}>Tap for more · Auto-update</Text>
          </>
        )}
      </TouchableOpacity>
    </>
  );

  const renderItem = ({ item }: { item: FeedPost }) => (
    <PostCard
      post={item}
      onLike={() => likePost(item._id)}
      onComment={() => router.push(`/post/${item._id}`)}
      onMenuPress={() => router.push(`/post/${item._id}`)}
    />
  );

  const keyExtractor = (item: FeedPost) => item._id;

  if (feedLoading && posts.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <SafeAreaView style={styles.safe} edges={['top']}>
          {renderHeader()}
        </SafeAreaView>
        <Spinner />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        <FlatList
          data={posts}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: TAB_BAR_BOTTOM_PADDING + insets.bottom },
            posts.length === 0 && styles.listContentEmpty,
          ]}
          refreshControl={
            <RefreshControl refreshing={isRefetching} onRefresh={() => refetch()} />
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.3}
          removeClippedSubviews
          maxToRenderPerBatch={8}
          windowSize={6}
          initialNumToRender={6}
          ListEmptyComponent={
            <EmptyState message="No posts yet. Be the first to post!" />
          }
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safe: { flex: 1, backgroundColor: colors.light.background },
  createCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 3 },
    }),
  },
  createCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  createPlaceholder: { ...typography.bodySmall, marginLeft: spacing.sm, flex: 1 },
  createDivider: { height: StyleSheet.hairlineWidth, marginHorizontal: spacing.md },
  createActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  createActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  createActionLabel: { ...typography.caption, fontWeight: '600' },
  toggleWrap: { paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm },
  toggleContainer: {
    flexDirection: 'row',
    borderRadius: borderRadius.full,
    padding: 2,
  },
  toggleTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
  },
  toggleLabel: { ...typography.label },
  listContent: {
    paddingTop: spacing.sm,
  },
  listContentEmpty: { flexGrow: 1 },
  weatherCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: CARD_RADIUS,
    backgroundColor: '#f0fdf4',
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  weatherHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  weatherTitle: { ...typography.headline },
  liveBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  liveBadgeText: { fontSize: 10, fontWeight: '600' },
  weatherSkeleton: { paddingVertical: spacing.xl, alignItems: 'center' },
  weatherMain: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.md },
  weatherEmoji: { fontSize: 40 },
  weatherTemp: { fontSize: 28, fontWeight: '700' },
  weatherUnit: { fontSize: 14, fontWeight: '500' },
  weatherCondition: { fontSize: 13, marginTop: 2 },
  weatherLocation: { fontSize: 11, marginTop: 2 },
  weatherStats: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.md },
  weatherStat: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  weatherStatValue: { fontSize: 13, fontWeight: '600' },
  weatherStatLabel: { fontSize: 10 },
  weatherTip: { borderRadius: borderRadius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  weatherTipText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  mandiCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 6 },
      android: { elevation: 2 },
    }),
  },
  mandiHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  mandiTitle: { ...typography.headline },
  mandiRefresh: { padding: spacing.xs },
  mandiSkeleton: { paddingVertical: spacing.xl, alignItems: 'center' },
  mandiRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.sm },
  mandiCrop: { ...typography.bodySmall, flex: 1 },
  mandiPrice: { ...typography.bodySmall, fontWeight: '600', marginLeft: spacing.sm },
  mandiUpdated: { fontSize: 11, marginTop: spacing.sm },
});
