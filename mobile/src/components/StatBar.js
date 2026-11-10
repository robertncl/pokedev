import { Text, View } from 'react-native';
import { font, TEXT, useTheme } from '../theme.js';

// Every bar is neutral; `highlight` marks the one takeaway (the best stat).
export default function StatBar({ label, value, highlight = false }) {
  const { colors } = useTheme();
  // 180 ≈ a very high base stat; anything beyond just fills the bar
  const pct = Math.min(100, Math.round((value / 180) * 100));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Text style={{ ...font(400), width: 60, fontSize: TEXT.sm, color: colors.textMuted }}>{label}</Text>
      <Text
        style={{
          ...font(600),
          width: 32,
          textAlign: 'right',
          fontSize: TEXT.sm,
          color: colors.text,
          fontVariant: ['tabular-nums'],
        }}
      >
        {value}
      </Text>
      <View style={{ flex: 1, height: 8, borderRadius: 2, backgroundColor: colors.surfaceHover, overflow: 'hidden' }}>
        <View
          testID="stat-fill"
          style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: 2,
            backgroundColor: highlight ? colors.dataHighlight : colors.data,
          }}
        />
      </View>
    </View>
  );
}
