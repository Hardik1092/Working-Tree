import React, { useState } from 'react';
import { View, Image, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { postService } from '@/services/postService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/theme/colors';
import { spacing, borderRadius } from '@/theme/spacing';
import { useQueryClient } from '@tanstack/react-query';

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
      queryClient.invalidateQueries({ queryKey: ['feed', 'recent'] });
      queryClient.invalidateQueries({ queryKey: ['feed', 'trending'] });
      setImageUri(null);
      router.replace('/(tabs)/home');
    } finally {
      setSaving(false);
    }
  };

  const theme = colors.light;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 16 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.section}>
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
          </View>

          <View style={styles.section}>
            {imageUri ? (
              <>
                <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
                <Button
                  title="Remove photo"
                  variant="ghost"
                  onPress={() => setImageUri(null)}
                  style={styles.removePhotoBtn}
                />
              </>
            ) : (
              <Button title="Add photo" variant="outline" onPress={pickImage} style={styles.addPhotoBtn} />
            )}
          </View>

          <View style={styles.section}>
            <Button
              title={saving ? 'Posting…' : 'Post'}
              onPress={handleSubmit(onSubmit)}
              loading={saving}
              style={styles.postBtn}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  keyboard: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  section: { marginBottom: spacing.lg },
  input: { minHeight: 100 },
  previewImage: {
    width: '100%',
    height: 220,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.light.border,
    marginBottom: spacing.sm,
  },
  addPhotoBtn: {},
  removePhotoBtn: {},
  postBtn: { marginTop: spacing.sm },
});
