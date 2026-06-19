import { Pressable, ScrollView, Text, View } from 'react-native';
import { formatName, TYPE_COLORS, TYPES } from '../constants.js';
import { useTheme } from '../theme.js';

export default function TypeFilter({ selected, onSelect }) {
  const { colors } = useTheme();

  const chip = (key, label, color, active) => (
    <Pressable
      key={key || 'all'}
      onPress={() => onSelect(key)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 999,
        borderWidth: 1,
        marginRight: 8,
        borderColor: active ? color || colors.accent : colors.border,
        backgroundColor: active ? (color ? color + '22' : colors.accent + '22') : colors.surface,
      }}
    >
      {color ? <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: color }} /> : null}
      <Text style={{ fontSize: 13, fontWeight: '700', color: active ? colors.text : colors.dimmed }}>
        {label}
      </Text>
    </Pressable>
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 4 }}
    >
      {chip('', 'All', null, selected === '')}
      {TYPES.map((t) => chip(t, formatName(t), TYPE_COLORS[t], selected === t))}
    </ScrollView>
  );
}
