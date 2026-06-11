import { Fragment } from 'react';
import { idFromUrl } from '../api.js';
import { artworkUrl, formatName } from '../constants.js';

// Flatten the recursive chain into stages: [[base], [stage 2...], [stage 3...]]
// Branched evolutions (e.g. Eevee) become multiple nodes within one stage.
function flattenChain(root) {
  const levels = [];
  let frontier = [root];
  while (frontier.length > 0) {
    levels.push(
      frontier.map((node) => ({ name: node.species.name, id: idFromUrl(node.species.url) }))
    );
    frontier = frontier.flatMap((node) => node.evolves_to);
  }
  return levels;
}

export default function EvolutionChain({ chain, currentId, onNavigate }) {
  const levels = flattenChain(chain);
  if (levels.length < 2) {
    return <p className="evo-none">This Pokémon does not evolve.</p>;
  }
  return (
    <div className="evo-chain">
      {levels.map((group, i) => (
        <Fragment key={i}>
          {i > 0 && (
            <span className="evo-arrow" aria-hidden="true">
              →
            </span>
          )}
          <div className="evo-group">
            {group.map((stage) => {
              const isCurrent = stage.id === currentId;
              return (
                <button
                  key={stage.id}
                  className={`evo-node ${isCurrent ? 'is-current' : ''}`}
                  onClick={() => onNavigate(stage.id)}
                  disabled={isCurrent}
                  aria-label={isCurrent ? `${formatName(stage.name)} (current)` : `View ${formatName(stage.name)}`}
                >
                  <span className="evo-dish">
                    <img src={artworkUrl(stage.id)} alt="" loading="lazy" width="54" height="54" />
                  </span>
                  <span className="evo-name">{formatName(stage.name)}</span>
                </button>
              );
            })}
          </div>
        </Fragment>
      ))}
    </div>
  );
}
