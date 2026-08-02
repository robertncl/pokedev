import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TYPES } from '../constants.js';
import { renderWithProviders } from '../test/render.jsx';
import TypeFilter from './TypeFilter.jsx';

describe('TypeFilter', () => {
  it('renders an "All" chip plus one chip per type', () => {
    const { getByText } = renderWithProviders(<TypeFilter selected="" onSelect={() => {}} />);
    expect(getByText('All')).toBeInTheDocument();
    expect(getByText('Fire')).toBeInTheDocument();
    expect(getByText('Water')).toBeInTheDocument();
  });

  it('calls onSelect with the type when a type chip is clicked', async () => {
    const onSelect = vi.fn();
    const { getByText } = renderWithProviders(<TypeFilter selected="" onSelect={onSelect} />);
    await userEvent.click(getByText('Grass'));
    expect(onSelect).toHaveBeenCalledWith('grass');
  });

  it('calls onSelect with an empty string when "All" is clicked', async () => {
    const onSelect = vi.fn();
    const { getByText } = renderWithProviders(
      <TypeFilter selected="grass" onSelect={onSelect} />
    );
    await userEvent.click(getByText('All'));
    expect(onSelect).toHaveBeenCalledWith('');
  });

  it('marks the selected type chip as checked', () => {
    const { container } = renderWithProviders(<TypeFilter selected="water" onSelect={() => {}} />);
    const checked = container.querySelector('input:checked');
    expect(checked).toBeTruthy();
  });

  it('renders every known type', () => {
    const { getByText } = renderWithProviders(<TypeFilter selected="" onSelect={() => {}} />);
    TYPES.forEach((type) => {
      expect(getByText(new RegExp(`^${type}$`, 'i'))).toBeInTheDocument();
    });
  });
});
