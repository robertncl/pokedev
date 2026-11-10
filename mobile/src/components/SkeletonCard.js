import { View } from 'react-native';
import { RADIUS, SPACE, useTheme } from '../theme.js';

// Same frame as PokemonCard, so the grid doesn't jump when details arrive.
export default function SkeletonCard() {
  const { colors } = useTheme();
  const bar = (width, height) => (
    <View style={{ width, height, borderRadius: RADIUS.sm, backgroundColor: colors.surfaceHover }} />
  );
  return (
    <View
      style={{
        flex: 1,
        overflow: 'hidden',
        backgroundColor: colors.surfaceRaised,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View style={{ aspectRatio: 4 / 3, backgroundColor: colors.surface, borderBottomWidth: 1, borderBottomColor: colors.border }} />
      <View style={{ padding: SPACE[3], gap: SPACE[3] }}>
        {bar('65%', 14)}
        {bar('35%', 10)}
        {bar('50%', 20)}
      </View>
    </View>
  );
}
