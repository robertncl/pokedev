import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import StatBar from './StatBar.jsx';

const fill = (container) => container.querySelector('.stat-fill');

describe('StatBar', () => {
  it('renders the label and raw value', () => {
    const { getByText } = render(<StatBar label="HP" value={45} />);
    expect(getByText('HP')).toBeInTheDocument();
    expect(getByText('45')).toBeInTheDocument();
  });

  it('hides the decorative bar from assistive technology', () => {
    const { container } = render(<StatBar label="HP" value={45} />);
    expect(container.querySelector('.stat-track')).toHaveAttribute('aria-hidden', 'true');
  });

  it('caps the fill at 100% for very high values', () => {
    const { container } = render(<StatBar label="Speed" value={200} />);
    expect(fill(container).style.width).toBe('100%');
  });

  it.each([
    [120, '67%'],
    [90, '50%'],
    [10, '6%'],
  ])('renders value %i at %s', (value, width) => {
    const { container } = render(<StatBar label="Atk" value={value} />);
    expect(fill(container).style.width).toBe(width);
    expect(fill(container)).not.toHaveAttribute('data-highlight');
  });

  it('marks the highlighted stat', () => {
    const { container } = render(<StatBar label="Speed" value={90} highlight />);
    expect(fill(container)).toHaveAttribute('data-highlight');
  });

  it('keeps an empty, unhighlighted bar in place while the value is loading', () => {
    const { container, getByText } = render(<StatBar label="HP" value={undefined} highlight />);
    expect(getByText('HP')).toBeInTheDocument();
    expect(fill(container).style.width).toBe('0%');
    expect(fill(container)).not.toHaveAttribute('data-highlight');
  });
});
