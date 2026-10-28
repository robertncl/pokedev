import { Fragment } from 'react';
import { thumbUrl } from '../constants.js';
import { getPokemon, prefetchDetails } from '../data.js';
import { useI18n } from '../i18n/index.js';
import { ChevronRightIcon } from './Icons.jsx';

// `levels` lists dex numbers by stage: [[base], [stage 2...], [stage 3...]].
// Branched evolutions (e.g. Eevee) have several entries in one stage.
export default function EvolutionChain({ levels, currentId, onNavigate }) {
  const { t, pokemonName, dataLocale } = useI18n();
  if (levels.length < 2) {
    return <p className="muted">{t('evolution.none')}</p>;
  }
  return (
    <div className="evolution">
      {levels.map((ids, i) => (
        <Fragment key={i}>
          {i > 0 && <ChevronRightIcon className="evolution-arrow" size={22} stroke={2.5} />}
          <div className="evolution-stage">
            {ids.map((id) => {
              const isCurrent = id === currentId;
              const name = pokemonName(getPokemon(id));
              return (
                <button
                  key={id}
                  type="button"
                  className="evolution-mon"
                  onClick={() => onNavigate(id)}
                  onPointerEnter={() => prefetchDetails(id, dataLocale)}
                  disabled={isCurrent}
                  aria-label={t(isCurrent ? 'evolution.current' : 'evolution.view', { name })}
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
