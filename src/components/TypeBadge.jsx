import { textColorOn, TYPE_COLORS } from '../constants.js';
import { useI18n } from '../i18n/index.js';

const UNKNOWN_TYPE_COLOR = '#9aa0b5';

export default function TypeBadge({ type, size = 'sm' }) {
  const { typeName } = useI18n();
  const color = TYPE_COLORS[type] || UNKNOWN_TYPE_COLOR;
  return (
    <span
      className={size === 'md' ? 'badge md' : 'badge'}
      style={{ '--badge-bg': color, '--badge-text': textColorOn(color) }}
    >
      {typeName(type)}
    </span>
  );
}
