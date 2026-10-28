import { useEffect, useRef, useState } from 'react';
import { artworkUrl, padId, shinyArtworkUrl, STAT_KEYS, thumbUrl } from '../constants.js';
import { fetchDetails, getPokemon } from '../data.js';
import { useTilt } from '../hooks.js';
import { useI18n } from '../i18n/index.js';
import EvolutionChain from './EvolutionChain.jsx';
import { CloseIcon, HeartIcon, SparklesIcon } from './Icons.jsx';
import StatBar from './StatBar.jsx';
import TypeBadge from './TypeBadge.jsx';

// The detail record for `id` in `locale`: `details` is null while loading,
// `error` is set if the request failed, and `retry` refetches.
function useDetails(id, locale) {
  const [state, setState] = useState({ key: null, details: null, error: false });
  const [attempt, setAttempt] = useState(0);
  const key = `${locale}/${id}`;

  useEffect(() => {
    let cancelled = false;
    fetchDetails(id, locale).then(
      (details) => {
        if (!cancelled) setState({ key, details, error: false });
      },
      () => {
        if (!cancelled) setState({ key, details: null, error: true });
      }
    );
    return () => {
      cancelled = true;
    };
  }, [id, locale, key, attempt]);

  const current = state.key === key ? state : { details: null, error: false };
  const retry = () => {
    setState({ key: null, details: null, error: false });
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
  const { t, locale, dataLocale, pokemonName, abilityName, formatNumber, formatUnit } = useI18n();
  const pokemon = getPokemon(id);
  const name = pokemonName(pokemon);
  const dialogRef = useRef(null);
  const tiltRef = useTilt();
  const { details, error, retry } = useDetails(id, dataLocale);
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
        {t('detail.error')}{' '}
        <button type="button" className="link-button" onClick={retry}>
          {t('detail.retry')}
        </button>
      </>
    );
  } else if (details) {
    flavor = details.flavor || t('detail.noFlavor');
  } else {
    flavor = t('detail.loadingFlavor');
  }
  // Languages without official Pokémon data show the English text; `dir`
  // keeps its punctuation in place on right-to-left pages.
  const dataText = details && dataLocale !== locale ? { lang: dataLocale, dir: 'auto' } : null;

  let evolution;
  if (details?.evolution) {
    evolution = <EvolutionChain levels={details.evolution} currentId={id} onNavigate={onNavigate} />;
  } else {
    evolution = <p className="muted">{t(details || error ? 'detail.noEvolution' : 'detail.loadingEvolution')}</p>;
  }

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      closedby="any"
      aria-label={t('detail.label', { name })}
      onCancel={handleCancel}
      onClose={onClose}
      onClick={handleClick}
    >
      <div className="modal-body">
        <div className="modal-header">
          <div className="modal-heading">
            <span className="modal-number">{padId(id)}</span>
            <h2 className="modal-title">{name}</h2>
            {details?.genus && (
              <span className="modal-genus" {...dataText}>
                {details.genus}
              </span>
            )}
          </div>
          <div className="modal-actions">
            <button
              type="button"
              className="icon-button lg"
              data-variant={shiny ? 'filled' : 'default'}
              data-color="yellow"
              data-tooltip={t(shiny ? 'detail.showRegular' : 'detail.showShiny')}
              onClick={() => setShinyId(shiny ? null : id)}
              aria-pressed={shiny}
              aria-label={t('detail.shiny')}
            >
              <SparklesIcon size={18} />
            </button>
            <button
              type="button"
              className="icon-button lg"
              data-variant={isFavorite ? 'filled' : 'default'}
              onClick={() => onToggleFavorite(id)}
              aria-pressed={isFavorite}
              aria-label={t(isFavorite ? 'detail.removeFavorite' : 'detail.addFavorite')}
            >
              <HeartIcon filled={isFavorite} size={18} />
            </button>
            <button
              type="button"
              className="icon-button lg"
              data-variant="default"
              onClick={requestClose}
              aria-label={t('detail.close')}
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
            <p className="flavor" {...dataText}>
              {flavor}
            </p>
          </div>

          <div>
            <div className="facts">
              <Fact label={t('detail.height')} value={details ? formatUnit(details.height / 10, 'meter') : '…'} />
              <Fact label={t('detail.weight')} value={details ? formatUnit(details.weight / 10, 'kilogram') : '…'} />
              <Fact
                label={t('detail.baseExp')}
                value={details ? (details.baseExp == null ? '—' : formatNumber(details.baseExp)) : '…'}
              />
            </div>

            <h3 className="section-title">{t('detail.abilities')}</h3>
            <div className="abilities">
              {details ? (
                details.abilities.map((ability, i) => (
                  <span key={i} className="ability">
                    {abilityName(ability.name)}
                    {ability.hidden && <span className="ability-hidden"> · {t('detail.hiddenAbility')}</span>}
                  </span>
                ))
              ) : (
                <span className="muted">{error ? '—' : t('detail.loading')}</span>
              )}
            </div>

            <h3 className="section-title">{t('detail.baseStats')}</h3>
            <div className="stats">
              {STAT_KEYS.map((key, i) => (
                <StatBar key={key} label={t(`stat.${key}`)} value={details?.stats[i]} />
              ))}
              <div className="stat-row stat-total">
                <span className="stat-label">{t('detail.total')}</span>
                <span className="stat-value">{total == null ? null : formatNumber(total)}</span>
              </div>
            </div>
          </div>
        </div>

        <section>
          <h3 className="section-title">{t('detail.evolution')}</h3>
          {evolution}
        </section>
      </div>
    </dialog>
  );
}
