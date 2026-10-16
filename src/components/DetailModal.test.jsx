import { fireEvent, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import DetailModal from './DetailModal.jsx';

vi.mock('../data.js', async (importOriginal) => ({
  ...(await importOriginal()),
  fetchDetails: vi.fn(),
  prefetchDetails: vi.fn(),
}));

import { fetchDetails } from '../data.js';

const charizard = {
  height: 17,
  weight: 905,
  baseExp: 267,
  stats: [78, 84, 78, 109, 85, 100],
  abilities: [
    { name: 'blaze', hidden: false },
    { name: 'solar-power', hidden: true },
  ],
  genus: 'Flame Pokémon',
  flavor: 'Spits fire that is hot.',
  evolution: [[4], [5], [6]],
};

const never = () => new Promise(() => {});

beforeEach(() => {
  fetchDetails.mockReset();
});

function setup(props = {}) {
  const onClose = vi.fn();
  const onToggleFavorite = vi.fn();
  const onNavigate = vi.fn();
  const element = (overrides) => (
    <DetailModal
      id={6}
      isFavorite={false}
      onToggleFavorite={onToggleFavorite}
      onClose={onClose}
      onNavigate={onNavigate}
      {...props}
      {...overrides}
    />
  );
  const utils = render(element());
  const dialog = utils.getByRole('dialog', { hidden: true });
  return { ...utils, dialog, rerenderWith: (o) => utils.rerender(element(o)), onClose, onToggleFavorite, onNavigate };
}

const heroImages = (dialog) => [...dialog.querySelectorAll('.art-hero img')];

describe('DetailModal', () => {
  it('opens as a modal dialog labelled with the Pokémon name', () => {
    fetchDetails.mockImplementation(never);
    const { dialog } = setup();
    expect(dialog).toHaveAttribute('open');
    expect(dialog).toHaveAttribute('aria-label', 'Charizard details');
    expect(dialog).toHaveAttribute('closedby', 'any');
  });

  it('shows what the index already knows right away, with placeholders for the rest', () => {
    fetchDetails.mockImplementation(never);
    const { getByText, getAllByText } = setup();
    expect(getByText('#0006')).toBeInTheDocument();
    expect(getByText('Charizard')).toBeInTheDocument();
    expect(getByText('Fire')).toBeInTheDocument();
    expect(getByText('Flying')).toBeInTheDocument();
    expect(getByText('Loading Pokédex entry…')).toBeInTheDocument();
    expect(getByText('Loading evolution chain…')).toBeInTheDocument();
    expect(getAllByText('…')).toHaveLength(3);
  });

  it('renders genus, facts, abilities, stats and flavor text once loaded', async () => {
    fetchDetails.mockResolvedValue(charizard);
    const { getByText, findByText } = setup();

    await findByText('Flame Pokémon');
    expect(fetchDetails).toHaveBeenCalledWith(6);
    expect(getByText('Spits fire that is hot.')).toBeInTheDocument();
    expect(getByText('Blaze')).toBeInTheDocument();
    expect(getByText('Solar Power')).toBeInTheDocument();
    expect(getByText('· hidden')).toBeInTheDocument();
    expect(getByText('109')).toBeInTheDocument();
    expect(getByText('534')).toBeInTheDocument(); // stat total
    expect(getByText('1.7 m')).toBeInTheDocument();
    expect(getByText('90.5 kg')).toBeInTheDocument();
    expect(getByText('267')).toBeInTheDocument();
  });

  it('shows fallbacks for a missing Pokédex entry and base XP', async () => {
    fetchDetails.mockResolvedValue({ ...charizard, flavor: null, baseExp: null });
    const { findByText, getByText } = setup();
    await findByText('No Pokédex entry available.');
    expect(getByText('—')).toBeInTheDocument();
  });

  it('shows an error with a retry when details fail to load', async () => {
    fetchDetails.mockRejectedValueOnce(new Error('offline'));
    fetchDetails.mockResolvedValueOnce(charizard);
    const { findByText, getByText, getByRole } = setup();

    await findByText(/Couldn.t load details/);
    expect(getByText('No evolution data available.')).toBeInTheDocument();

    await userEvent.click(getByRole('button', { name: 'Retry', hidden: true }));
    await findByText('Spits fire that is hot.');
    expect(fetchDetails).toHaveBeenCalledTimes(2);
  });

  it('renders the evolution chain once loaded and forwards navigation', async () => {
    fetchDetails.mockResolvedValue(charizard);
    const { findByRole, onNavigate } = setup();
    await userEvent.click(await findByRole('button', { name: 'View Charmeleon', hidden: true }));
    expect(onNavigate).toHaveBeenCalledWith(5);
  });

  it('says when a Pokémon does not evolve', async () => {
    fetchDetails.mockResolvedValue({ ...charizard, evolution: [[6]] });
    const { findByText } = setup();
    await findByText('This Pokémon does not evolve.');
  });

  it('shows the thumbnail until the full-size artwork has loaded', () => {
    fetchDetails.mockImplementation(never);
    const { dialog } = setup();
    const [placeholder, full] = heroImages(dialog);
    expect(placeholder).toHaveAttribute('src', '/art/6.avif');
    expect(full).toHaveAttribute('src', expect.stringContaining('/official-artwork/6.png'));
    expect(full).toHaveAttribute('alt', 'Charizard');
    expect(full).not.toBeVisible();

    fireEvent.load(full);
    expect(heroImages(dialog)).toHaveLength(1);
    expect(heroImages(dialog)[0]).toBeVisible();
  });

  it('toggles shiny artwork, keeping the regular art up until it loads', async () => {
    fetchDetails.mockImplementation(never);
    const { dialog, getByLabelText } = setup();
    fireEvent.load(heroImages(dialog)[1]);

    const toggle = getByLabelText('Toggle shiny artwork');
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-pressed', 'true');
    const [placeholder, shiny] = heroImages(dialog);
    expect(placeholder).toHaveAttribute('src', expect.stringContaining('/official-artwork/6.png'));
    expect(shiny).toHaveAttribute('src', expect.stringContaining('/official-artwork/shiny/6.png'));

    fireEvent.load(shiny);
    expect(heroImages(dialog)).toHaveLength(1);
  });

  it('reverts to regular artwork when the shiny artwork fails to load', async () => {
    fetchDetails.mockImplementation(never);
    const { dialog, getByLabelText } = setup();
    const toggle = getByLabelText('Toggle shiny artwork');
    await userEvent.click(toggle);
    fireEvent.error(heroImages(dialog).at(-1));
    expect(toggle).toHaveAttribute('aria-pressed', 'false');
    expect(heroImages(dialog).at(-1)).toHaveAttribute('src', expect.stringContaining('/official-artwork/6.png'));
  });

  it('resets loading state and shiny when navigating to another Pokémon', async () => {
    fetchDetails.mockResolvedValueOnce(charizard).mockImplementation(never);
    const { findByText, getByText, getByLabelText, rerenderWith, dialog } = setup();
    await findByText('Flame Pokémon');
    await userEvent.click(getByLabelText('Toggle shiny artwork'));

    rerenderWith({ id: 7 });
    expect(dialog).toHaveAttribute('aria-label', 'Squirtle details');
    expect(getByText('Loading Pokédex entry…')).toBeInTheDocument();
    expect(getByLabelText('Toggle shiny artwork')).toHaveAttribute('aria-pressed', 'false');
    expect(fetchDetails).toHaveBeenLastCalledWith(7);
  });

  it('calls onToggleFavorite with the id and reflects favorite state', async () => {
    fetchDetails.mockImplementation(never);
    const { getByLabelText, onToggleFavorite, rerenderWith } = setup();
    await userEvent.click(getByLabelText('Add to favorites'));
    expect(onToggleFavorite).toHaveBeenCalledWith(6);
    rerenderWith({ isFavorite: true });
    expect(getByLabelText('Remove from favorites')).toHaveAttribute('aria-pressed', 'true');
  });

  it('closes via the close button', async () => {
    fetchDetails.mockImplementation(never);
    const { dialog, getByLabelText, onClose } = setup();
    await userEvent.click(getByLabelText('Close details'));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(dialog).not.toHaveAttribute('open');
  });

  it('routes close requests (Esc, light dismiss) through the animated close', async () => {
    fetchDetails.mockImplementation(never);
    const { dialog, onClose } = setup();
    const cancel = new Event('cancel', { cancelable: true });
    dialog.dispatchEvent(cancel);
    expect(cancel.defaultPrevented).toBe(true);
    expect(dialog).toHaveAttribute('data-closing');
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('closes on a backdrop click where closedby is unsupported, but not on clicks inside', async () => {
    fetchDetails.mockImplementation(never);
    const { dialog, getByText, onClose } = setup();
    vi.spyOn(dialog, 'getBoundingClientRect').mockReturnValue({ left: 100, right: 500, top: 100, bottom: 500 });

    fireEvent.click(getByText('Charizard'), { clientX: 300, clientY: 300 });
    fireEvent.click(dialog, { clientX: 300, clientY: 300 });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(onClose).not.toHaveBeenCalled();

    fireEvent.click(dialog, { clientX: 20, clientY: 20 });
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });
});
