import { formatName, TYPE_COLORS } from '../constants.js';

export default function TypeBadge({ type }) {
  return (
    <span className="type-badge" style={{ '--type-color': TYPE_COLORS[type] || '#9aa0b5' }}>
      {formatName(type)}
    </span>
  );
}
