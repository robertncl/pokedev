import { useEffect, useRef, useState } from 'react';
import { artworkUrl, formatName, padId, shinyArtworkUrl, STAT_LABELS, thumbUrl } from '../constants.js';
import { fetchDetails, getPokemon } from '../data.js';
import { useTilt } from '../hooks.js';
import EvolutionChain from './EvolutionChain.jsx';
import { CloseIcon, HeartIcon, SparklesIcon } from './Icons.jsx';
import StatBar from './StatBar.jsx';
import TypeBadge from './TypeBadge.jsx';

// The detail record for `id`: `details` is null while loading, `error` is set
// if the request failed, and `retry` refetches.
function useDetails(id) {
  const [state, setState] = useState({ id: null, details: null, error: false });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchDetails(id).then(
      (details) => {
        if (!cancelled) setState({ id, details, error: false });
      },
      () => {
        if (!cancelled) setState({ id, details: null, error: true });
      }
    );
    return () => {
      cancelled = true;
    };
  }, [id, attempt]);

  const current = state.id === id ? state : { details: null, error: false };
  const retry = () => {
    setState({ id: null, details: null, error: false });
    setAttempt((n) => n + 1);
  };
  return { ...current, retry };
}

// Plays the exit transition (`[data-closing]` in index.css) before closing.
// Exit transitions on the top layer aren't supported everywhere, so this
// works the same in every browser instead of relying on them.
async function closeWithTransition(dialog) {
  if (!dialog.open || dialog.hasAttribute('data-closing')) return;
  dialog.setAttribute('data-closing', '');
  const transitions = (dialog.getAnimations?.({ subtree: true }) ?? []).filter((a) => a.effect?.target === dialog);
  await Promise.race([
    Promise.allSettled(transitions.map((a) => a.finished)),
    new Promise((resolve) => setTimeout(resolve, 500)),
  ]);
  dialog.close();
}

function Fact({ label, value }) {
  return (
    <div className="fact">
      <div className="fact-label">{label}</div>
      <div className="fact-value">{value}</div>
    </div>
  );
}

export default function DetailModal({ id, isFavorite, onToggleFavorite, onClose, onNavigate }) {
  const pokemon = getPokemon(id);
  const name = formatName(pokemon.name);
  const dialogRef = useRef(null);
  const tiltRef = useTilt();
  const { details, error, retry } = useDetails(id);
  // Keyed by id so navigating to another Pokémon resets to regular artwork.
  const [shinyId, setShinyId] = useState(null);
  const shiny = shinyId === id;
  const [loadedArt, setLoadedArt] = useState(() => new Set());

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
  }, []);

  const requestClose = () => closeWithTransition(dialogRef.current);

  // Esc, and backdrop clicks via closedby="any", arrive as cancel events:
  // route them through the animated close.
  const handleCancel = (e) => {
    e.preventDefault();
    requestClose();
  };

  // Light dismiss where `closedby` isn't supported: backdrop clicks target the
  // dialog itself, outside its box.
  const handleClick = (e) => {
    if ('closedBy' in HTMLDialogElement.prototype || e.target !== e.currentTarget) return;
    const box = e.currentTarget.getBoundingClientRect();
    const inside = e.clientX >= box.left && e.clientX <= box.right && e.clientY >= box.top && e.clientY <= box.bottom;
    if (!inside) requestClose();
  };

  // Full-size artwork comes from GitHub. Until it arrives, show what's already
  // cached: the regular artwork when switching to shiny, else the thumbnail.
  const regularArt = artworkUrl(id);
  const art = shiny ? shinyArtworkUrl(id) : regularArt;
  const artReady = loadedArt.has(art);
  const placeholder = loadedArt.has(regularArt) ? regularArt : thumbUrl(id);

  const total = details?.stats.reduce((sum, stat) => sum + stat, 0);

  let flavor;
  if (error) {
    flavor = (
      <>
        Couldn&apos;t load details.{' '}
        <button type="button" className="link-button" onClick={retry}>
          Retry
        </button>
      </>
    );
  } else if (details) {
    flavor = details.flavor || 'No Pokédex entry available.';
  } else {
    flavor = 'Loading Pokédex entry…';
  }

  let evolution;
  if (details?.evolution) {
    evolution = <EvolutionChain levels={details.evolution} currentId={id} onNavigate={onNavigate} />;
  } else {
    evolution = <p className="muted">{details || error ? 'No evolution data available.' : 'Loading evolution chain…'}</p>;
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      closedby="any"
      aria-label={`${name} details`}
      onCancel={handleCancel}
      onClose={onClose}
      onClick={handleClick}
    >
      <div className="modal-body">
        <div className="modal-header">
          <div className="modal-heading">
            <span className="modal-number">{padId(id)}</span>
            <h2 className="modal-title">{name}</h2>
            {details?.genus && <span className="modal-genus">{details.genus}</span>}
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="icon-button lg"
              data-variant={shiny ? 'filled' : 'default'}
              data-color="yellow"
              data-tooltip={shiny ? 'Show regular artwork' : 'Show shiny artwork'}
              onClick={() => setShinyId(shiny ? null : id)}
              aria-pressed={shiny}
              aria-label="Toggle shiny artwork"
            >
              <SparklesIcon size={18} />
            </button>
            <button
              type="button"
              className="icon-button lg"
              data-variant={isFavorite ? 'filled' : 'default'}
              onClick={() => onToggleFavorite(id)}
              aria-pressed={isFavorite}
              aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <HeartIcon filled={isFavorite} size={18} />
            </button>
            <button
              type="button"
              className="icon-button lg"
              data-variant="default"
              onClick={requestClose}
              aria-label="Close details"
            >
              <CloseIcon size={18} />
            </button>
          </div>
        </div>

        <div className="modal-grid">
          <div className="modal-art">
            <div ref={tiltRef} className="tilt art-hero">
              <div className="dish">
                {!artReady && <img className="sprite" src={placeholder} alt="" />}
                <img
                  key={art}
                  className="sprite"
                  src={art}
                  alt={name}
                  hidden={!artReady}
                  onLoad={() => setLoadedArt((prev) => new Set(prev).add(art))}
                  onError={() => {
                    if (shiny) setShinyId(null);
                  }}
                />
              </div>
            </div>
            <div className="badges">
              {pokemon.types.map((type) => (
                <TypeBadge key={type} type={type} size="md" />
              ))}
            </div>
            <p className="flavor">{flavor}</p>
          </div>

          <div>
            <div className="facts">
              <Fact label="Height" value={details ? `${(details.height / 10).toFixed(1)} m` : '…'} />
              <Fact label="Weight" value={details ? `${(details.weight / 10).toFixed(1)} kg` : '…'} />
              <Fact label="Base XP" value={details ? (details.baseExp ?? '—') : '…'} />
            </div>

            <h3 className="section-title">Abilities</h3>
            <div className="abilities">
              {details ? (
                details.abilities.map((ability, i) => (
                  <span key={i} className="ability">
                    {formatName(ability.name)}
                    {ability.hidden && <span className="ability-hidden"> · hidden</span>}
                  </span>
                ))
              ) : (
                <span className="muted">{error ? '—' : 'Loading…'}</span>
              )}
            </div>

            <h3 className="section-title">Base Stats</h3>
            <div className="stats">
              {STAT_LABELS.map((label, i) => (
                <StatBar key={label} label={label} value={details?.stats[i]} />
              ))}
              <div className="stat-row stat-total">
                <span className="stat-label">Total</span>
                <span className="stat-value">{total}</span>
              </div>
            </div>
          </div>
        </div>

        <section>
          <h3 className="section-title">Evolution Chain</h3>
          {evolution}
        </section>
      </div>
    </dialog>
  );
}
