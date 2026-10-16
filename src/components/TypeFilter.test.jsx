import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TYPE_COLORS, TYPES } from '../constants.js';
import TypeFilter from './TypeFilter.jsx';

describe('TypeFilter', () => {
  it('renders an "All" chip plus one chip per type', () => {
    const { getAllByRole, getByRole } = render(<TypeFilter selected="" onSelect={() => {}} />);
    expect(getAllByRole('checkbox')).toHaveLength(TYPES.length + 1);
    expect(getByRole('checkbox', { name: 'All' })).toBeChecked();
    TYPES.forEach((type) => {
      expect(getByRole('checkbox', { name: new RegExp(`^${type}$`, 'i') })).not.toBeChecked();
    });
  });

  it('calls onSelect with the type when a type chip is clicked', async () => {
    const onSelect = vi.fn();
    const { getByText } = render(<TypeFilter selected="" onSelect={onSelect} />);
    await userEvent.click(getByText('Grass'));
    expect(onSelect).toHaveBeenCalledWith('grass');
  });

  it('calls onSelect with an empty string when "All" is clicked', async () => {
    const onSelect = vi.fn();
    const { getByText } = render(<TypeFilter selected="grass" onSelect={onSelect} />);
    await userEvent.click(getByText('All'));
    expect(onSelect).toHaveBeenCalledWith('');
  });

  it('calls onSelect again when the selected chip is clicked, so it can be toggled off', async () => {
    const onSelect = vi.fn();
    const { getByRole } = render(<TypeFilter selected="fire" onSelect={onSelect} />);
    await userEvent.click(getByRole('checkbox', { name: 'Fire' }));
    expect(onSelect).toHaveBeenCalledWith('fire');
  });

  it('marks only the selected type chip as checked, in its type color', () => {
    const { getByRole, container } = render(<TypeFilter selected="water" onSelect={() => {}} />);
    expect(getByRole('checkbox', { name: 'Water' })).toBeChecked();
    expect(container.querySelectorAll('input:checked')).toHaveLength(1);
    expect(getByRole('checkbox', { name: 'Water' }).closest('label').style.getPropertyValue('--chip-color')).toBe(
      TYPE_COLORS.water
    );
  });

  it('can be operated from the keyboard', async () => {
    const onSelect = vi.fn();
    const { getByRole } = render(<TypeFilter selected="" onSelect={onSelect} />);
    getByRole('checkbox', { name: 'Normal' }).focus();
    await userEvent.keyboard(' ');
    expect(onSelect).toHaveBeenCalledWith('normal');
  });
});
