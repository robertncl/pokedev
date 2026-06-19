import { Text, View } from 'react-native';
import { formatName, TYPE_COLORS } from '../constants.js';

export default function TypeBadge({ type, size = 'sm' }) {
  const bg = TYPE_COLORS[type] || '#9aa0b5';
  const pad =
    size === 'md'
      ? { paddingVertical: 5, paddingHorizontal: 12 }
      : { paddingVertical: 3, paddingHorizontal: 9 };
  const fontSize = size === 'md' ? 12 : 10.5;
  return (
    <View style={[{ backgroundColor: bg, borderRadius: 999 }, pad]}>
      <Text
        style={{
          color: '#fff',
          fontWeight: '800',
          fontSize,
          letterSpacing: 0.5,
          textTransform: 'uppercase',
        }}
      >
        {formatName(type)}
      </Text>
    </View>
  );
}
