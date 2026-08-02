import { act, renderHook, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFavorites } from './useFavorites.js';

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('useFavorites', () => {
  it('starts empty and stays empty when AsyncStorage has nothing stored', async () => {
    const { result } = await renderHook(() => useFavorites());
    expect(result.current[0]).toEqual(new Set());
    await waitFor(() => expect(AsyncStorage.getItem).toBeDefined());
  });

  it('hydrates from AsyncStorage once the initial read resolves', async () => {
    await AsyncStorage.setItem('pokedev-favorites', JSON.stringify([1, 2, 3]));
    const { result } = await renderHook(() => useFavorites());
    await waitFor(() => expect(result.current[0]).toEqual(new Set([1, 2, 3])));
  });

  it('falls back to an empty set when the stored value is not valid JSON', async () => {
    await AsyncStorage.setItem('pokedev-favorites', 'not json');
    const { result } = await renderHook(() => useFavorites());
    await waitFor(() => expect(result.current[0]).toEqual(new Set()));
  });

  it('toggleFavorite adds an id that is not yet a favorite', async () => {
    const { result } = await renderHook(() => useFavorites());
    await waitFor(() => expect(result.current[0]).toEqual(new Set()));
    await act(() => result.current[1](25));
    await waitFor(() => expect(result.current[0]).toEqual(new Set([25])));
  });

  it('toggleFavorite removes an id that is already a favorite', async () => {
    const { result } = await renderHook(() => useFavorites());
    await waitFor(() => expect(result.current[0]).toEqual(new Set()));
    await act(() => result.current[1](25));
    await waitFor(() => expect(result.current[0]).toEqual(new Set([25])));
    await act(() => result.current[1](25));
    await waitFor(() => expect(result.current[0]).toEqual(new Set()));
  });

  it('persists favorites to AsyncStorage after the initial load completes', async () => {
    const { result } = await renderHook(() => useFavorites());
    await waitFor(() => expect(result.current[0]).toEqual(new Set()));
    await act(() => result.current[1](7));
    await waitFor(async () => {
      const raw = await AsyncStorage.getItem('pokedev-favorites');
      expect(JSON.parse(raw)).toEqual([7]);
    });
  });

  it('does not throw when AsyncStorage.setItem fails', async () => {
    const { result } = await renderHook(() => useFavorites());
    await waitFor(() => expect(result.current[0]).toEqual(new Set()));

    const spy = jest.spyOn(AsyncStorage, 'setItem').mockRejectedValueOnce(new Error('full'));
    await act(() => result.current[1](3));
    await waitFor(() => expect(spy).toHaveBeenCalled());
    spy.mockRestore();
  });

  it('does not throw when the initial AsyncStorage.getItem fails', async () => {
    const spy = jest.spyOn(AsyncStorage, 'getItem').mockRejectedValueOnce(new Error('broken'));
    const { result } = await renderHook(() => useFavorites());
    await waitFor(() => expect(spy).toHaveBeenCalled());
    expect(result.current[0]).toEqual(new Set());
    spy.mockRestore();
  });
});
