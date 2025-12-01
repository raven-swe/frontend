export function useDmHighlight() {
  const highlightedIds = useState<Set<string>>('dm-highlighted-ids', () => new Set());

  const addHighlight = (conversationId: string) => {
    highlightedIds.value.add(conversationId);
  };

  const removeHighlight = (conversationId: string) => {
    highlightedIds.value.delete(conversationId);
  };

  const isHighlighted = (conversationId: string) => {
    return highlightedIds.value.has(conversationId);
  };

  return {
    highlightedIds,
    addHighlight,
    removeHighlight,
    isHighlighted,
  };
}
