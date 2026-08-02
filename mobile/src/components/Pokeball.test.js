import { renderWithProviders } from '../test/render.js';
import Pokeball from './Pokeball.js';

describe('Pokeball', () => {
  it('renders without spinning by default', async () => {
    const { toJSON } = await renderWithProviders(<Pokeball />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders with a custom size and color', async () => {
    const { toJSON } = await renderWithProviders(<Pokeball size={64} color="#123456" />);
    expect(toJSON()).toBeTruthy();
  });

  it('starts and stops the spin animation when spinning', async () => {
    const { unmount } = await renderWithProviders(<Pokeball spinning />);
    expect(() => unmount()).not.toThrow();
  });
});
