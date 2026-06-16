import { ActionIcon, Card, Center, Group, Text } from '@mantine/core';
import { IconHeart, IconHeartFilled } from '@tabler/icons-react';
import { artworkUrl, formatName, padId } from '../constants.js';
import TypeBadge from './TypeBadge.jsx';

export default function PokemonCard({ pokemon, isFavorite, onToggleFavorite, onSelect }) {
  const { id, name, types, sprites } = pokemon;
  const art = sprites?.other?.['official-artwork']?.front_default || artworkUrl(id);
  const fallback = sprites?.front_default;
  const open = () => onSelect(pokemon);

  return (
    <Card
      data-card
      withBorder
      radius="lg"
      padding="lg"
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      }}
      aria-label={`View details for ${formatName(name)}`}
      style={{ cursor: 'pointer' }}
    >
      <Group justify="space-between" align="center" mb="xs" wrap="nowrap">
        <Text size="xs" fw={800} c="dimmed" lts="0.05em">
          {padId(id)}
        </Text>
        <ActionIcon
          variant={isFavorite ? 'light' : 'subtle'}
          color={isFavorite ? 'pokeRed' : 'gray'}
          radius="xl"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(id);
          }}
          onKeyDown={(e) => e.stopPropagation()}
          aria-label={
            isFavorite
              ? `Remove ${formatName(name)} from favorites`
              : `Add ${formatName(name)} to favorites`
          }
          aria-pressed={isFavorite}
        >
          {isFavorite ? <IconHeartFilled size={18} /> : <IconHeart size={18} />}
        </ActionIcon>
      </Group>

      <Center>
        <div className="artCircle" style={{ width: 132, height: 132 }}>
          <img
            className="spriteImg"
            src={art}
            alt=""
            loading="lazy"
            width="96"
            height="96"
            draggable="false"
            onError={(e) => {
              if (fallback && e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
            }}
          />
        </div>
      </Center>

      <Text ta="center" fw={800} fz="lg" mt="sm" mb="xs">
        {formatName(name)}
      </Text>
      <Group justify="center" gap={6}>
        {types.map((t) => (
          <TypeBadge key={t.type.name} type={t.type.name} />
        ))}
      </Group>
    </Card>
  );
}
