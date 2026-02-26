import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { postService } from '@/services/postService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';
import { useQueryClient } from '@tanstack/react-query';

const FEED_QUERY_KEY = ['feed', 'recent'];

interface CreatePostForm {
  content: string;
}

export function CreatePostScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { control, handleSubmit } = useForm<CreatePostForm>({ defaultValues: { content: '' } });

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.[0]) setImageUri(result.assets[0].uri);
  };

  const onSubmit = async (data: CreatePostForm) => {
    const text = (data.content ?? '').trim();
    if (!text && !imageUri) return;
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('content', text);
      formData.append('type', imageUri ? 'image' : 'text');
      if (imageUri) {
        formData.append('media', {
          uri: imageUri,
          type: 'image/jpeg',
          name: 'photo.jpg',
        } as unknown as Blob);
      }
      await postService.createPost(formData);
      queryClient.invalidateQueries({ queryKey: FEED_QUERY_KEY });
      setImageUri(null);
      router.replace('/(tabs)/home');
    } finally {
      setSaving(false);
    }
  };

  const theme = colors.light;

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Controller
        control={control}
        name="content"
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            placeholder="What's on your mind?"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            multiline
            numberOfLines={4}
            style={styles.input}
          />
        )}
      />
      {imageUri ? (
        <View style={styles.previewRow}>
          <Button title="Remove photo" variant="ghost" onPress={() => setImageUri(null)} style={styles.smallBtn} />
        </View>
      ) : (
        <Button title="Add photo" variant="outline" onPress={pickImage} style={styles.addPhotoBtn} />
      )}
      <Button
        title={saving ? 'Posting…' : 'Post'}
        onPress={handleSubmit(onSubmit)}
        loading={saving}
        style={styles.postBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  input: { minHeight: 100 },
  addPhotoBtn: { marginTop: spacing.sm },
  previewRow: { marginTop: spacing.sm },
  smallBtn: {},
  postBtn: { marginTop: spacing.xl },
});
