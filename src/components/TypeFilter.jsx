import { formatName, TYPE_COLORS, TYPES } from '../constants.js';
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
  return (
    <div className="type-filter" role="group" aria-label="Filter by type">
      <Chip checked={selected === ''} onClick={() => onSelect('')}>
        All
      </Chip>
      {TYPES.map((type) => (
        <Chip key={type} checked={selected === type} onClick={() => onSelect(type)} color={TYPE_COLORS[type]}>
          {formatName(type)}
        </Chip>
      ))}
    </div>
  );
}
