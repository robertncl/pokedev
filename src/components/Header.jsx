import Pokeball from './Pokeball.jsx';
import { CloseIcon, HeartIcon, MoonIcon, SearchIcon, SunIcon } from './Icons.jsx';

export default function Header({
  search,
  onSearchChange,
  searchRef,
  showFavorites,
  onToggleFavorites,
  favoriteCount,
  theme,
  onToggleTheme,
}) {
  return (
    <header className="header">
      <div className="brand">
        <Pokeball size={42} />
        <div>
          <h1>
            Poké<span>Dev</span>
          </h1>
          <p className="tagline">Neumorphic Pokédex</p>
        </div>
      </div>

      <div className="search neu-inset">
        <SearchIcon />
        <input
          ref={searchRef}
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search name or number…"
          aria-label="Search Pokémon by name or number"
        />
        {search && (
          <button className="search-clear" onClick={() => onSearchChange('')} aria-label="Clear search">
            <CloseIcon />
          </button>
        )}
      </div>

      <div className="header-actions">
        <button
          className={`neu-btn icon-btn fav-toggle ${showFavorites ? 'is-active' : ''}`}
          onClick={onToggleFavorites}
          aria-pressed={showFavorites}
          title={showFavorites ? 'Show all Pokémon' : 'Show favorites only'}
        >
          <HeartIcon filled={showFavorites} />
          {favoriteCount > 0 && <span className="fav-count">{favoriteCount}</span>}
        </button>
        <button
          className="theme-switch"
          role="switch"
          aria-checked={theme === 'dark'}
          onClick={onToggleTheme}
          title="Toggle light/dark theme"
          aria-label="Toggle light/dark theme"
        >
          <span className="theme-knob">{theme === 'dark' ? <MoonIcon /> : <SunIcon />}</span>
        </button>
      </div>
    </header>
  );
}
