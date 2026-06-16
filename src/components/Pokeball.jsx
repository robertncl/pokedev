export default function Pokeball({ size = 32, spinning = false }) {
  return (
    <svg
      className={`pokeball${spinning ? ' spin' : ''}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
    >
      <path d="M 4 50 A 46 46 0 0 1 96 50 Z" fill="#ee5253" />
      <path d="M 4 50 A 46 46 0 0 0 96 50 Z" fill="#f4f7fb" />
      <circle cx="50" cy="50" r="46" fill="none" stroke="#2f3447" strokeWidth="7" />
      <line x1="4" y1="50" x2="96" y2="50" stroke="#2f3447" strokeWidth="7" />
      <circle cx="50" cy="50" r="14" fill="#f4f7fb" stroke="#2f3447" strokeWidth="7" />
      <circle cx="50" cy="50" r="5.5" fill="#2f3447" />
    </svg>
  );
}
