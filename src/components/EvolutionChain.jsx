import { Fragment } from 'react';
import { formatName, thumbUrl } from '../constants.js';
import { getPokemon, prefetchDetails } from '../data.js';
import { ChevronRightIcon } from './Icons.jsx';

// `levels` lists dex numbers by stage: [[base], [stage 2...], [stage 3...]].
// Branched evolutions (e.g. Eevee) have several entries in one stage.
export default function EvolutionChain({ levels, currentId, onNavigate }) {
  if (levels.length < 2) {
    return <p className="muted">This Pokémon does not evolve.</p>;
  }
  return (
    <div className="evolution">
      {levels.map((ids, i) => (
        <Fragment key={i}>
          {i > 0 && <ChevronRightIcon className="evolution-arrow" size={22} stroke={2.5} />}
          <div className="evolution-stage">
            {ids.map((id) => {
              const isCurrent = id === currentId;
              const name = formatName(getPokemon(id).name);
              return (
                <button
                  key={id}
                  type="button"
                  className="evolution-mon"
                  onClick={() => onNavigate(id)}
                  onPointerEnter={() => prefetchDetails(id)}
                  disabled={isCurrent}
                  aria-label={isCurrent ? `${name} (current)` : `View ${name}`}
                >
                  <span className="dish">
                    <img className="sprite" src={thumbUrl(id)} alt="" width="256" height="256" loading="lazy" />
                  </span>
                  <span className="evolution-name">{name}</span>
                </button>
              );
            })}
          </div>
        </Fragment>
      ))}
    </div>
  );
}
