import { View } from 'react-native';
import { useTheme } from '../theme.js';

export default function SkeletonCard() {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 14,
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 116,
          height: 116,
          borderRadius: 58,
          backgroundColor: colors.dish,
          marginVertical: 8,
        }}
      />
      <View style={{ width: '60%', height: 12, borderRadius: 999, backgroundColor: colors.border, marginTop: 8 }} />
      <View style={{ width: '80%', height: 16, borderRadius: 999, backgroundColor: colors.border, marginTop: 8 }} />
    </View>
  );
}
