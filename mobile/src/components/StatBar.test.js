import { renderWithProviders } from '../test/render.js';
import StatBar from './StatBar.js';

describe('StatBar', () => {
  it('renders the label and raw value', async () => {
    const { getByText } = await renderWithProviders(<StatBar label="HP" value={45} />);
    expect(getByText('HP')).toBeTruthy();
    expect(getByText('45')).toBeTruthy();
  });

  it.each([
    [200, 100], // clamps to 100%
    [120, 67],
    [90, 50],
    [60, 33],
    [10, 6],
  ])('renders value %i without throwing', async (value) => {
    const { getByText } = await renderWithProviders(<StatBar label="Speed" value={value} />);
    expect(getByText(String(value))).toBeTruthy();
  });
});
