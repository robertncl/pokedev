import { memo } from 'react';
import { padId, PAGE_SIZE, thumbUrl } from '../constants.js';
import { prefetchDetails } from '../data.js';
import { useTilt } from '../hooks.js';
import { useI18n } from '../i18n/index.js';
import { HeartIcon } from './Icons.jsx';
import TypeBadge from './TypeBadge.jsx';

// The first couple of rows are above the fold on most screens: load their
// artwork right away, the very first at high priority as the likely LCP
// element. The rest lazy-load, and cards past the first page skip rendering
// until scrolled near (`.deferred`).
const EAGER_CARDS = 10;
const HIGH_PRIORITY_CARDS = 2;

function PokemonCard({ pokemon, index, isFavorite, onToggleFavorite, onSelect }) {
  const { id, types } = pokemon;
  const { t, pokemonName, dataLocale } = useI18n();
  const label = pokemonName(pokemon);
  const tiltRef = useTilt();
  const prefetch = () => prefetchDetails(id, dataLocale);

  return (
    <article
      ref={tiltRef}
      className={index < PAGE_SIZE ? 'card tilt' : 'card tilt deferred'}
      onPointerEnter={prefetch}
    >
      <div className="card-top">
        <span className="card-id">{padId(id)}</span>
        <button
          type="button"
          className="icon-button card-heart"
          data-variant={isFavorite ? 'light' : 'subtle'}
          onClick={() => onToggleFavorite(id)}
          aria-pressed={isFavorite}
          aria-label={t(isFavorite ? 'card.removeFavorite' : 'card.addFavorite', { name: label })}
        >
          <HeartIcon filled={isFavorite} size={18} />
        </button>
      </div>

      <div className="dish">
        <img
          className="sprite"
          src={thumbUrl(id)}
          alt=""
          width="256"
          height="256"
          draggable="false"
          loading={index < EAGER_CARDS ? undefined : 'lazy'}
          fetchPriority={index < HIGH_PRIORITY_CARDS ? 'high' : undefined}
        />
      </div>

      {/* Its ::after overlay stretches over the card, making the whole card
          the click target without nesting the favorite button inside it. */}
      <button
        type="button"
        className="card-name"
        onClick={() => onSelect(id)}
        onFocus={prefetch}
        aria-label={t('card.view', { name: label })}
      >
        {label}
      </button>
      <div className="badges">
        {types.map((type) => (
          <TypeBadge key={type} type={type} />
        ))}
      </div>
    </article>
  );
}

export default memo(PokemonCard);
