import { toggleColorScheme } from '../colorScheme.js';
import { setLocale, useI18n } from '../i18n/index.js';
import { LOCALES } from '../i18n/locales.js';
import { CloseIcon, GlobeIcon, HeartIcon, MoonIcon, SearchIcon, SunIcon } from './Icons.jsx';
import Pokeball from './Pokeball.jsx';

// A native <select> laid invisibly over a compact button, so it opens the
// platform picker and stays accessible but only takes the room of a label.
function LanguagePicker() {
  const { t, locale } = useI18n();
  const current = LOCALES.find((l) => l.code === locale);
  return (
    <label className="language" title={t('language.label')}>
      <GlobeIcon size={18} />
      <span className="language-name" aria-hidden="true">
        {current.name}
      </span>
      <select
        className="language-select"
        value={locale}
        onChange={(e) => setLocale(e.currentTarget.value)}
        aria-label={t('language.label')}
      >
        {LOCALES.map(({ code, name }) => (
          <option key={code} value={code} lang={code}>
            {name}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function Header({
  search,
  onSearchChange,
  searchRef,
  showFavorites,
  onToggleFavorites,
  favoriteCount,
}) {
  const { t, formatNumber } = useI18n();
  return (
    <header className="header">
      <div className="brand">
        <Pokeball size={42} />
        <div>
          <h1 className="brand-title">
            Poké<span>Dev</span>
          </h1>
          <p className="eyebrow">{t('header.eyebrow')}</p>
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
          placeholder={t('search.placeholder')}
          aria-label={t('search.label')}
          autoComplete="off"
          spellCheck={false}
        />
        {search && (
          <button
            type="button"
            className="icon-button search-clear"
            data-variant="subtle"
            onClick={() => onSearchChange('')}
            aria-label={t('search.clear')}
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
            title={t(showFavorites ? 'favorites.showAll' : 'favorites.showOnly')}
          >
            <HeartIcon filled={showFavorites} size={20} />
          </button>
          {favoriteCount > 0 && <span className="indicator">{formatNumber(favoriteCount)}</span>}
        </span>
        <LanguagePicker />
        {/* Both icons are rendered; CSS shows the one for the scheme in use. */}
        <button
          type="button"
          className="icon-button lg"
          data-variant="default"
          onClick={toggleColorScheme}
          aria-label={t('theme.label')}
          title={t('theme.title')}
        >
          <SunIcon className="if-dark" size={20} />
          <MoonIcon className="if-light" size={20} />
        </button>
      </div>
    </header>
  );
}
