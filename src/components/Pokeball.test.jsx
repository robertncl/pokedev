import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test/render.jsx';
import Pokeball from './Pokeball.jsx';

describe('Pokeball', () => {
  it('renders at the default size without the spin class', () => {
    const { container } = renderWithProviders(<Pokeball />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
    expect(svg).toHaveClass('pokeball');
    expect(svg).not.toHaveClass('spin');
  });

  it('renders at a custom size', () => {
    const { container } = renderWithProviders(<Pokeball size={64} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '64');
    expect(svg).toHaveAttribute('height', '64');
  });

  it('adds the spin class when spinning', () => {
    const { container } = renderWithProviders(<Pokeball spinning />);
    expect(container.querySelector('svg')).toHaveClass('pokeball', 'spin');
  });
});
