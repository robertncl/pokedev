import { Chip, Group } from '@mantine/core';
import { formatName, TYPE_COLORS, TYPES } from '../constants.js';

export default function TypeFilter({ selected, onSelect }) {
  return (
    <Group justify="center" gap="xs" mb="xl">
      <Chip checked={selected === ''} onClick={() => onSelect('')} variant="light" radius="xl" color="pokeRed">
        All
      </Chip>
      {TYPES.map((type) => (
        <Chip
          key={type}
          checked={selected === type}
          onClick={() => onSelect(type)}
          variant="light"
          radius="xl"
          color={TYPE_COLORS[type]}
        >
          {formatName(type)}
        </Chip>
      ))}
    </Group>
  );
}
