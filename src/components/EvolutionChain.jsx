import { Fragment } from 'react';
import { Group, Stack, Text, UnstyledButton } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { idFromUrl } from '../api.js';
import { artworkUrl, formatName } from '../constants.js';

// Flatten the recursive chain into stages: [[base], [stage 2...], [stage 3...]]
// Branched evolutions (e.g. Eevee) become multiple nodes within one stage.
function flattenChain(root) {
  const levels = [];
  let frontier = [root];
  while (frontier.length > 0) {
    levels.push(
      frontier.map((node) => ({ name: node.species.name, id: idFromUrl(node.species.url) }))
    );
    frontier = frontier.flatMap((node) => node.evolves_to);
  }
  return levels;
}

export default function EvolutionChain({ chain, currentId, onNavigate }) {
  const levels = flattenChain(chain);
  if (levels.length < 2) {
    return (
      <Text c="dimmed" size="sm">
        This Pokémon does not evolve.
      </Text>
    );
  }
  return (
    <Group gap="md" align="center" wrap="wrap">
      {levels.map((group, i) => (
        <Fragment key={i}>
          {i > 0 && <IconChevronRight size={22} stroke={2.5} color="var(--mantine-color-dimmed)" />}
          <Group gap="sm" wrap="wrap">
            {group.map((stage) => {
              const isCurrent = stage.id === currentId;
              return (
                <UnstyledButton
                  key={stage.id}
                  onClick={() => onNavigate(stage.id)}
                  disabled={isCurrent}
                  aria-label={
                    isCurrent
                      ? `${formatName(stage.name)} (current)`
                      : `View ${formatName(stage.name)}`
                  }
                  style={{
                    padding: 'var(--mantine-spacing-xs)',
                    borderRadius: 'var(--mantine-radius-md)',
                    border: '1px solid var(--mantine-color-default-border)',
                    background: isCurrent
                      ? 'var(--mantine-color-pokeRed-light)'
                      : 'var(--mantine-color-body)',
                    cursor: isCurrent ? 'default' : 'pointer',
                  }}
                >
                  <Stack align="center" gap={4}>
                    <div className="artCircle" style={{ width: 72, height: 72 }}>
                      <img
                        className="spriteImg"
                        src={artworkUrl(stage.id)}
                        alt=""
                        loading="lazy"
                        width="54"
                        height="54"
                      />
                    </div>
                    <Text size="xs" fw={700} c={isCurrent ? undefined : 'dimmed'}>
                      {formatName(stage.name)}
                    </Text>
                  </Stack>
                </UnstyledButton>
              );
            })}
          </Group>
        </Fragment>
      ))}
    </Group>
  );
}
