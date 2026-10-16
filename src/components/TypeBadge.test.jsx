import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import TypeBadge from './TypeBadge.jsx';

describe('TypeBadge', () => {
  it('renders the formatted type name in its type color with contrasting text', () => {
    const { getByText } = render(<TypeBadge type="fire" />);
    const badge = getByText('Fire');
    expect(badge.style.getPropertyValue('--badge-bg')).toBe('#EE8130');
    expect(badge.style.getPropertyValue('--badge-text')).toBe('#000');
  });

  it('uses white text on dark type colors', () => {
    const { getByText } = render(<TypeBadge type="ghost" />);
    expect(getByText('Ghost').style.getPropertyValue('--badge-text')).toBe('#fff');
  });

  it('falls back to a default color for an unknown type', () => {
    const { getByText } = render(<TypeBadge type="mystery" />);
    expect(getByText('Mystery').style.getPropertyValue('--badge-bg')).toBe('#9aa0b5');
  });

  it('supports the larger size', () => {
    const { getByText } = render(<TypeBadge type="water" size="md" />);
    expect(getByText('Water')).toHaveClass('badge', 'md');
  });
});
