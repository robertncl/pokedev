import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test/render.jsx';
import StatBar from './StatBar.jsx';

function getBar(container) {
  return container.querySelector('[role="progressbar"]');
}

describe('StatBar', () => {
  it('renders the label and raw value', () => {
    const { getByText } = renderWithProviders(<StatBar label="HP" value={45} />);
    expect(getByText('HP')).toBeInTheDocument();
    expect(getByText('45')).toBeInTheDocument();
  });

  it('clamps the fill percentage at 100 for very high values', () => {
    const { container } = renderWithProviders(<StatBar label="Speed" value={200} />);
    expect(getBar(container)).toHaveAttribute('aria-valuenow', '100');
  });

  it.each([
    [120, '67', 'teal'],
    [90, '50', 'green'],
    [60, '33', 'yellow'],
    [10, '6', 'red'],
  ])('renders value %i at %s%% with the %s color band', (value, pct, color) => {
    const { container } = renderWithProviders(<StatBar label="Atk" value={value} />);
    const bar = getBar(container);
    expect(bar).toHaveAttribute('aria-valuenow', pct);
    expect(bar.style.getPropertyValue('--progress-section-color')).toContain(color);
  });
});
