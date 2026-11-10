import { Pressable, ScrollView, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { formatName, TYPE_COLORS, TYPES } from '../constants.js';
import { font, RADIUS, SPACE, TEXT, useTheme } from '../theme.js';

export default function TypeFilter({ selected, onSelect }) {
  const { colors } = useTheme();

  const chip = (key, label, color, active) => (
    <Pressable
      key={key || 'all'}
      onPress={() => onSelect(key)}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: SPACE[2],
        height: 36,
        paddingHorizontal: SPACE[3],
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: active ? colors.selectedBorder : colors.borderControl,
        backgroundColor: active ? colors.selectedSoft : pressed ? colors.surfaceHover : colors.surfaceRaised,
      })}
    >
      {active ? (
        <MaterialCommunityIcons name="check" size={16} color={colors.selected} />
      ) : color ? (
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
      ) : null}
      <Text style={{ ...font(500), fontSize: TEXT.sm, color: colors.text }}>{label}</Text>
    </Pressable>
  );

  return (
    <View
      style={{
        marginHorizontal: SPACE[4],
        paddingVertical: SPACE[4],
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: RADIUS.lg,
        backgroundColor: colors.surface,
        gap: SPACE[3],
        overflow: 'hidden',
      }}
    >
      <Text style={{ ...font(500), fontSize: TEXT.sm, color: colors.text, paddingHorizontal: SPACE[4] }}>
        Filter by type
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: SPACE[4], gap: SPACE[2] }}
      >
        {chip('', 'All', null, selected === '')}
        {TYPES.map((t) => chip(t, formatName(t), TYPE_COLORS[t], selected === t))}
      </ScrollView>
    </View>
  );
}
