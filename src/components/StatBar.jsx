import { Group, Progress, Text } from '@mantine/core';

function statColor(value) {
  if (value >= 115) return 'teal';
  if (value >= 85) return 'green';
  if (value >= 55) return 'yellow';
  return 'red';
}

export default function StatBar({ label, value }) {
  // 180 ≈ a very high base stat; anything beyond just fills the bar
  const pct = Math.min(100, Math.round((value / 180) * 100));
  return (
    <Group gap="sm" wrap="nowrap">
      <Text w={64} size="sm" fw={700} c="dimmed">
        {label}
      </Text>
      <Text w={32} ta="right" size="sm" fw={800} ff="monospace">
        {value}
      </Text>
      <Progress
        value={pct}
        color={statColor(value)}
        size="lg"
        radius="xl"
        transitionDuration={600}
        style={{ flex: 1 }}
      />
    </Group>
  );
}
