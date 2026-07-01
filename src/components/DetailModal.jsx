import { useEffect, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Card,
  Grid,
  Group,
  Modal,
  ScrollArea,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconHeart, IconHeartFilled, IconSparkles, IconX } from '@tabler/icons-react';
import { fetchEvolutionChain, fetchSpecies } from '../api.js';
import { artworkUrl, formatName, padId, shinyArtworkUrl, STAT_LABELS } from '../constants.js';
import { useTilt } from '../hooks.js';
import EvolutionChain from './EvolutionChain.jsx';
import StatBar from './StatBar.jsx';
import TypeBadge from './TypeBadge.jsx';

function SectionTitle({ children }) {
  return (
    <Text tt="uppercase" fw={800} c="dimmed" size="sm" mb="sm" style={{ letterSpacing: '0.12em' }}>
      {children}
    </Text>
  );
}

function Fact({ label, value }) {
  return (
    <Card withBorder radius="md" padding="sm" ta="center">
      <Text size="xs" tt="uppercase" fw={800} c="dimmed" style={{ letterSpacing: '0.08em' }}>
        {label}
      </Text>
      <Text fw={800} fz="lg">
        {value}
      </Text>
    </Card>
  );
}

export default function DetailModal({ pokemon, isFavorite, onToggleFavorite, onClose, onNavigate }) {
  const [species, setSpecies] = useState(null);
  // chain: undefined = loading, null = unavailable, object = loaded
  const [chain, setChain] = useState(undefined);
  const [shiny, setShiny] = useState(false);
  const tiltRef = useTilt();

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
    ? ([...species.flavor_text_entries].reverse().find((f) => f.language.name === 'en')?.flavor_text || '')
        .replace(/\s+/g, ' ')
        .trim()
    : '';
  const genus = species?.genera?.find((g) => g.language.name === 'en')?.genus;
  const total = pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);

  return (
    <Modal
      opened
      onClose={onClose}
      size="xl"
      radius="lg"
      centered
      padding="lg"
      withCloseButton={false}
      overlayProps={{ backgroundOpacity: 0.55, blur: 4 }}
      scrollAreaComponent={ScrollArea.Autosize}
      transitionProps={{ transition: 'pop', duration: 300, timingFunction: 'var(--ease-spring)' }}
      aria-label={`${formatName(pokemon.name)} details`}
    >
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Group gap="xs" align="baseline" wrap="wrap" style={{ rowGap: 4 }}>
            <Text size="sm" fw={800} c="dimmed">
              {padId(pokemon.id)}
            </Text>
            <Title order={2} fz={{ base: 24, sm: 30 }}>
              {formatName(pokemon.name)}
            </Title>
            {genus && (
              <Text c="dimmed" fw={600}>
                {genus}
              </Text>
            )}
          </Group>
          <Group gap="xs" wrap="nowrap">
            <Tooltip label={shiny ? 'Show regular artwork' : 'Show shiny artwork'} withArrow>
              <ActionIcon
                className="pressable"
                variant={shiny ? 'filled' : 'default'}
                color="yellow"
                size="lg"
                radius="xl"
                onClick={() => setShiny((s) => !s)}
                aria-pressed={shiny}
                aria-label="Toggle shiny artwork"
              >
                <IconSparkles size={18} />
              </ActionIcon>
            </Tooltip>
            <ActionIcon
              className="pressable"
              variant={isFavorite ? 'filled' : 'default'}
              color="pokeRed"
              size="lg"
              radius="xl"
              onClick={() => onToggleFavorite(pokemon.id)}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              {isFavorite ? <IconHeartFilled size={18} /> : <IconHeart size={18} />}
            </ActionIcon>
            <ActionIcon className="pressable" variant="default" size="lg" radius="xl" onClick={onClose} aria-label="Close details">
              <IconX size={18} />
            </ActionIcon>
          </Group>
        </Group>

        <Grid gutter="xl" align="flex-start">
          <Grid.Col span={{ base: 12, sm: 5 }}>
            <Stack align="center" gap="md">
              <div
                data-card
                ref={tiltRef}
                style={{ width: 260, maxWidth: '72vw', aspectRatio: 1, borderRadius: '50%' }}
              >
                <div className="artCircle" style={{ width: '100%', height: '100%' }}>
                  <img
                    key={art}
                    className="spriteImg"
                    src={art}
                    alt={formatName(pokemon.name)}
                    onError={() => {
                      if (shiny) setShiny(false);
                    }}
                  />
                </div>
              </div>
              <Group justify="center" gap={6}>
                {pokemon.types.map((t) => (
                  <TypeBadge key={t.type.name} type={t.type.name} size="md" />
                ))}
              </Group>
              <Text c="dimmed" ta="center" size="sm" lh={1.6} maw={340}>
                {species ? flavor || 'No Pokédex entry available.' : 'Loading Pokédex entry…'}
              </Text>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 7 }}>
            <SimpleGrid cols={3} spacing="sm" mb="lg">
              <Fact label="Height" value={`${(pokemon.height / 10).toFixed(1)} m`} />
              <Fact label="Weight" value={`${(pokemon.weight / 10).toFixed(1)} kg`} />
              <Fact label="Base XP" value={pokemon.base_experience ?? '—'} />
            </SimpleGrid>

            <SectionTitle>Abilities</SectionTitle>
            <Group gap="xs" mb="lg">
              {pokemon.abilities.map((a) => (
                <Badge
                  key={`${a.ability.name}-${a.slot}`}
                  variant="default"
                  size="lg"
                  radius="sm"
                  fw={700}
                  style={{ textTransform: 'none' }}
                >
                  {formatName(a.ability.name)}
                  {a.is_hidden && (
                    <Text span c="dimmed" fz="xs">
                      {' '}
                      · hidden
                    </Text>
                  )}
                </Badge>
              ))}
            </Group>

            <SectionTitle>Base Stats</SectionTitle>
            <Stack gap="sm">
              {pokemon.stats.map((s) => (
                <StatBar
                  key={s.stat.name}
                  label={STAT_LABELS[s.stat.name] || formatName(s.stat.name)}
                  value={s.base_stat}
                />
              ))}
              <Group gap="sm" wrap="nowrap" mt={4}>
                <Text w={64} size="sm" fw={800}>
                  Total
                </Text>
                <Text w={32} ta="right" size="sm" fw={800} c="pokeRed" ff="monospace">
                  {total}
                </Text>
                <Box style={{ flex: 1 }} />
              </Group>
            </Stack>
          </Grid.Col>
        </Grid>

        <Box>
          <SectionTitle>Evolution Chain</SectionTitle>
          {chain === undefined && (
            <Text c="dimmed" size="sm">
              Loading evolution chain…
            </Text>
          )}
          {chain === null && (
            <Text c="dimmed" size="sm">
              No evolution data available.
            </Text>
          )}
          {chain && <EvolutionChain chain={chain} currentId={pokemon.id} onNavigate={onNavigate} />}
        </Box>
      </Stack>
    </Modal>
  );
}
