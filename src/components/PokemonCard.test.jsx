import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders } from '../test/render.jsx';
import PokemonCard from './PokemonCard.jsx';

const pokemon = {
  id: 25,
  name: 'pikachu',
  types: [{ type: { name: 'electric' } }],
  sprites: { front_default: 'fallback.png', other: { 'official-artwork': { front_default: 'art.png' } } },
};

describe('PokemonCard', () => {
  it('renders id, name, artwork, and type badges', () => {
    const { getByText, getByAltText } = renderWithProviders(
      <PokemonCard pokemon={pokemon} isFavorite={false} onToggleFavorite={() => {}} onSelect={() => {}} />
    );
    expect(getByText('#0025')).toBeInTheDocument();
    expect(getByText('Pikachu')).toBeInTheDocument();
    expect(getByText('Electric')).toBeInTheDocument();
    expect(getByAltText('')).toHaveAttribute('src', 'art.png');
  });

  it('falls back to the constants artwork URL when no artwork sprite is present', () => {
    const bare = { ...pokemon, sprites: {} };
    const { getByAltText } = renderWithProviders(
      <PokemonCard pokemon={bare} isFavorite={false} onToggleFavorite={() => {}} onSelect={() => {}} />
    );
    expect(getByAltText('')).toHaveAttribute(
      'src',
      expect.stringContaining('/25.png')
    );
  });

  it('swaps to the fallback sprite on image load error', () => {
    const { getByAltText } = renderWithProviders(
      <PokemonCard pokemon={pokemon} isFavorite={false} onToggleFavorite={() => {}} onSelect={() => {}} />
    );
    const img = getByAltText('');
    img.dispatchEvent(new Event('error', { bubbles: true }));
    expect(img.src).toContain('fallback.png');
  });

  it('does not swap the sprite again once already showing the fallback', () => {
    const { getByAltText } = renderWithProviders(
      <PokemonCard pokemon={pokemon} isFavorite={false} onToggleFavorite={() => {}} onSelect={() => {}} />
    );
    const img = getByAltText('');
    img.dispatchEvent(new Event('error', { bubbles: true }));
    const srcAfterFirst = img.src;
    img.dispatchEvent(new Event('error', { bubbles: true }));
    expect(img.src).toBe(srcAfterFirst);
  });

  it('calls onSelect with the pokemon when the card is clicked', async () => {
    const onSelect = vi.fn();
    const { getByRole } = renderWithProviders(
      <PokemonCard pokemon={pokemon} isFavorite={false} onToggleFavorite={() => {}} onSelect={onSelect} />
    );
    await userEvent.click(getByRole('button', { name: 'View details for Pikachu' }));
    expect(onSelect).toHaveBeenCalledWith(pokemon);
  });

  it('calls onSelect when Enter is pressed on the card', async () => {
    const onSelect = vi.fn();
    const { getByRole } = renderWithProviders(
      <PokemonCard pokemon={pokemon} isFavorite={false} onToggleFavorite={() => {}} onSelect={onSelect} />
    );
    const card = getByRole('button', { name: 'View details for Pikachu' });
    card.focus();
    await userEvent.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledWith(pokemon);
  });

  it('calls onSelect when Space is pressed on the card', async () => {
    const onSelect = vi.fn();
    const { getByRole } = renderWithProviders(
      <PokemonCard pokemon={pokemon} isFavorite={false} onToggleFavorite={() => {}} onSelect={onSelect} />
    );
    const card = getByRole('button', { name: 'View details for Pikachu' });
    card.focus();
    await userEvent.keyboard(' ');
    expect(onSelect).toHaveBeenCalledWith(pokemon);
  });

  it('toggles favorite without triggering onSelect, and shows filled heart when favorited', async () => {
    const onSelect = vi.fn();
    const onToggleFavorite = vi.fn();
    const { getByRole } = renderWithProviders(
      <PokemonCard pokemon={pokemon} isFavorite={true} onToggleFavorite={onToggleFavorite} onSelect={onSelect} />
    );
    const favoriteBtn = getByRole('button', { name: 'Remove Pikachu from favorites' });
    await userEvent.click(favoriteBtn);
    expect(onToggleFavorite).toHaveBeenCalledWith(25);
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('stops keydown propagation on the favorite button so it does not also trigger card selection', () => {
    const onSelect = vi.fn();
    const { getByRole } = renderWithProviders(
      <PokemonCard pokemon={pokemon} isFavorite={false} onToggleFavorite={() => {}} onSelect={onSelect} />
    );
    const favoriteBtn = getByRole('button', { name: 'Add Pikachu to favorites' });
    const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    const stopSpy = vi.spyOn(event, 'stopPropagation');
    favoriteBtn.dispatchEvent(event);
    expect(stopSpy).toHaveBeenCalled();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('shows "Add to favorites" label when not a favorite', () => {
    const { getByRole } = renderWithProviders(
      <PokemonCard pokemon={pokemon} isFavorite={false} onToggleFavorite={() => {}} onSelect={() => {}} />
    );
    expect(getByRole('button', { name: 'Add Pikachu to favorites' })).toBeInTheDocument();
  });
});
