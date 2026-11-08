import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TypeBadge from './TypeBadge.jsx';

describe('TypeBadge', () => {
  it('renders the formatted type name with a type-colored dot', () => {
    const { getByText } = render(<TypeBadge type="fire" />);
    const badge = getByText('Fire');
    expect(badge.style.getPropertyValue('--type-color')).toBe('#EE8130');
    expect(badge.querySelector('.type-dot')).toHaveAttribute('aria-hidden', 'true');
  });

  it('falls back to a default color for an unknown type', () => {
    const { getByText } = render(<TypeBadge type="mystery" />);
    expect(getByText('Mystery').style.getPropertyValue('--type-color')).toBe('#9aa0b5');
  });

  it('supports the larger size', () => {
    const { getByText } = render(<TypeBadge type="water" size="md" />);
    expect(getByText('Water')).toHaveClass('badge', 'md');
  });
});
