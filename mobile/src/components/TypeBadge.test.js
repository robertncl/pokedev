import { renderWithProviders } from '../test/render.js';
import TypeBadge from './TypeBadge.js';

describe('TypeBadge', () => {
  it('renders the formatted type name at the default size', async () => {
    const { getByText } = await renderWithProviders(<TypeBadge type="fire" />);
    expect(getByText('Fire')).toBeTruthy();
  });

  it('renders at the "md" size', async () => {
    const { getByText } = await renderWithProviders(<TypeBadge type="water" size="md" />);
    expect(getByText('Water')).toBeTruthy();
  });

  it('falls back to a default color for an unknown type', async () => {
    const { getByText } = await renderWithProviders(<TypeBadge type="mystery" />);
    expect(getByText('Mystery')).toBeTruthy();
  });
});
