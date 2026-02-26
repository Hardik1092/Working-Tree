import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { weatherService } from '@/services/weatherService';
import type { WeatherCurrent } from '@krishiconnect/shared';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

export function WeatherScreen() {
  const [weather, setWeather] = useState<WeatherCurrent | null>(null);
  const [loading, setLoading] = useState(true);
  const theme = colors.light;

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoading(true);
      weatherService
        .getCurrent()
        .then((w) => { if (!cancelled) setWeather(w); })
        .catch(() => { if (!cancelled) setWeather(null); })
        .finally(() => { if (!cancelled) setLoading(false); });
      return () => { cancelled = true; };
    }, [])
  );

  if (loading && !weather) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.muted }}>Loading…</Text>
      </View>
    );
  }

  if (!weather) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.muted }}>Weather unavailable</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      {weather.location ? <Text style={[styles.location, { color: theme.muted }]}>{weather.location}</Text> : null}
      <Text style={[styles.temp, { color: theme.foreground }]}>
        {weather.temperature != null ? `${Math.round(weather.temperature)}°` : '—'}
      </Text>
      <Text style={[styles.condition, { color: theme.foreground }]}>{weather.condition ?? weather.description ?? ''}</Text>
      {weather.humidity != null && <Text style={[styles.meta, { color: theme.muted }]}>Humidity: {weather.humidity}%</Text>}
      {weather.windSpeed != null && <Text style={[styles.meta, { color: theme.muted }]}>Wind: {weather.windSpeed}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.xl, justifyContent: 'center', alignItems: 'center' },
  location: { fontSize: 14, marginBottom: spacing.sm },
  temp: { fontSize: 48, fontWeight: '700' },
  condition: { fontSize: 18, marginTop: spacing.sm },
  meta: { fontSize: 14, marginTop: spacing.xs },
});
