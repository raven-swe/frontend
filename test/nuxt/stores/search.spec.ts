import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useSearchStore } from '@/stores/search';

describe('Search Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('has correct initial state', () => {
    const store = useSearchStore();

    expect(store.searchQuery).toBe('');
    expect(store.excludeMutedAndBlocked).toBe(true);
  });

  it('setSearchQuery updates searchQuery state', () => {
    const store = useSearchStore();

    expect(store.searchQuery).toBe('');

    store.setSearchQuery('JavaScript');
    expect(store.searchQuery).toBe('JavaScript');

    store.setSearchQuery('TypeScript');
    expect(store.searchQuery).toBe('TypeScript');

    store.setSearchQuery('');
    expect(store.searchQuery).toBe('');
  });

  it('setexcludeMutedAndBlocked updates excludeMutedAndBlocked state', () => {
    const store = useSearchStore();

    expect(store.excludeMutedAndBlocked).toBe(true);

    store.setexcludeMutedAndBlocked(false);
    expect(store.excludeMutedAndBlocked).toBe(false);

    store.setexcludeMutedAndBlocked(true);
    expect(store.excludeMutedAndBlocked).toBe(true);
  });

  it('multiple actions work together correctly', () => {
    const store = useSearchStore();

    store.setSearchQuery('test query');
    store.setexcludeMutedAndBlocked(false);

    expect(store.searchQuery).toBe('test query');
    expect(store.excludeMutedAndBlocked).toBe(false);

    store.setSearchQuery('another query');
    store.setexcludeMutedAndBlocked(true);

    expect(store.searchQuery).toBe('another query');
    expect(store.excludeMutedAndBlocked).toBe(true);
  });

  it('handles empty string in setSearchQuery', () => {
    const store = useSearchStore();

    store.setSearchQuery('test');
    expect(store.searchQuery).toBe('test');

    store.setSearchQuery('');
    expect(store.searchQuery).toBe('');
  });

  it('preserves state between action calls', () => {
    const store = useSearchStore();

    store.setSearchQuery('persistent query');
    store.setexcludeMutedAndBlocked(false);

    // Call another action
    store.setSearchQuery('new query');

    // excludeMutedAndBlocked should still be false
    expect(store.excludeMutedAndBlocked).toBe(false);
    expect(store.searchQuery).toBe('new query');
  });
});
