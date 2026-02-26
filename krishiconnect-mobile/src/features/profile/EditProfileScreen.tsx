import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { View, Text, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { userService } from '@/services/userService';
import { Avatar } from '@/components/common/Avatar';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

interface EditProfileForm {
  name: string;
  bio: string;
}

export function EditProfileScreen() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const theme = colors.light;

  const { control, handleSubmit } = useForm<EditProfileForm>({
    defaultValues: { name: user?.name ?? '', bio: user?.bio ?? '' },
  });

  const avatarUri =
    typeof user?.avatar === 'string'
      ? user.avatar
      : (user?.avatar as { url?: string } | undefined)?.url ??
        (user?.profilePhoto as { url?: string } | undefined)?.url;

  const pickAndUploadAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to photos to change your profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('profilePhoto', {
        uri: asset.uri,
        type: asset.mimeType ?? 'image/jpeg',
        name: asset.fileName ?? 'photo.jpg',
      } as unknown as Blob);
      const updated = await userService.uploadAvatar(formData);
      await setUser(updated);
    } catch (e) {
      Alert.alert('Upload failed', e instanceof Error ? e.message : 'Could not update photo');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: EditProfileForm) => {
    setSaving(true);
    try {
      const updated = await userService.updateProfile({ name: data.name, bio: data.bio || undefined });
      await setUser(updated);
      router.back();
    } catch (e) {
      Alert.alert('Save failed', e instanceof Error ? e.message : 'Could not update profile');
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.avatarRow}>
        <Avatar uri={avatarUri} name={user.name} size={80} />
        <Button
          title={uploading ? 'Uploading…' : 'Change photo'}
          variant="outline"
          onPress={pickAndUploadAvatar}
          disabled={uploading}
          style={styles.changePhotoBtn}
        />
      </View>
      <Controller
        control={control}
        name="name"
        rules={{ required: 'Name is required' }}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <Input
            label="Name"
            placeholder="Your name"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={error?.message}
          />
        )}
      />
      <Controller
        control={control}
        name="bio"
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <Input
            label="Bio"
            placeholder="Short bio (optional)"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={error?.message}
            multiline
          />
        )}
      />
      <Button
        title={saving ? 'Saving…' : 'Save'}
        onPress={handleSubmit(onSubmit)}
        loading={saving}
        style={styles.saveBtn}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  avatarRow: { alignItems: 'center', marginBottom: spacing.lg },
  changePhotoBtn: { marginTop: spacing.sm },
  saveBtn: { marginTop: spacing.lg },
});
