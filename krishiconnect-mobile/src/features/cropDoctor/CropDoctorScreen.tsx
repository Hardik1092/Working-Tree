import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useRouter } from 'expo-router';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { env } from '@/config/env';
import { expertService, type Expert } from '@/services/expertService';
import { chatService } from '@/services/chatService';
import { Avatar } from '@/components/common/Avatar';

type PredictionResult = {
  disease_name?: string;
  confidence?: number | string;
  status?: string;
  recommendation?: string;
  [key: string]: unknown;
};

function normalizePrediction(data: any): PredictionResult {
  if (!data || typeof data !== 'object') return { disease_name: 'Unknown', confidence: 0, status: 'unknown', recommendation: '' };
  return {
    disease_name: data.disease_name ?? data.disease ?? data.class ?? 'Unknown',
    confidence: typeof data.confidence === 'number' ? data.confidence : parseFloat(data.confidence) || 0,
    status: data.status ?? (data.healthy ? 'healthy' : 'affected') ?? 'unknown',
    recommendation: data.recommendation ?? data.advice ?? data.message ?? '',
  };
}

export function CropDoctorScreen() {
  const theme = colors.light;
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loadingExperts, setLoadingExperts] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let cancelled = false;
      setLoadingExperts(true);
      expertService
        .getExperts()
        .then((list) => {
          if (!cancelled) setExperts(Array.isArray(list) ? list : []);
        })
        .catch(() => {
          if (!cancelled) setExperts([]);
        })
        .finally(() => {
          if (!cancelled) setLoadingExperts(false);
        });
      return () => {
        cancelled = true;
      };
    }, [])
  );

  const pick = useCallback(async (fromCamera: boolean) => {
    setError(null);
    setResult(null);

    if (fromCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') return;
      const res = await ImagePicker.launchCameraAsync({ quality: 0.9, allowsEditing: false });
      if (!res.canceled && res.assets?.[0]?.uri) setImageUri(res.assets[0].uri);
      return;
    }

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.9, allowsEditing: false, mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!res.canceled && res.assets?.[0]?.uri) setImageUri(res.assets[0].uri);
  }, []);

  const predict = useCallback(async () => {
    if (!imageUri) {
      setError('Please upload or capture an image first.');
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        name: 'crop.jpg',
        type: 'image/jpeg',
      } as any);

      const res = await fetch(env.CROP_DOCTOR_API_URL, {
        method: 'POST',
        body: formData,
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = json?.detail ?? json?.message ?? 'Prediction failed. Please try again.';
        throw new Error(typeof msg === 'string' ? msg : 'Prediction failed. Please try again.');
      }
      setResult(normalizePrediction(json));
    } catch (e: any) {
      setError(e?.message ?? 'Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [imageUri]);

  const isHealthy = (result?.status ?? '').toLowerCase() === 'healthy';
  const isAffected =
    (result?.status ?? '').toLowerCase() === 'affected' ||
    (!!result?.disease_name && result.disease_name !== 'Healthy');

  const askExpert = useCallback(
    async (expertId: string) => {
      try {
        const conv = await chatService.startExpertChat(expertId);
        router.push(`/(drawer)/(tabs)/messages/${conv._id}`);
      } catch {
        // ignore
      }
    },
    [router]
  );

  const expertCards = useMemo(() => experts.slice(0, 12), [experts]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.background }]} contentContainerStyle={styles.content}>
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.title, { color: theme.foreground }]}>Crop Doctor</Text>
        <Text style={[styles.sub, { color: theme.muted }]}>AI Crop Disease Detection</Text>

        <View style={styles.actions}>
          <TouchableOpacity style={[styles.actionBtn, { borderColor: theme.border }]} onPress={() => pick(false)} activeOpacity={0.8}>
            <Text style={[styles.actionText, { color: theme.foreground }]}>Upload Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { borderColor: theme.border }]} onPress={() => pick(true)} activeOpacity={0.8}>
            <Text style={[styles.actionText, { color: theme.foreground }]}>Capture Photo</Text>
          </TouchableOpacity>
          {imageUri ? (
            <TouchableOpacity style={styles.clearBtn} onPress={() => { setImageUri(null); setResult(null); setError(null); }} activeOpacity={0.8}>
              <Text style={[styles.clearText, { color: theme.destructive }]}>Clear</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {imageUri ? (
          <View style={[styles.previewWrap, { borderColor: theme.border }]}>
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
          </View>
        ) : null}

        <TouchableOpacity
          style={[styles.predictBtn, { backgroundColor: theme.primary, opacity: !imageUri || loading ? 0.6 : 1 }]}
          disabled={!imageUri || loading}
          onPress={predict}
          activeOpacity={0.85}
        >
          {loading ? <ActivityIndicator color={theme.primaryForeground} /> : <Text style={[styles.predictText, { color: theme.primaryForeground }]}>Predict</Text>}
        </TouchableOpacity>

        {error ? (
          <View style={[styles.alert, { borderColor: '#fecaca', backgroundColor: '#fef2f2' }]}>
            <Text style={[styles.alertText, { color: '#991b1b' }]}>{error}</Text>
          </View>
        ) : null}

        {result && !loading ? (
          <View
            style={[
              styles.result,
              { borderColor: isAffected ? '#fde68a' : '#bbf7d0', backgroundColor: isAffected ? '#fffbeb' : '#f0fdf4' },
            ]}
          >
            <Text style={[styles.resultStatus, { color: theme.foreground }]}>{isHealthy ? 'Healthy' : 'Affected'}</Text>
            <Text style={[styles.resultDisease, { color: theme.foreground }]}>{result.disease_name ?? 'Unknown'}</Text>
            <Text style={[styles.resultMeta, { color: theme.muted }]}>
              Confidence: {Math.round((Number(result.confidence ?? 0) || 0) * 100)}%
            </Text>
            {result.recommendation ? (
              <Text style={[styles.resultRec, { color: theme.foreground }]}>{String(result.recommendation)}</Text>
            ) : null}
          </View>
        ) : null}
      </View>

      <View style={styles.expertSection}>
        <Text style={[styles.expertTitle, { color: theme.foreground }]}>Ask an Expert</Text>
        {loadingExperts ? (
          <Text style={{ color: theme.muted }}>Loading…</Text>
        ) : expertCards.length === 0 ? (
          <Text style={{ color: theme.muted }}>No experts available</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.expertRow}>
            {expertCards.map((e) => {
              const avatar =
                e.profilePhoto?.url ??
                (typeof e.avatar === 'string' ? e.avatar : (e.avatar as any)?.url);
              return (
                <TouchableOpacity
                  key={e._id}
                  style={[styles.expertCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                  activeOpacity={0.8}
                  onPress={() => askExpert(e._id)}
                >
                  <Avatar uri={avatar} name={e.name ?? 'Expert'} size={44} />
                  <Text style={[styles.expertName, { color: theme.foreground }]} numberOfLines={1}>
                    {e.name ?? 'Expert'}
                  </Text>
                  {e.headline ? (
                    <Text style={[styles.expertHeadline, { color: theme.muted }]} numberOfLines={1}>
                      {e.headline}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xl },
  card: { borderWidth: 1, borderRadius: 18, padding: spacing.lg },
  title: { fontSize: 20, fontWeight: '800' },
  sub: { fontSize: 12, marginTop: 4 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 as any, marginTop: spacing.md },
  actionBtn: { borderWidth: 1, borderRadius: 14, paddingVertical: 10, paddingHorizontal: 14 },
  actionText: { fontSize: 14, fontWeight: '600' },
  clearBtn: { paddingVertical: 10, paddingHorizontal: 10 },
  clearText: { fontSize: 14, fontWeight: '700' },
  previewWrap: { borderWidth: 1, borderRadius: 14, overflow: 'hidden', marginTop: spacing.md, backgroundColor: '#f8fafc' },
  preview: { width: '100%', height: 220 },
  predictBtn: { marginTop: spacing.md, borderRadius: 14, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  predictText: { fontSize: 14, fontWeight: '800' },
  alert: { borderWidth: 1, borderRadius: 14, padding: spacing.md, marginTop: spacing.md },
  alertText: { fontSize: 13, fontWeight: '600' },
  result: { borderWidth: 1, borderRadius: 14, padding: spacing.md, marginTop: spacing.md },
  resultStatus: { fontSize: 12, fontWeight: '800' },
  resultDisease: { fontSize: 16, fontWeight: '800', marginTop: 6 },
  resultMeta: { fontSize: 12, marginTop: 4 },
  resultRec: { fontSize: 14, marginTop: 10, lineHeight: 20 },
  expertSection: { marginTop: spacing.lg },
  expertTitle: { fontSize: 14, fontWeight: '800', marginBottom: spacing.sm },
  expertRow: { paddingRight: spacing.md },
  expertCard: { width: 150, borderWidth: 1, borderRadius: 16, padding: spacing.md, marginRight: spacing.sm },
  expertName: { fontSize: 14, fontWeight: '800', marginTop: spacing.sm },
  expertHeadline: { fontSize: 12, marginTop: 2 },
});

