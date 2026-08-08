import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test/render.jsx';
import TypeBadge from './TypeBadge.jsx';

describe('TypeBadge', () => {
  it('renders the formatted type name', () => {
    const { getByText } = renderWithProviders(<TypeBadge type="fire" />);
    expect(getByText('Fire')).toBeInTheDocument();
  });

  it('falls back to a default color for an unknown type', () => {
    const { getByText } = renderWithProviders(<TypeBadge type="mystery" />);
    expect(getByText('Mystery')).toBeInTheDocument();
  });
});
