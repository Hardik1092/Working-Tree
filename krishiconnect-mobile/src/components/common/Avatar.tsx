import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { colors } from '@/theme/colors';
import { spacing } from '@/theme/spacing';

const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop';

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: number;
}

export function Avatar({ uri, name, size = 40 }: AvatarProps) {
  const theme = colors.light;
  const source = uri || DEFAULT_AVATAR;

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Image
        source={{ uri: typeof source === 'string' ? source : (source as { url?: string })?.url ?? DEFAULT_AVATAR }}
        style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]}
        resizeMode="cover"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { borderRadius: 9999, overflow: 'hidden' },
  image: { overflow: 'hidden' },
});
