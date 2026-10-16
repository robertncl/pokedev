import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Pokeball from './Pokeball.jsx';

describe('Pokeball', () => {
  it('renders at the default size without the spin class', () => {
    const { container } = render(<Pokeball />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
    expect(svg).toHaveClass('pokeball');
    expect(svg).not.toHaveClass('spin');
  });

  it('renders at a custom size', () => {
    const { container } = render(<Pokeball size={64} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '64');
    expect(svg).toHaveAttribute('height', '64');
  });

  it('adds the spin class when spinning', () => {
    const { container } = render(<Pokeball spinning />);
    expect(container.querySelector('svg')).toHaveClass('pokeball', 'spin');
  });
});
