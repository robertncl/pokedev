import { Pressable } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { RADIUS, useTheme } from '../theme.js';

// Square icon button: `secondary` is bordered and raised, `ghost` is bare.
// `selected` marks a toggle that is on (Blue on its soft tint). A press is a
// color step, never a scale.
export default function IconButton({ icon, label, onPress, selected, variant = 'secondary', size = 40, iconSize = 20 }) {
  const { colors } = useTheme();
  const on = selected === true;
  return (
    <Pressable
      onPress={onPress}
      hitSlop={size < 44 ? (44 - size) / 2 : undefined}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={selected === undefined ? undefined : { selected: on }}
      style={({ pressed }) => ({
        width: size,
        height: size,
        borderRadius: RADIUS.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: variant === 'ghost' && !on ? 0 : 1,
        borderColor: on ? colors.selectedBorder : colors.borderControl,
        backgroundColor: on
          ? colors.selectedSoft
          : pressed
            ? colors.surfaceHover
            : variant === 'ghost'
              ? 'transparent'
              : colors.surfaceRaised,
        boxShadow: variant === 'ghost' || on ? undefined : colors.shadowSm,
      })}
    >
      <MaterialCommunityIcons name={icon} size={iconSize} color={on ? colors.selected : colors.textMuted} />
    </Pressable>
  );
}
