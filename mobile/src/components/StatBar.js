import { Text, View } from 'react-native';
import { useTheme } from '../theme.js';

function statColor(value) {
  if (value >= 115) return '#37b6a8';
  if (value >= 85) return '#5cb85c';
  if (value >= 55) return '#f0ad4e';
  return '#ef6b5e';
}

export default function StatBar({ label, value }) {
  const { colors } = useTheme();
  // 180 ≈ a very high base stat; anything beyond just fills the bar
  const pct = Math.min(100, Math.round((value / 180) * 100));
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Text style={{ width: 60, fontSize: 13, fontWeight: '700', color: colors.dimmed }}>{label}</Text>
      <Text style={{ width: 30, textAlign: 'right', fontSize: 13, fontWeight: '800', color: colors.text }}>
        {value}
      </Text>
      <View
        style={{
          flex: 1,
          height: 12,
          borderRadius: 999,
          backgroundColor: colors.border,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            width: `${pct}%`,
            height: '100%',
            borderRadius: 999,
            backgroundColor: statColor(value),
          }}
        />
      </View>
    </View>
  );
}
