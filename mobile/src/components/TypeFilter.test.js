import { fireEvent } from '@testing-library/react-native';
import { TYPES } from '../constants.js';
import { renderWithProviders } from '../test/render.js';
import TypeFilter from './TypeFilter.js';

describe('TypeFilter', () => {
  it('renders an "All" chip plus one chip per type', async () => {
    const { getByText } = await renderWithProviders(<TypeFilter selected="" onSelect={() => {}} />);
    expect(getByText('All')).toBeTruthy();
    expect(getByText('Fire')).toBeTruthy();
    expect(getByText('Water')).toBeTruthy();
  });

  it('calls onSelect with the type when a type chip is pressed', async () => {
    const onSelect = jest.fn();
    const { getByText } = await renderWithProviders(<TypeFilter selected="" onSelect={onSelect} />);
    await fireEvent.press(getByText('Grass'));
    expect(onSelect).toHaveBeenCalledWith('grass');
  });

  it('calls onSelect with an empty string when "All" is pressed', async () => {
    const onSelect = jest.fn();
    const { getByText } = await renderWithProviders(<TypeFilter selected="grass" onSelect={onSelect} />);
    await fireEvent.press(getByText('All'));
    expect(onSelect).toHaveBeenCalledWith('');
  });

  it('renders every known type', async () => {
    const { getByText } = await renderWithProviders(<TypeFilter selected="" onSelect={() => {}} />);
    TYPES.forEach((type) => {
      expect(getByText(new RegExp(`^${type}$`, 'i'))).toBeTruthy();
    });
  });
});
