import { useEffect, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchEvolutionChain, fetchSpecies } from '../api.js';
import { artworkUrl, formatName, padId, shinyArtworkUrl, STAT_LABELS } from '../constants.js';
import { font, FONTS, RADIUS, SPACE, TEXT, useTheme } from '../theme.js';
import EvolutionChain from './EvolutionChain.js';
import IconButton from './IconButton.js';
import StatBar from './StatBar.js';
import TypeBadge from './TypeBadge.js';

export default function DetailModal({ pokemon, isFavorite, onToggleFavorite, onClose, onNavigate }) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [species, setSpecies] = useState(null);
  // chain: undefined = loading, null = unavailable, object = loaded
  const [chain, setChain] = useState(undefined);
  const [shiny, setShiny] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setSpecies(null);
    setChain(undefined);
    setShiny(false);
    fetchSpecies(pokemon.species.url)
      .then((sp) => {
        if (cancelled) return;
        setSpecies(sp);
        if (!sp.evolution_chain?.url) {
          setChain(null);
          return;
        }
        return fetchEvolutionChain(sp.evolution_chain.url).then((evo) => {
          if (!cancelled) setChain(evo.chain);
        });
      })
      .catch(() => {
        if (!cancelled) setChain(null);
      });
    return () => {
      cancelled = true;
    };
  }, [pokemon]);

  const art = shiny
    ? pokemon.sprites?.other?.['official-artwork']?.front_shiny || shinyArtworkUrl(pokemon.id)
    : pokemon.sprites?.other?.['official-artwork']?.front_default || artworkUrl(pokemon.id);

  const flavor = species
    ? (
        [...species.flavor_text_entries].reverse().find((f) => f.language.name === 'en')?.flavor_text || ''
      )
        .replace(/\s+/g, ' ')
        .trim()
    : '';
  const genus = species?.genera?.find((g) => g.language.name === 'en')?.genus;
  const total = pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);
  const best = Math.max(...pokemon.stats.map((s) => s.base_stat));
  const bestIndex = pokemon.stats.findIndex((s) => s.base_stat === best);

  const muted = { ...font(400), fontSize: TEXT.sm, color: colors.textMuted };
  const sectionTitle = (t) => (
    <Text style={{ ...font(600), fontSize: TEXT.md, letterSpacing: -0.18, color: colors.text, marginBottom: SPACE[3] }}>
      {t}
    </Text>
  );

  const facts = [
    ['Height', `${(pokemon.height / 10).toFixed(1)} m`],
    ['Weight', `${(pokemon.weight / 10).toFixed(1)} kg`],
    ['Base XP', String(pokemon.base_experience ?? '—')],
  ];

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: colors.scrim, justifyContent: 'flex-end' }}>
        {/* tap outside to dismiss */}
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Close details" />
        <View
          style={{
            backgroundColor: colors.surfaceRaised,
            borderTopLeftRadius: RADIUS.xl,
            borderTopRightRadius: RADIUS.xl,
            borderWidth: 1,
            borderBottomWidth: 0,
            borderColor: colors.border,
            boxShadow: colors.shadowLg,
            maxHeight: '92%',
          }}
        >
          <View
            style={{
              alignSelf: 'center',
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: colors.borderControl,
              marginVertical: SPACE[2],
            }}
          />
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: SPACE[5], paddingBottom: SPACE[8] + insets.bottom, gap: SPACE[6] }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: SPACE[3] }}>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontFamily: FONTS.mono, fontSize: TEXT.sm, color: colors.textSubtle }}>{padId(pokemon.id)}</Text>
                <Text style={{ ...font(600), fontSize: TEXT['2xl'], letterSpacing: -0.48, color: colors.text }}>
                  {formatName(pokemon.name)}
                </Text>
                {genus ? <Text style={muted}>{genus}</Text> : null}
              </View>
              <View style={{ flexDirection: 'row', gap: SPACE[2] }}>
                <IconButton icon="star-four-points" label="Toggle shiny artwork" selected={shiny} onPress={() => setShiny((s) => !s)} />
                <IconButton
                  icon={isFavorite ? 'heart' : 'heart-outline'}
                  label="Toggle favorite"
                  selected={isFavorite}
                  onPress={() => onToggleFavorite(pokemon.id)}
                />
                <IconButton icon="close" label="Close details" onPress={onClose} />
              </View>
            </View>

            <View style={{ alignItems: 'center', gap: SPACE[4] }}>
              <View
                style={{
                  width: '100%',
                  maxWidth: 320,
                  aspectRatio: 1,
                  borderRadius: RADIUS.lg,
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image source={{ uri: art }} style={{ width: '78%', height: '78%' }} resizeMode="contain" />
              </View>
              <View style={{ flexDirection: 'row', gap: SPACE[2] }}>
                {pokemon.types.map((t) => (
                  <TypeBadge key={t.type.name} type={t.type.name} size="md" />
                ))}
              </View>
              <Text style={{ ...muted, textAlign: 'center', lineHeight: 21 }}>
                {species ? flavor || 'No Pokédex entry available.' : 'Loading Pokédex entry…'}
              </Text>
            </View>

            <View
              style={{
                flexDirection: 'row',
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: RADIUS.lg,
                backgroundColor: colors.surface,
              }}
            >
              {facts.map(([label, value], i) => (
                <View
                  key={label}
                  style={{
                    flex: 1,
                    paddingVertical: SPACE[3],
                    paddingHorizontal: SPACE[4],
                    borderLeftWidth: i ? 1 : 0,
                    borderLeftColor: colors.border,
                  }}
                >
                  <Text style={{ ...font(500), fontSize: TEXT.xs, color: colors.textMuted }}>{label}</Text>
                  <Text
                    style={{ ...font(600), fontSize: TEXT.lg, color: colors.text, fontVariant: ['tabular-nums'] }}
                    numberOfLines={1}
                  >
                    {value}
                  </Text>
                </View>
              ))}
            </View>

            <View>
              {sectionTitle('Abilities')}
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACE[2] }}>
                {pokemon.abilities.map((a) => (
                  <View
                    key={`${a.ability.name}-${a.slot}`}
                    style={{
                      justifyContent: 'center',
                      height: 28,
                      paddingHorizontal: SPACE[3],
                      borderRadius: RADIUS.sm,
                      borderWidth: 1,
                      borderColor: colors.border,
                      backgroundColor: colors.surfaceHover,
                    }}
                  >
                    <Text style={{ ...font(500), fontSize: TEXT.sm, color: colors.text }}>
                      {formatName(a.ability.name)}
                      {a.is_hidden ? (
                        <Text style={{ ...font(400), fontSize: TEXT.xs, color: colors.textMuted }}>{' · hidden'}</Text>
                      ) : null}
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            <View>
              {sectionTitle('Base stats')}
              <View style={{ gap: SPACE[3] }}>
                {pokemon.stats.map((s, i) => (
                  <StatBar
                    key={s.stat.name}
                    label={STAT_LABELS[s.stat.name] || formatName(s.stat.name)}
                    value={s.base_stat}
                    highlight={i === bestIndex}
                  />
                ))}
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingTop: SPACE[3],
                    borderTopWidth: 1,
                    borderTopColor: colors.border,
                  }}
                >
                  <Text style={{ ...font(600), width: 60, fontSize: TEXT.sm, color: colors.text }}>Total</Text>
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
                    {total}
                  </Text>
                </View>
              </View>
            </View>

            <View>
              {sectionTitle('Evolution chain')}
              {chain === undefined && <Text style={muted}>Loading evolution chain…</Text>}
              {chain === null && <Text style={muted}>No evolution data available.</Text>}
              {chain && <EvolutionChain chain={chain} currentId={pokemon.id} onNavigate={onNavigate} />}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
