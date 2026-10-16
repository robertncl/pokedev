import { toggleColorScheme } from '../colorScheme.js';
import { CloseIcon, HeartIcon, MoonIcon, SearchIcon, SunIcon } from './Icons.jsx';
import Pokeball from './Pokeball.jsx';

export default function Header({
  search,
  onSearchChange,
  searchRef,
  showFavorites,
  onToggleFavorites,
  favoriteCount,
}) {
  return (
    <header className="header">
      <div className="brand">
        <Pokeball size={42} />
        <div>
          <h1 className="brand-title">
            Poké<span>Dev</span>
          </h1>
          <p className="eyebrow">Modern Pokédex</p>
        </div>
      </div>

      <div className="search">
        <SearchIcon className="search-icon" size={18} />
        <input
          ref={searchRef}
          className="search-input"
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          placeholder="Search name or number…"
          aria-label="Search Pokémon by name or number"
          autoComplete="off"
          spellCheck={false}
        />
        {search && (
          <button
            type="button"
            className="icon-button search-clear"
            data-variant="subtle"
            onClick={() => onSearchChange('')}
            aria-label="Clear search"
          >
            <CloseIcon size={16} />
          </button>
        )}
      </div>

      <div className="header-actions">
        <span className="indicator-anchor">
          <button
            type="button"
            className="icon-button lg"
            data-variant={showFavorites ? 'filled' : 'default'}
            onClick={onToggleFavorites}
            aria-pressed={showFavorites}
            title={showFavorites ? 'Show all Pokémon' : 'Show favorites only'}
          >
            <HeartIcon filled={showFavorites} size={20} />
          </button>
          {favoriteCount > 0 && <span className="indicator">{favoriteCount}</span>}
        </span>
        {/* Both icons are rendered; CSS shows the one for the scheme in use. */}
        <button
          type="button"
          className="icon-button lg"
          data-variant="default"
          onClick={toggleColorScheme}
          aria-label="Toggle color scheme"
          title="Toggle light/dark theme"
        >
          <SunIcon className="if-dark" size={20} />
          <MoonIcon className="if-light" size={20} />
        </button>
      </div>
    </header>
  );
}
