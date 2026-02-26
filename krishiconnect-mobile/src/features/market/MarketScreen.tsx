import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import type { MarketPrice } from '@krishiconnect/shared';
import { marketService } from '@/services/marketService';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export function MarketScreen() {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = colors.light;

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await marketService.getPrices({ limit: 30 });
      setPrices(res.prices ?? []);
    } catch (_) {}
    finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load(true);
    }, [load])
  );

  const renderItem = ({ item }: { item: MarketPrice }) => (
    <View style={[styles.row, { borderColor: theme.border }]}>
      <View style={styles.rowMain}>
        <Text style={[styles.commodity, { color: theme.foreground }]}>{item.commodity ?? '—'}</Text>
        <Text style={[styles.market, { color: theme.muted }]}>{item.market ?? ''} · {item.district ?? ''} · {item.state ?? ''}</Text>
      </View>
      <Text style={[styles.price, { color: theme.foreground }]}>
        ₹{item.price ?? item.minPrice ?? item.maxPrice ?? '—'}
        {item.unit ? ` / ${item.unit}` : ''}
      </Text>
      {item.date ? <Text style={[styles.date, { color: theme.muted }]}>{item.date}</Text> : null}
    </View>
  );

  if (loading && prices.length === 0) {
    return (
      <View style={[styles.centered, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.muted }}>Loading…</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={prices}
        keyExtractor={(item, i) => item._id ?? String(i)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={{ color: theme.muted }}>No price data</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: 24 },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1 },
  rowMain: { flex: 1 },
  commodity: { fontSize: 16, fontWeight: '600' },
  market: { fontSize: 13, marginTop: 2 },
  price: { fontSize: 16, fontWeight: '600', marginLeft: spacing.sm },
  date: { fontSize: 12, width: '100%', marginTop: 2 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
});
