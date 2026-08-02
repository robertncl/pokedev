import { renderWithProviders } from '../test/render.js';
import SkeletonCard from './SkeletonCard.js';

describe('SkeletonCard', () => {
  it('renders a placeholder card', async () => {
    const { toJSON } = await renderWithProviders(<SkeletonCard />);
    expect(toJSON()).toBeTruthy();
  });
});
