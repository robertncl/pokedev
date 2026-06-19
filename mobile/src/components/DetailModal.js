import { useEffect, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { fetchEvolutionChain, fetchSpecies } from '../api.js';
import { artworkUrl, formatName, padId, shinyArtworkUrl, STAT_LABELS } from '../constants.js';
import { useTheme } from '../theme.js';
import EvolutionChain from './EvolutionChain.js';
import StatBar from './StatBar.js';
import TypeBadge from './TypeBadge.js';

function IconBtn({ name, color, active, onPress, label, colors }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      accessibilityLabel={label}
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: active ? (color || colors.accent) + '22' : colors.surfaceAlt,
      }}
    >
      <MaterialCommunityIcons name={name} size={20} color={active ? color || colors.accent : colors.dimmed} />
    </Pressable>
  );
}

export default function DetailModal({ pokemon, isFavorite, onToggleFavorite, onClose, onNavigate }) {
  const { colors } = useTheme();
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

  const sectionTitle = (t) => (
    <Text
      style={{
        textTransform: 'uppercase',
        fontWeight: '800',
        color: colors.dimmed,
        fontSize: 12,
        letterSpacing: 1,
        marginBottom: 10,
        marginTop: 4,
      }}
    >
      {t}
    </Text>
  );

  return (
    <Modal visible animationType="slide" transparent onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: colors.overlay, justifyContent: 'flex-end' }}>
        {/* tap outside to dismiss */}
        <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Close details" />
        <View
          style={{
            backgroundColor: colors.bg,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            maxHeight: '92%',
          }}
        >
          <View
            style={{
              alignSelf: 'center',
              width: 40,
              height: 5,
              borderRadius: 3,
              backgroundColor: colors.border,
              marginVertical: 10,
            }}
          />
          <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: 32 }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: 14,
              }}
            >
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={{ color: colors.dimmed, fontWeight: '800', fontSize: 13 }}>{padId(pokemon.id)}</Text>
                <Text style={{ color: colors.text, fontWeight: '800', fontSize: 26 }}>{formatName(pokemon.name)}</Text>
                {genus ? <Text style={{ color: colors.dimmed, fontWeight: '600' }}>{genus}</Text> : null}
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <IconBtn name="star-four-points" color="#f6b93b" active={shiny} onPress={() => setShiny((s) => !s)} label="Toggle shiny artwork" colors={colors} />
                <IconBtn name={isFavorite ? 'heart' : 'heart-outline'} color={colors.accent} active={isFavorite} onPress={() => onToggleFavorite(pokemon.id)} label="Toggle favorite" colors={colors} />
                <IconBtn name="close" onPress={onClose} label="Close details" colors={colors} />
              </View>
            </View>

            <View style={{ alignItems: 'center', marginBottom: 16 }}>
              <View
                style={{
                  width: 220,
                  height: 220,
                  borderRadius: 110,
                  backgroundColor: colors.dish,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image source={{ uri: art }} style={{ width: 170, height: 170 }} resizeMode="contain" />
              </View>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                {pokemon.types.map((t) => (
                  <TypeBadge key={t.type.name} type={t.type.name} size="md" />
                ))}
              </View>
              <Text style={{ color: colors.dimmed, textAlign: 'center', marginTop: 12, lineHeight: 21, fontSize: 14 }}>
                {species ? flavor || 'No Pokédex entry available.' : 'Loading Pokédex entry…'}
              </Text>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
              {[
                ['Height', `${(pokemon.height / 10).toFixed(1)} m`],
                ['Weight', `${(pokemon.weight / 10).toFixed(1)} kg`],
                ['Base XP', String(pokemon.base_experience ?? '—')],
              ].map(([label, value]) => (
                <View
                  key={label}
                  style={{
                    flex: 1,
                    backgroundColor: colors.surface,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: colors.border,
                    padding: 12,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontSize: 11, textTransform: 'uppercase', fontWeight: '800', color: colors.dimmed, letterSpacing: 0.5 }}>
                    {label}
                  </Text>
                  <Text style={{ fontWeight: '800', fontSize: 16, color: colors.text, marginTop: 2 }}>{value}</Text>
                </View>
              ))}
            </View>

            {sectionTitle('Abilities')}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
              {pokemon.abilities.map((a) => (
                <View
                  key={`${a.ability.name}-${a.slot}`}
                  style={{
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 10,
                    paddingVertical: 8,
                    paddingHorizontal: 14,
                  }}
                >
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 13 }}>
                    {formatName(a.ability.name)}
                    {a.is_hidden ? <Text style={{ color: colors.dimmed, fontSize: 11 }}>{'  ·  hidden'}</Text> : null}
                  </Text>
                </View>
              ))}
            </View>

            {sectionTitle('Base Stats')}
            <View style={{ gap: 10 }}>
              {pokemon.stats.map((s) => (
                <StatBar key={s.stat.name} label={STAT_LABELS[s.stat.name] || formatName(s.stat.name)} value={s.base_stat} />
              ))}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 2 }}>
                <Text style={{ width: 60, fontSize: 13, fontWeight: '800', color: colors.text }}>Total</Text>
                <Text style={{ width: 30, textAlign: 'right', fontSize: 13, fontWeight: '800', color: colors.accent }}>{total}</Text>
                <View style={{ flex: 1 }} />
              </View>
            </View>

            <View style={{ marginTop: 22 }}>
              {sectionTitle('Evolution Chain')}
              {chain === undefined && <Text style={{ color: colors.dimmed }}>Loading evolution chain…</Text>}
              {chain === null && <Text style={{ color: colors.dimmed }}>No evolution data available.</Text>}
              {chain && <EvolutionChain chain={chain} currentId={pokemon.id} onNavigate={onNavigate} />}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
