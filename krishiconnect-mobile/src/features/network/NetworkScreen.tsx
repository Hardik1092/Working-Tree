import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import type { NetworkRecommendation } from '@krishiconnect/shared';
import { networkService } from '@/services/networkService';
import { userService } from '@/services/userService';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export function NetworkScreen() {
  const [list, setList] = useState<NetworkRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const theme = colors.light;

  const load = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const res = await networkService.getRecommendations({ limit: 50 });
      setList(res.recommendations ?? []);
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

  const handleFollow = async (userId: string) => {
    try {
      await userService.follow(userId);
      await load(true);
    } catch (_) {}
  };

  const renderItem = ({ item }: { item: NetworkRecommendation }) => {
    const name = item.name ?? 'User';
    const avatarUri = item.profilePhoto?.url ?? (item as { avatar?: string }).avatar;
    return (
      <View style={[styles.row, { borderColor: theme.border }]}>
        <Avatar uri={avatarUri} name={name} size={48} />
        <View style={styles.rowContent}>
          <Text style={[styles.name, { color: theme.foreground }]}>{name}</Text>
          {item.headline ? <Text style={[styles.headline, { color: theme.muted }]}>{item.headline}</Text> : null}
        </View>
        <Button title="Follow" variant="outline" onPress={() => handleFollow(item._id)} style={styles.followBtn} />
      </View>
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
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(true)} />}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.centered}>
            <Text style={{ color: theme.muted }}>No recommendations</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1 },
  rowContent: { flex: 1, marginLeft: spacing.sm },
  name: { fontSize: 16, fontWeight: '600' },
  headline: { fontSize: 13, marginTop: 2 },
  followBtn: { marginLeft: spacing.sm },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
});
