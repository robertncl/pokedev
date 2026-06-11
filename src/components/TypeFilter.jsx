import { formatName, TYPE_COLORS, TYPES } from '../constants.js';

export default function TypeFilter({ selected, onSelect }) {
  return (
    <nav className="type-filter" aria-label="Filter by type">
      <button
        className={`neu-btn chip ${selected === '' ? 'is-active' : ''}`}
        onClick={() => onSelect('')}
        aria-pressed={selected === ''}
      >
        All
      </button>
      {TYPES.map((type) => (
        <button
          key={type}
          className={`neu-btn chip ${selected === type ? 'is-active' : ''}`}
          style={{ '--type-color': TYPE_COLORS[type] }}
          onClick={() => onSelect(type)}
          aria-pressed={selected === type}
        >
          <span className="chip-dot" aria-hidden="true" />
          {formatName(type)}
        </button>
      ))}
    </nav>
  );
}
