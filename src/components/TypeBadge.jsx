import { Badge } from '@mantine/core';
import { formatName, TYPE_COLORS } from '../constants.js';

export default function TypeBadge({ type, size = 'sm' }) {
  return (
    <Badge color={TYPE_COLORS[type] || '#9aa0b5'} variant="filled" size={size} radius="sm" autoContrast>
      {formatName(type)}
    </Badge>
  );
}
