import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export default function SearchScreen() {
  const theme = colors.light;
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.foreground }]}>Krishi Assistant</Text>
      <Text style={[styles.placeholder, { color: theme.muted }]}>Ask questions about crops, weather, and farming.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '600', marginBottom: spacing.sm },
  placeholder: { fontSize: 14 },
});
