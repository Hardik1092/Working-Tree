import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function OpportunitiesScreen() {
  const theme = colors.light;
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.foreground }]}>Opportunities</Text>
      <Text style={[styles.placeholder, { color: theme.muted }]}>Farming opportunities and schemes.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '600', marginBottom: spacing.sm },
  placeholder: { fontSize: 14 },
});
