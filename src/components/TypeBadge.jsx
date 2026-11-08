import { TYPE_COLORS } from '../constants.js';
import { useI18n } from '../i18n/index.js';

const UNKNOWN_TYPE_COLOR = '#9aa0b5';

// A neutral badge: the name carries the type, the dot only speeds scanning.
export default function TypeBadge({ type, size = 'sm' }) {
  const { typeName } = useI18n();
  return (
    <span className={size === 'md' ? 'badge md' : 'badge'} style={{ '--type-color': TYPE_COLORS[type] || UNKNOWN_TYPE_COLOR }}>
      <span className="type-dot" aria-hidden="true" />
      {typeName(type)}
    </span>
  );
}
