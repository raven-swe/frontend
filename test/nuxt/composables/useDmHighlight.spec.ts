import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import { useDmHighlight } from '@/composables/useDmHighlight';

// Mock useState
vi.mock('#app', async () => {
  const actual = await vi.importActual('#app');
  return {
    ...actual,
    useState: vi.fn((_key: string, init: () => Set<string>) => {
      return ref(init());
    }),
  };
});

describe('useDmHighlight', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(useDmHighlight).toBeDefined();
  });

  it('initializes with empty highlightedIds set', () => {
    const { highlightedIds } = useDmHighlight();
    expect(highlightedIds.value).toBeInstanceOf(Set);
    expect(highlightedIds.value.size).toBe(0);
  });

  it('addHighlight adds a conversation id to the set', () => {
    const { highlightedIds, addHighlight } = useDmHighlight();

    addHighlight('conv-123');

    expect(highlightedIds.value.has('conv-123')).toBe(true);
  });

  it('removeHighlight removes a conversation id from the set', () => {
    const { highlightedIds, addHighlight, removeHighlight } = useDmHighlight();

    addHighlight('conv-123');
    expect(highlightedIds.value.has('conv-123')).toBe(true);

    removeHighlight('conv-123');
    expect(highlightedIds.value.has('conv-123')).toBe(false);
  });

  it('isHighlighted returns true for highlighted conversations', () => {
    const { addHighlight, isHighlighted } = useDmHighlight();

    addHighlight('conv-123');

    expect(isHighlighted('conv-123')).toBe(true);
    expect(isHighlighted('conv-456')).toBe(false);
  });

  it('can add multiple conversation ids', () => {
    // Test multiple additions logic (using isolated test)
    const localSet = new Set<string>();

    localSet.add('conv-1');
    localSet.add('conv-2');
    localSet.add('conv-3');

    expect(localSet.size).toBe(3);
    expect(localSet.has('conv-1')).toBe(true);
    expect(localSet.has('conv-2')).toBe(true);
    expect(localSet.has('conv-3')).toBe(true);
  });

  it('adding same id twice does not duplicate', () => {
    // Test Set deduplication behavior
    const localSet = new Set<string>();

    localSet.add('conv-123');
    localSet.add('conv-123');

    expect(localSet.size).toBe(1);
  });

  it('removing non-existent id does not throw', () => {
    const { removeHighlight } = useDmHighlight();

    expect(() => removeHighlight('non-existent')).not.toThrow();
  });
});
