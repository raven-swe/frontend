/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';
import {
  useDmConversations,
  updateConversationLastMessage,
  markConversationSeenInCache,
} from '@/composables/useDmConversations';
import { apiFetch } from '~/api';
import { useInfiniteQuery, useQueryClient } from '@tanstack/vue-query';

// Mocks
vi.mock('~/api', () => ({
  apiFetch: vi.fn(),
}));

vi.mock('@tanstack/vue-query', () => ({
  useInfiniteQuery: vi.fn(),
  useQueryClient: vi.fn(),
}));

describe('useDmConversations', () => {
  const mockSetQueryData = vi.fn();
  const mockQueryClient = {
    setQueryData: mockSetQueryData,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useQueryClient).mockReturnValue(mockQueryClient as any);
    vi.mocked(useInfiniteQuery).mockReturnValue({
      data: ref(undefined),
      isPending: ref(false),
      error: ref(null),
      refetch: vi.fn(),
      fetchNextPage: vi.fn(),
      hasNextPage: ref(false),
      isFetchingNextPage: ref(false),
    } as any);
  });

  describe('updateConversationLastMessage', () => {
    it('updates the conversation last message in cache', () => {
      const conversationId = 'conv-1';
      const lastMessage = {
        content: 'New message',
        senderUsername: 'user1',
        sentAt: '2024-01-01T10:00:00Z',
        seen: false,
      };

      // Mock setQueryData implementation to execute the updater
      mockSetQueryData.mockImplementation((key, updater) => {
        const oldData = {
          pages: [
            {
              success: true,
              data: [
                { id: 'conv-1', lastMessage: null },
                { id: 'conv-2', lastMessage: null },
              ],
            },
          ],
          pageParams: [],
        };
        // updater might expect oldData to be defining the recursive structure, but here we just pass our mock data
        return updater(oldData);
      });

      updateConversationLastMessage(mockQueryClient as any, conversationId, lastMessage);

      expect(mockSetQueryData).toHaveBeenCalledWith(['dm-conversations'], expect.any(Function));

      // Verify implementation correctness
      const updater = mockSetQueryData.mock?.calls?.[0]?.[1];
      const oldData = {
        pages: [
          {
            success: true,
            data: [
              { id: 'conv-1', lastMessage: null },
              { id: 'conv-2', lastMessage: null },
            ],
          },
        ],
        pageParams: [],
      };

      const newData = updater(oldData);
      const updatedConv = newData.pages[0].data.find((c: any) => c.id === 'conv-1');
      expect(updatedConv.lastMessage).toEqual(lastMessage);

      const otherConv = newData.pages[0].data.find((c: any) => c.id === 'conv-2');
      expect(otherConv.lastMessage).toBeNull();
    });

    it('handles missing oldData', () => {
      mockSetQueryData.mockImplementation((key, updater) => updater(undefined));
      updateConversationLastMessage(mockQueryClient as any, 'conv-1', {} as any);

      const updater = mockSetQueryData.mock?.calls?.[0]?.[1];
      expect(updater(undefined)).toBeUndefined();
    });
  });

  describe('markConversationSeenInCache', () => {
    it('marks conversation as seen in cache', () => {
      const conversationId = 'conv-1';

      mockSetQueryData.mockImplementation(() => {});
      markConversationSeenInCache(mockQueryClient as any, conversationId);

      expect(mockSetQueryData).toHaveBeenCalledWith(['dm-conversations'], expect.any(Function));

      const updater = mockSetQueryData.mock?.calls?.[0]?.[1];
      const oldData = {
        pages: [
          {
            success: true,
            data: [{ id: 'conv-1', lastMessage: { seen: false, content: 'hi' } }],
          },
        ],
        pageParams: [],
      };

      const newData = updater(oldData);
      const updatedConv = newData.pages[0].data[0];
      expect(updatedConv.lastMessage.seen).toBe(true);
    });

    it('handles conversation with no lastMessage', () => {
      const conversationId = 'conv-1';
      mockSetQueryData.mockImplementation(() => {});
      markConversationSeenInCache(mockQueryClient as any, conversationId);

      const updater = mockSetQueryData.mock?.calls?.[0]?.[1];
      const oldData = {
        pages: [{ success: true, data: [{ id: 'conv-1', lastMessage: null }] }],
      };

      const newData = updater(oldData);
      expect(newData.pages[0].data[0].lastMessage).toBeNull();
    });
  });

  describe('useDmConversations', () => {
    it('initializes useInfiniteQuery with correct options', () => {
      useDmConversations();

      expect(useInfiniteQuery).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: ['dm-conversations'],
          initialPageParam: undefined,
        }),
      );
    });

    it('queryFn calls apiFetch with correct params', async () => {
      useDmConversations();
      const options = vi.mocked(useInfiniteQuery).mock?.calls?.[0]?.[0] as any;
      const queryFn = options.queryFn;

      const mockResponse = { success: true, data: [] };
      vi.mocked(apiFetch).mockResolvedValue(mockResponse);

      const result = await queryFn({ pageParam: 'cursor-123' });

      expect(apiFetch).toHaveBeenCalledWith('/api/conversations', {
        method: 'GET',
        query: {
          cursor: 'cursor-123',
          limit: 20,
        },
      });
      expect(result).toBe(mockResponse);
    });

    it('getNextPageParam returns nextCursor if available', () => {
      useDmConversations();
      const options = vi.mocked(useInfiniteQuery).mock?.calls?.[0]?.[0] as any;
      const getNextPageParam = options.getNextPageParam;

      const lastPage = { pagination: { hasNextPage: true, nextCursor: 'next-123' } };
      expect(getNextPageParam(lastPage)).toBe('next-123');
    });

    it('getNextPageParam returns undefined if no next page', () => {
      useDmConversations();
      const options = vi.mocked(useInfiniteQuery).mock?.calls?.[0]?.[0] as any;
      const getNextPageParam = options.getNextPageParam;

      const lastPage = { pagination: { hasNextPage: false } };
      expect(getNextPageParam(lastPage)).toBeUndefined();
    });

    it('computes sortedConversations correctly', () => {
      const dataRef = ref({
        pages: [
          {
            data: [
              { id: 'c1', lastMessage: { sentAt: '2023-01-01' } },
              { id: 'c2', lastMessage: { sentAt: '2023-01-02' } }, // Newer
            ],
          },
        ],
      });

      vi.mocked(useInfiniteQuery).mockReturnValue({
        data: dataRef,
        isPending: ref(false),
        error: ref(null),
        refetch: vi.fn(),
        fetchNextPage: vi.fn(),
        hasNextPage: ref(false),
        isFetchingNextPage: ref(false),
      } as any);

      const { conversations } = useDmConversations();

      expect(conversations.value).toHaveLength(2);
      expect(conversations.value[0].id).toBe('c2');
      expect(conversations.value[1].id).toBe('c1');
    });

    it('handles empty data in sortedConversations', () => {
      vi.mocked(useInfiniteQuery).mockReturnValue({
        data: ref(undefined), // null data
        isPending: ref(false),
        error: ref(null),
        refetch: vi.fn(),
        fetchNextPage: vi.fn(),
        hasNextPage: ref(false),
        isFetchingNextPage: ref(false),
      } as any);

      const { conversations } = useDmConversations();
      expect(conversations.value).toEqual([]);
    });

    it('handles sorting with missing lastMessage/sentAt', () => {
      const dataRef = ref({
        pages: [
          {
            data: [
              { id: 'c1', lastMessage: null },
              { id: 'c2', lastMessage: { sentAt: '2023-01-02' } },
              { id: 'c3', lastMessage: { sentAt: null } },
            ],
          },
        ],
      });

      vi.mocked(useInfiniteQuery).mockReturnValue({
        data: dataRef,
        isPending: ref(false),
        error: ref(null),
        refetch: vi.fn(),
        fetchNextPage: vi.fn(),
        hasNextPage: ref(false),
        isFetchingNextPage: ref(false),
      } as any);

      const { conversations } = useDmConversations();
      expect(conversations.value[0].id).toBe('c2');
    });
  });
});
