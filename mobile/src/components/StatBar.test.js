import { renderWithProviders } from '../test/render.js';
import { COLORS } from '../theme.js';
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
  ])('renders value %i at %i%%', async (value, pct) => {
    const { getByText, getByTestId } = await renderWithProviders(<StatBar label="Speed" value={value} />);
    expect(getByText(String(value))).toBeTruthy();
    expect(getByTestId('stat-fill')).toHaveStyle({ width: `${pct}%` });
  });

  it('draws bars in the neutral data color and the highlighted one in blue', async () => {
    const plain = await renderWithProviders(<StatBar label="HP" value={45} />);
    expect(plain.getByTestId('stat-fill')).toHaveStyle({ backgroundColor: COLORS.light.data });
    const best = await renderWithProviders(<StatBar label="Speed" value={90} highlight />);
    expect(best.getByTestId('stat-fill')).toHaveStyle({ backgroundColor: COLORS.light.dataHighlight });
  });
});
