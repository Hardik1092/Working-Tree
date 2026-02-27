import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, RefreshControl, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { newsService, type NewsItem } from '@/services/newsService';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

function formatSourceLine(item: NewsItem) {
  const parts = [item.source, item.publishedAt].filter(Boolean);
  return parts.join(' · ');
}

export function NewsScreen() {
  const theme = colors.light;
  const [list, setList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const data = await newsService.getAgricultureNews();
      setList(data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(true);
    }, [load])
  );

  const renderItem = ({ item }: { item: NewsItem }) => {
    const title = item.title ?? 'News';
    const desc = item.description ?? '';
    const meta = formatSourceLine(item);

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
        activeOpacity={0.8}
        onPress={() => {
          if (item.url) Linking.openURL(String(item.url));
        }}
      >
        <Text style={[styles.title, { color: theme.foreground }]} numberOfLines={2}>
          {title}
        </Text>
        {desc ? (
          <Text style={[styles.desc, { color: theme.muted }]} numberOfLines={3}>
            {desc}
          </Text>
        ) : null}
        {meta ? (
          <Text style={[styles.meta, { color: theme.muted }]} numberOfLines={1}>
            {meta}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  if (loading && list.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.muted }}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={list}
        keyExtractor={(item, idx) => String((item as any)._id ?? item.url ?? idx)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={{ color: theme.muted }}>No news</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: spacing.md, paddingBottom: 24 },
  card: { borderWidth: 1, borderRadius: 16, padding: spacing.md, marginBottom: spacing.sm },
  title: { fontSize: 16, fontWeight: '700' },
  desc: { fontSize: 14, marginTop: 6, lineHeight: 20 },
  meta: { fontSize: 12, marginTop: 10 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
});

