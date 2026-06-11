import { artworkUrl, formatName, padId } from '../constants.js';
import { HeartIcon } from './Icons.jsx';
import TypeBadge from './TypeBadge.jsx';

export default function PokemonCard({ pokemon, isFavorite, onToggleFavorite, onSelect }) {
  const { id, name, types, sprites } = pokemon;
  const art = sprites?.other?.['official-artwork']?.front_default || artworkUrl(id);
  const fallback = sprites?.front_default;
  const open = () => onSelect(pokemon);

  return (
    <article
      className="card neu"
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      }}
      aria-label={`View details for ${formatName(name)}`}
    >
      <span className="card-id">{padId(id)}</span>
      <button
        className={`heart-btn ${isFavorite ? 'is-fav' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(id);
        }}
        onKeyDown={(e) => e.stopPropagation()}
        aria-label={
          isFavorite
            ? `Remove ${formatName(name)} from favorites`
            : `Add ${formatName(name)} to favorites`
        }
        aria-pressed={isFavorite}
      >
        <HeartIcon filled={isFavorite} />
      </button>
      <div className="card-dish neu-inset">
        <img
          src={art}
          alt=""
          loading="lazy"
          width="96"
          height="96"
          draggable="false"
          onError={(e) => {
            if (fallback && e.currentTarget.src !== fallback) e.currentTarget.src = fallback;
          }}
        />
      </div>
      <h3 className="card-name">{formatName(name)}</h3>
      <div className="badge-row">
        {types.map((t) => (
          <TypeBadge key={t.type.name} type={t.type.name} />
        ))}
      </div>
    </article>
  );
}
