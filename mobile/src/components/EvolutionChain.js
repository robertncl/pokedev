import { Fragment } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { idFromUrl } from '../api.js';
import { artworkUrl, formatName } from '../constants.js';
import { useTheme } from '../theme.js';

// Flatten the recursive chain into stages: [[base], [stage 2...], [stage 3...]]
function flattenChain(root) {
  const levels = [];
  let frontier = [root];
  while (frontier.length > 0) {
    levels.push(frontier.map((node) => ({ name: node.species.name, id: idFromUrl(node.species.url) })));
    frontier = frontier.flatMap((node) => node.evolves_to);
  }
  return levels;
}

export default function EvolutionChain({ chain, currentId, onNavigate }) {
  const { colors } = useTheme();
  const levels = flattenChain(chain);
  if (levels.length < 2) {
    return <Text style={{ color: colors.dimmed }}>This Pokémon does not evolve.</Text>;
  }
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
      {levels.map((group, i) => (
        <Fragment key={i}>
          {i > 0 && <MaterialCommunityIcons name="chevron-right" size={22} color={colors.dimmed} />}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {group.map((stage) => {
              const isCurrent = stage.id === currentId;
              return (
                <Pressable
                  key={stage.id}
                  disabled={isCurrent}
                  onPress={() => onNavigate(stage.id)}
                  accessibilityLabel={
                    isCurrent ? `${formatName(stage.name)} (current)` : `View ${formatName(stage.name)}`
                  }
                  style={{
                    alignItems: 'center',
                    padding: 8,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: isCurrent ? colors.accent + '22' : colors.surface,
                  }}
                >
                  <View
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                      backgroundColor: colors.dish,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Image source={{ uri: artworkUrl(stage.id) }} style={{ width: 50, height: 50 }} resizeMode="contain" />
                  </View>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      marginTop: 4,
                      color: isCurrent ? colors.text : colors.dimmed,
                    }}
                  >
                    {formatName(stage.name)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Fragment>
      ))}
    </View>
  );
}
