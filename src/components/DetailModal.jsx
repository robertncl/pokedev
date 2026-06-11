import { useEffect, useRef, useState } from 'react';
import { fetchEvolutionChain, fetchSpecies } from '../api.js';
import { artworkUrl, formatName, padId, shinyArtworkUrl, STAT_LABELS } from '../constants.js';
import EvolutionChain from './EvolutionChain.jsx';
import StatBar from './StatBar.jsx';
import TypeBadge from './TypeBadge.jsx';
import { CloseIcon, HeartIcon, SparklesIcon } from './Icons.jsx';

export default function DetailModal({ pokemon, isFavorite, onToggleFavorite, onClose, onNavigate }) {
  const [species, setSpecies] = useState(null);
  // chain: undefined = loading, null = unavailable, object = loaded
  const [chain, setChain] = useState(undefined);
  const [shiny, setShiny] = useState(false);
  const closeRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setSpecies(null);
    setChain(undefined);
    setShiny(false);
    fetchSpecies(pokemon.species.url)
      .then((sp) => {
        if (cancelled) return;
        setSpecies(sp);
        if (!sp.evolution_chain?.url) {
          setChain(null);
          return;
        }
        return fetchEvolutionChain(sp.evolution_chain.url).then((evo) => {
          if (!cancelled) setChain(evo.chain);
        });
      })
      .catch(() => {
        if (!cancelled) setChain(null);
      });
    return () => {
      cancelled = true;
    };
  }, [pokemon]);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const art = shiny
    ? pokemon.sprites?.other?.['official-artwork']?.front_shiny || shinyArtworkUrl(pokemon.id)
    : pokemon.sprites?.other?.['official-artwork']?.front_default || artworkUrl(pokemon.id);

  const flavor = species
    ? ([...species.flavor_text_entries].reverse().find((f) => f.language.name === 'en')
        ?.flavor_text || ''
      )
        .replace(/\s+/g, ' ')
        .trim()
    : '';
  const genus = species?.genera?.find((g) => g.language.name === 'en')?.genus;
  const total = pokemon.stats.reduce((sum, s) => sum + s.base_stat, 0);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal neu" role="dialog" aria-modal="true" aria-label={`${formatName(pokemon.name)} details`}>
        <header className="modal-head">
          <span className="modal-id">{padId(pokemon.id)}</span>
          <h2>{formatName(pokemon.name)}</h2>
          {genus && <span className="genus">{genus}</span>}
          <div className="modal-actions">
            <button
              className={`neu-btn icon-btn ${shiny ? 'is-active shiny-on' : ''}`}
              onClick={() => setShiny((s) => !s)}
              aria-pressed={shiny}
              title={shiny ? 'Show regular artwork' : 'Show shiny artwork'}
            >
              <SparklesIcon />
            </button>
            <button
              className={`neu-btn icon-btn ${isFavorite ? 'is-active heart-on' : ''}`}
              onClick={() => onToggleFavorite(pokemon.id)}
              aria-pressed={isFavorite}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <HeartIcon filled={isFavorite} />
            </button>
            <button ref={closeRef} className="neu-btn icon-btn" onClick={onClose} aria-label="Close details">
              <CloseIcon />
            </button>
          </div>
        </header>

        <div className="modal-body">
          <section className="modal-left">
            <div className="hero-dish neu-inset">
              <img
                key={art}
                src={art}
                alt={formatName(pokemon.name)}
                onError={() => {
                  if (shiny) setShiny(false);
                }}
              />
            </div>
            <div className="badge-row">
              {pokemon.types.map((t) => (
                <TypeBadge key={t.type.name} type={t.type.name} />
              ))}
            </div>
            <p className="flavor">
              {species ? flavor || 'No Pokédex entry available.' : 'Loading Pokédex entry…'}
            </p>
          </section>

          <section className="modal-right">
            <div className="fact-grid">
              <div className="fact">
                <span className="fact-label">Height</span>
                <span className="fact-value">{(pokemon.height / 10).toFixed(1)} m</span>
              </div>
              <div className="fact">
                <span className="fact-label">Weight</span>
                <span className="fact-value">{(pokemon.weight / 10).toFixed(1)} kg</span>
              </div>
              <div className="fact">
                <span className="fact-label">Base XP</span>
                <span className="fact-value">{pokemon.base_experience ?? '—'}</span>
              </div>
            </div>

            <h3 className="section-title">Abilities</h3>
            <div className="ability-row">
              {pokemon.abilities.map((a) => (
                <span key={`${a.ability.name}-${a.slot}`} className="ability-chip">
                  {formatName(a.ability.name)}
                  {a.is_hidden && <em> · hidden</em>}
                </span>
              ))}
            </div>

            <h3 className="section-title">Base Stats</h3>
            <div className="stats">
              {pokemon.stats.map((s) => (
                <StatBar
                  key={s.stat.name}
                  label={STAT_LABELS[s.stat.name] || formatName(s.stat.name)}
                  value={s.base_stat}
                />
              ))}
              <div className="stat stat-total">
                <span className="stat-label">Total</span>
                <span className="stat-value">{total}</span>
                <span />
              </div>
            </div>
          </section>
        </div>

        <section className="modal-evo">
          <h3 className="section-title">Evolution Chain</h3>
          {chain === undefined && <p className="evo-none">Loading evolution chain…</p>}
          {chain === null && <p className="evo-none">No evolution data available.</p>}
          {chain && <EvolutionChain chain={chain} currentId={pokemon.id} onNavigate={onNavigate} />}
        </section>
      </div>
    </div>
  );
}
