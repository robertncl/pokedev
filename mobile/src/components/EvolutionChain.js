import { Fragment } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { idFromUrl } from '../api.js';
import { artworkUrl, formatName } from '../constants.js';
import { font, RADIUS, SPACE, TEXT, useTheme } from '../theme.js';

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
    return <Text style={{ ...font(400), fontSize: TEXT.sm, color: colors.textMuted }}>This Pokémon does not evolve.</Text>;
  }
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: SPACE[2] }}>
      {levels.map((group, i) => (
        <Fragment key={i}>
          {i > 0 && <MaterialCommunityIcons name="chevron-right" size={20} color={colors.textSubtle} />}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACE[2] }}>
            {group.map((stage) => {
              const isCurrent = stage.id === currentId;
              return (
                <Pressable
                  key={stage.id}
                  disabled={isCurrent}
                  onPress={() => onNavigate(stage.id)}
                  accessibilityRole="button"
                  accessibilityLabel={
                    isCurrent ? `${formatName(stage.name)} (current)` : `View ${formatName(stage.name)}`
                  }
                  style={({ pressed }) => ({
                    alignItems: 'center',
                    gap: SPACE[1],
                    paddingTop: SPACE[2],
                    paddingBottom: SPACE[3],
                    paddingHorizontal: SPACE[2],
                    borderRadius: RADIUS.lg,
                    borderWidth: 1,
                    borderColor: isCurrent ? colors.selectedBorder : pressed ? colors.borderControl : colors.border,
                    backgroundColor: isCurrent ? colors.selectedSoft : colors.surfaceRaised,
                    boxShadow: isCurrent ? undefined : pressed ? colors.shadowMd : colors.shadowSm,
                  })}
                >
                  <Image source={{ uri: artworkUrl(stage.id) }} style={{ width: 60, height: 60 }} resizeMode="contain" />
                  <Text style={{ ...font(500), fontSize: TEXT.xs, color: colors.text }}>{formatName(stage.name)}</Text>
                </Pressable>
              );
            })}
          </View>
        </Fragment>
      ))}
    </View>
  );
}
