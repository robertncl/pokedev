import { Text, View } from 'react-native';
import { formatName, TYPE_COLORS } from '../constants.js';
import { font, RADIUS, TEXT, useTheme } from '../theme.js';

// A neutral badge: the name carries the type, the dot only speeds scanning.
export default function TypeBadge({ type, size = 'sm' }) {
  const { colors } = useTheme();
  const md = size === 'md';
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        height: md ? 28 : 22,
        paddingHorizontal: md ? 10 : 8,
        borderRadius: RADIUS.sm,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.surfaceHover,
      }}
    >
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: TYPE_COLORS[type] || '#9aa0b5' }} />
      <Text style={{ ...font(500), fontSize: md ? TEXT.sm : TEXT.xs, color: colors.text }}>{formatName(type)}</Text>
    </View>
  );
}
