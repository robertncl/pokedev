import { Card, Skeleton, Stack } from '@mantine/core';

export default function SkeletonCard() {
  return (
    <Card withBorder radius="lg" padding="lg" aria-hidden="true">
      <Stack align="center" gap="sm">
        <Skeleton height={132} circle />
        <Skeleton height={16} width="60%" radius="xl" mt="xs" />
        <Skeleton height={20} width="80%" radius="xl" />
      </Stack>
    </Card>
  );
}
