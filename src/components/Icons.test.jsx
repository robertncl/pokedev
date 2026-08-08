import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  CloseIcon,
  HeartIcon,
  MoonIcon,
  SearchIcon,
  SparklesIcon,
  SunIcon,
} from './Icons.jsx';

describe('Icons', () => {
  it('renders SearchIcon as an svg', () => {
    const { container } = render(<SearchIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders CloseIcon as an svg', () => {
    const { container } = render(<CloseIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders HeartIcon unfilled by default', () => {
    const { container } = render(<HeartIcon />);
    expect(container.querySelector('svg')).toHaveAttribute('fill', 'none');
  });

  it('renders HeartIcon filled when filled is true', () => {
    const { container } = render(<HeartIcon filled />);
    expect(container.querySelector('svg')).toHaveAttribute('fill', 'currentColor');
  });

  it('renders SunIcon as an svg', () => {
    const { container } = render(<SunIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders MoonIcon as an svg', () => {
    const { container } = render(<MoonIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });

  it('renders SparklesIcon as an svg', () => {
    const { container } = render(<SparklesIcon />);
    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
