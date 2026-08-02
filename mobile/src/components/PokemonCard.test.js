import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../test/render.js';
import PokemonCard from './PokemonCard.js';

const pokemon = {
  id: 25,
  name: 'pikachu',
  types: [{ type: { name: 'electric' } }],
  sprites: { other: { 'official-artwork': { front_default: 'art.png' } } },
};

describe('PokemonCard', () => {
  it('renders id, name, and type badges', async () => {
    const { getByText } = await renderWithProviders(
      <PokemonCard pokemon={pokemon} isFavorite={false} onToggleFavorite={() => {}} onPress={() => {}} />
    );
    expect(getByText('#0025')).toBeTruthy();
    expect(getByText('Pikachu')).toBeTruthy();
    expect(getByText('Electric')).toBeTruthy();
  });

  it('falls back to the constants artwork URL when no artwork sprite is present', async () => {
    const bare = { ...pokemon, sprites: {} };
    const { getByLabelText } = await renderWithProviders(
      <PokemonCard pokemon={bare} isFavorite={false} onToggleFavorite={() => {}} onPress={() => {}} />
    );
    expect(getByLabelText('View details for Pikachu')).toBeTruthy();
  });

  it('calls onPress when the card is pressed', async () => {
    const onPress = jest.fn();
    const { getByLabelText } = await renderWithProviders(
      <PokemonCard pokemon={pokemon} isFavorite={false} onToggleFavorite={() => {}} onPress={onPress} />
    );
    await fireEvent.press(getByLabelText('View details for Pikachu'));
    expect(onPress).toHaveBeenCalled();
  });

  it('calls onToggleFavorite with the pokemon id and shows filled heart when favorited', async () => {
    const onToggleFavorite = jest.fn();
    const { getByLabelText } = await renderWithProviders(
      <PokemonCard pokemon={pokemon} isFavorite={true} onToggleFavorite={onToggleFavorite} onPress={() => {}} />
    );
    await fireEvent.press(getByLabelText('Remove Pikachu from favorites'));
    expect(onToggleFavorite).toHaveBeenCalledWith(25);
  });

  it('shows "Add to favorites" label when not a favorite', async () => {
    const { getByLabelText } = await renderWithProviders(
      <PokemonCard pokemon={pokemon} isFavorite={false} onToggleFavorite={() => {}} onPress={() => {}} />
    );
    expect(getByLabelText('Add Pikachu to favorites')).toBeTruthy();
  });
});
