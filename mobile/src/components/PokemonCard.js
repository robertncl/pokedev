import { Image, Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { artworkUrl, formatName, padId } from '../constants.js';
import { useTheme } from '../theme.js';
import TypeBadge from './TypeBadge.js';

export default function PokemonCard({ pokemon, isFavorite, onToggleFavorite, onPress }) {
  const { colors } = useTheme();
  const { id, name, types, sprites } = pokemon;
  const art = sprites?.other?.['official-artwork']?.front_default || artworkUrl(id);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${formatName(name)}`}
      style={({ pressed }) => ({
        flex: 1,
        backgroundColor: colors.surface,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: colors.border,
        padding: 14,
        transform: [{ scale: pressed ? 0.98 : 1 }],
      })}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 4,
        }}
      >
        <Text style={{ fontSize: 12, fontWeight: '800', color: colors.dimmed }}>{padId(id)}</Text>
        <Pressable
          hitSlop={10}
          onPress={() => onToggleFavorite(id)}
          accessibilityLabel={isFavorite ? `Remove ${formatName(name)} from favorites` : `Add ${formatName(name)} to favorites`}
        >
          <MaterialCommunityIcons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={20}
            color={isFavorite ? colors.accent : colors.dimmed}
          />
        </Pressable>
      </View>

      <View
        style={{
          alignSelf: 'center',
          width: 116,
          height: 116,
          borderRadius: 58,
          backgroundColor: colors.dish,
          alignItems: 'center',
          justifyContent: 'center',
          marginVertical: 4,
        }}
      >
        <Image source={{ uri: art }} style={{ width: 92, height: 92 }} resizeMode="contain" />
      </View>

      <Text
        style={{
          textAlign: 'center',
          fontWeight: '800',
          fontSize: 15,
          color: colors.text,
          marginTop: 6,
          marginBottom: 8,
        }}
      >
        {formatName(name)}
      </Text>
      <View style={{ flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 6 }}>
        {types.map((t) => (
          <TypeBadge key={t.type.name} type={t.type.name} />
        ))}
      </View>
    </Pressable>
  );
}
