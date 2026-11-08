// Colors come from the `.pokeball-*` rules in index.css, so they follow the theme.
export default function Pokeball({ size = 32, spinning = false }) {
  return (
    <svg
      className={`pokeball${spinning ? ' spin' : ''}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      <path className="pokeball-top" d="M 4 50 A 46 46 0 0 1 96 50 Z" />
      <path className="pokeball-bottom" d="M 4 50 A 46 46 0 0 0 96 50 Z" />
      <g className="pokeball-line" fill="none" strokeWidth="7">
        <circle cx="50" cy="50" r="46" />
        <line x1="4" y1="50" x2="96" y2="50" />
      </g>
      <circle className="pokeball-bottom pokeball-line" cx="50" cy="50" r="14" strokeWidth="7" />
      <circle className="pokeball-center" cx="50" cy="50" r="5.5" />
    </svg>
  );
}
