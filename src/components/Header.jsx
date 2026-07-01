import {
  ActionIcon,
  Box,
  Group,
  Indicator,
  TextInput,
  Text,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import { IconHeart, IconHeartFilled, IconMoon, IconSearch, IconSun, IconX } from '@tabler/icons-react';
import Pokeball from './Pokeball.jsx';

export default function Header({
  search,
  onSearchChange,
  searchRef,
  showFavorites,
  onToggleFavorites,
  favoriteCount,
}) {
  const { setColorScheme } = useMantineColorScheme();
  const computed = useComputedColorScheme('light', { getInitialValueInEffect: true });
  const toggleScheme = () => setColorScheme(computed === 'dark' ? 'light' : 'dark');

  return (
    <Group justify="space-between" align="center" wrap="wrap" gap="md" mb="lg">
      <Group gap="sm" wrap="nowrap">
        <Pokeball size={42} />
        <Box>
          <Title order={1} fz={26} lh={1.1}>
            Poké
            <Text span inherit c="pokeRed">
              Dev
            </Text>
          </Title>
          <Text size="xs" c="dimmed" fw={700} tt="uppercase" style={{ letterSpacing: '0.12em' }}>
            Modern Pokédex
          </Text>
        </Box>
      </Group>

      <TextInput
        ref={searchRef}
        value={search}
        onChange={(e) => onSearchChange(e.currentTarget.value)}
        placeholder="Search name or number…"
        aria-label="Search Pokémon by name or number"
        size="md"
        radius="xl"
        leftSection={<IconSearch size={18} />}
        rightSection={
          search ? (
            <ActionIcon
              className="pressable"
              variant="subtle"
              color="gray"
              radius="xl"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
            >
              <IconX size={16} />
            </ActionIcon>
          ) : null
        }
        style={{ flex: '1 1 280px', maxWidth: 520 }}
      />

      <Group gap="xs" wrap="nowrap">
        <Indicator label={favoriteCount} size={18} disabled={favoriteCount === 0} color="pokeRed" offset={4}>
          <ActionIcon
            className="pressable"
            variant={showFavorites ? 'filled' : 'default'}
            color="pokeRed"
            size="lg"
            radius="xl"
            onClick={onToggleFavorites}
            aria-pressed={showFavorites}
            title={showFavorites ? 'Show all Pokémon' : 'Show favorites only'}
          >
            {showFavorites ? <IconHeartFilled size={20} /> : <IconHeart size={20} />}
          </ActionIcon>
        </Indicator>
        <ActionIcon
          className="pressable"
          variant="default"
          size="lg"
          radius="xl"
          onClick={toggleScheme}
          aria-label="Toggle color scheme"
          title="Toggle light/dark theme"
        >
          {computed === 'dark' ? <IconSun size={20} /> : <IconMoon size={20} />}
        </ActionIcon>
      </Group>
    </Group>
  );
}
