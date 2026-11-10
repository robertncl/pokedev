import { Image, Pressable, Text, View } from 'react-native';
import { artworkUrl, formatName, padId } from '../constants.js';
import { font, FONTS, RADIUS, SPACE, TEXT, useTheme } from '../theme.js';
import IconButton from './IconButton.js';
import TypeBadge from './TypeBadge.js';

export default function PokemonCard({ pokemon, isFavorite, onToggleFavorite, onPress }) {
  const { colors } = useTheme();
  const { id, name, types, sprites } = pokemon;
  const label = formatName(name);
  const art = sprites?.other?.['official-artwork']?.front_default || artworkUrl(id);

  // The favorite button is a sibling laid over the card, not a child of it:
  // a control nested in an accessible button can't be reached by VoiceOver.
  return (
    <View style={{ flex: 1 }}>
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={`View details for ${label}`}
        style={({ pressed }) => ({
          flex: 1,
          overflow: 'hidden',
          backgroundColor: colors.surfaceRaised,
          borderRadius: RADIUS.lg,
          borderWidth: 1,
          borderColor: pressed ? colors.borderControl : colors.border,
          boxShadow: pressed ? colors.shadowMd : colors.shadowSm,
        })}
      >
        <View
          style={{
            aspectRatio: 4 / 3,
            backgroundColor: colors.surface,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Image source={{ uri: art }} style={{ width: '72%', height: '88%' }} resizeMode="contain" />
        </View>

        <View style={{ padding: SPACE[3], gap: SPACE[2] }}>
          <Text style={{ ...font(600), fontSize: TEXT.md, letterSpacing: -0.18, color: colors.text }} numberOfLines={1}>
            {label}
          </Text>
          <Text style={{ fontFamily: FONTS.mono, fontSize: TEXT.xs, color: colors.textSubtle }}>{padId(id)}</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACE[1] }}>
            {types.map((t) => (
              <TypeBadge key={t.type.name} type={t.type.name} />
            ))}
          </View>
        </View>
      </Pressable>

      <View style={{ position: 'absolute', top: SPACE[1], right: SPACE[1] }}>
        <IconButton
          icon={isFavorite ? 'heart' : 'heart-outline'}
          label={isFavorite ? `Remove ${label} from favorites` : `Add ${label} to favorites`}
          selected={isFavorite}
          variant="ghost"
          size={36}
          iconSize={18}
          onPress={() => onToggleFavorite(id)}
        />
      </View>
    </View>
  );
}
