import { formatName, textColorOn, TYPE_COLORS } from '../constants.js';

const UNKNOWN_TYPE_COLOR = '#9aa0b5';

export default function TypeBadge({ type, size = 'sm' }) {
  const color = TYPE_COLORS[type] || UNKNOWN_TYPE_COLOR;
  return (
    <span
      className={size === 'md' ? 'badge md' : 'badge'}
      style={{ '--badge-bg': color, '--badge-text': textColorOn(color) }}
    >
      {formatName(type)}
    </span>
  );
}
