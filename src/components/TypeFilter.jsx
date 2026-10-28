import { TYPE_COLORS, TYPES } from '../constants.js';
import { useI18n } from '../i18n/index.js';
import { CheckIcon } from './Icons.jsx';

function Chip({ checked, onClick, color, children }) {
  return (
    <label className={color ? 'chip' : 'chip all'} style={color ? { '--chip-color': color } : undefined}>
      <input type="checkbox" className="chip-input" checked={checked} onChange={onClick} />
      <span className="chip-label">
        {checked && (
          <span className="chip-check">
            <CheckIcon />
          </span>
        )}
        {children}
      </span>
    </label>
  );
}

export default function TypeFilter({ selected, onSelect }) {
  const { t, typeName } = useI18n();
  return (
    <div className="type-filter" role="group" aria-label={t('filter.label')}>
      <Chip checked={selected === ''} onClick={() => onSelect('')}>
        {t('filter.all')}
      </Chip>
      {TYPES.map((type) => (
        <Chip key={type} checked={selected === type} onClick={() => onSelect(type)} color={TYPE_COLORS[type]}>
          {typeName(type)}
        </Chip>
      ))}
    </div>
  );
}
