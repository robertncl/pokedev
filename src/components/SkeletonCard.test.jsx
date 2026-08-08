import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test/render.jsx';
import SkeletonCard from './SkeletonCard.jsx';

describe('SkeletonCard', () => {
  it('renders a hidden placeholder card', () => {
    const { container } = renderWithProviders(<SkeletonCard />);
    const card = container.querySelector('[aria-hidden="true"]');
    expect(card).toBeInTheDocument();
  });
});
