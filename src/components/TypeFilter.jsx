import { TYPE_COLORS, TYPES } from '../constants.js';
import { useI18n } from '../i18n/index.js';
import { CheckIcon } from './Icons.jsx';

function Chip({ checked, onClick, color, children }) {
  return (
    <label className={color ? 'chip' : 'chip all'} style={color ? { '--chip-color': color } : undefined}>
      <input type="checkbox" className="chip-input" checked={checked} onChange={onClick} />
      <span className="chip-label">
        {checked ? (
          <span className="chip-check">
            <CheckIcon />
          </span>
        ) : (
          color && <span className="type-dot" style={{ '--type-color': color }} aria-hidden="true" />
        )}
        {children}
      </span>
    </label>
  );
}

export default function TypeFilter({ selected, onSelect }) {
  const { t, typeName } = useI18n();
  return (
    <div className="type-filter" role="group" aria-labelledby="type-filter-label">
      <span id="type-filter-label" className="filter-label">
        {t('filter.label')}
      </span>
      <div className="chips">
        <Chip checked={selected === ''} onClick={() => onSelect('')}>
          {t('filter.all')}
        </Chip>
        {TYPES.map((type) => (
          <Chip key={type} checked={selected === type} onClick={() => onSelect(type)} color={TYPE_COLORS[type]}>
            {typeName(type)}
          </Chip>
        ))}
      </div>
    </div>
  );
}
