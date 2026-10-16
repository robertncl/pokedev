import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  CheckIcon,
  ChevronRightIcon,
  CloseIcon,
  HeartIcon,
  MoonIcon,
  SearchIcon,
  SparklesIcon,
  SunIcon,
} from './Icons.jsx';

describe('Icons', () => {
  it.each([
    ['SearchIcon', SearchIcon],
    ['CloseIcon', CloseIcon],
    ['SunIcon', SunIcon],
    ['MoonIcon', MoonIcon],
    ['SparklesIcon', SparklesIcon],
    ['ChevronRightIcon', ChevronRightIcon],
    ['CheckIcon', CheckIcon],
  ])('renders %s as a decorative svg', (_, Icon) => {
    const { container } = render(<Icon />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg.querySelector('path')).toBeInTheDocument();
  });

  it('sizes outline icons and sets their stroke width', () => {
    const { container } = render(<SearchIcon size={18} stroke={2.5} />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('width', '18');
    expect(svg).toHaveAttribute('stroke-width', '2.5');
    expect(svg).toHaveAttribute('fill', 'none');
  });

  it('passes other props such as className through', () => {
    const { container } = render(<SunIcon className="if-dark" />);
    expect(container.querySelector('svg')).toHaveClass('if-dark');
  });

  it('renders HeartIcon as an outline by default', () => {
    const { container } = render(<HeartIcon />);
    expect(container.querySelector('svg')).toHaveAttribute('fill', 'none');
  });

  it('renders HeartIcon filled when filled is true', () => {
    const { container } = render(<HeartIcon filled />);
    expect(container.querySelector('svg')).toHaveAttribute('fill', 'currentColor');
  });
});
