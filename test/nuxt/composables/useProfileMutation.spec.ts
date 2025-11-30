import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, VueQueryPlugin, useQueryClient } from '@tanstack/vue-query';
import { mount } from '@vue/test-utils';
import { h, defineComponent } from 'vue';
import {
  useBlockMutation,
  useFollowMutation,
  useMuteMutation,
  useProfileMutation,
} from '@/composables/useProfileMutation';
import type { CompactUser, User } from '#shared/types/user';
import { createI18n } from 'vue-i18n';
import type { ApiSuccessResponse } from '#imports';

const i18n = createI18n({
  locale: 'en',
  messages: {
    en: {
      errors: {
        UNKNOWN_ERROR: 'An unknown error occurred.',
      },
    },
  },
});
function runInVueContext(fn: () => void) {
  mount(defineComponent({ setup: fn, render: () => h('div') }), {
    global: {
      plugins: [[VueQueryPlugin, { queryClient: new QueryClient() }], i18n],
    },
  });
}

const initialUser: User = {
  username: 'john',
  displayName: 'John Doe',
  bio: 'Hello, I am John!',
  bioEntities: {
    mentions: [],
    hashtags: [],
  },
  avatarUrl: '',
  bannerUrl: '',
  location: '',
  websiteUrl: '',
  birthDate: '',
  joinedAt: '', // ISO date ''
  relationship: {
    blocking: false,
    blockedBy: false,
    muted: false,
    following: false,
    follower: false,
  },
  email: '',
  phone: '',
  followingCount: 0,
  followersCount: 0,
  languageCode: '',
};

const userInList: CompactUser = {
  username: 'john',
  displayName: 'John Doe',
  avatarUrl: '',
  bio: 'Hello, I am John!',
  bioEntities: {
    mentions: [],
    hashtags: [],
  },
  relationship: {
    blocking: false,
    blockedBy: false,
    muted: false,
    following: false,
    follower: false,
  },
};
const notSameUserInList: CompactUser = {
  username: 'jane',
  displayName: 'Jane Smith',
  avatarUrl: '',
  bio: 'Hi, I am Jane!',
  bioEntities: {
    mentions: [],
    hashtags: [],
  },
  relationship: {
    blocking: false,
    blockedBy: false,
    muted: false,
    following: false,
    follower: false,
  },
};

describe('useProfileMutation', () => {
  const optimisticUpdateFn = vi.fn((user: User, _action: string) => {
    // user.followersCount += 1;
    // user.relationship.following = true;
    const newUser = structuredClone(user);
    newUser.relationship.following = true;
    if ('followersCount' in newUser) {
      newUser.followersCount += 1;
    }
    return newUser;
  });

  beforeEach(() => {
    vi.resetAllMocks();
    initialUser.followersCount = 0;
    initialUser.relationship.following = false;
  });

  it('applies optimistic update onMutate', async () => {
    runInVueContext(async () => {
      const qc = useQueryClient();
      qc.setQueryData(['profile', initialUser.username], initialUser);
      qc.setQueryData<{
        pages: ApiSuccessResponse<CompactUser[]>[];
      }>(['user-list', 'list1'], {
        pages: [
          {
            data: [userInList, notSameUserInList],
            success: true,
          },
        ],
      });
      const setQuerySpy = vi.spyOn(qc, 'setQueryData');
      const invalidateQueriesSpy = vi.spyOn(qc, 'invalidateQueries');
      const setQueriesDataSpy = vi.spyOn(qc, 'setQueriesData');

      const mutationFn = vi.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return {};
      });
      const mutation = useProfileMutation({
        mutationFn,
        optimisticUpdateFn,
      });

      await mutation.mutateAsync({
        action: 'follow',
        username: initialUser.username,
      });

      expect(setQuerySpy).toHaveBeenCalledWith(
        ['profile', initialUser.username],
        expect.objectContaining({
          followersCount: 1,
          relationship: expect.objectContaining({ following: true }),
        }),
      );

      expect(setQueriesDataSpy).toHaveBeenCalledWith(
        { predicate: (query: { queryKey: unknown[] }) => query.queryKey[0] === 'user-list' },
        expect.any(Function),
      );

      const updated = qc.getQueryData<User>(['profile', initialUser.username]);
      expect(updated?.followersCount).toBe(1);
      expect(updated?.relationship.following).toBe(true);
      expect(optimisticUpdateFn).toHaveBeenCalledWith(initialUser, 'follow');
      expect(optimisticUpdateFn).toHaveBeenCalledTimes(2); // once for profile, once for list
      expect(optimisticUpdateFn).toHaveBeenNthCalledWith(2, userInList, 'follow');

      const updatedUserList = qc.getQueryData<{
        pages: ApiSuccessResponse<CompactUser[]>[];
      }>(['user-list', 'list1']);

      expect(updatedUserList?.pages?.[0]?.data?.[0]?.relationship.following).toBe(true);
      expect(updatedUserList?.pages?.[0]?.data?.[1]?.relationship.following).toBe(false);

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['profile', initialUser.username],
      });
    });
  });

  it('rolls back on error', async () => {
    runInVueContext(async () => {
      const qc = useQueryClient();
      const setQuerySpy = vi.spyOn(qc, 'setQueryData');
      qc.setQueryData(['profile', initialUser.username], initialUser);
      const initialUserList: {
        pages: ApiSuccessResponse<CompactUser[]>[];
      } = {
        pages: [
          {
            data: [userInList, notSameUserInList],
            success: true,
          },
        ],
      };
      qc.setQueryData<{
        pages: ApiSuccessResponse<CompactUser[]>[];
      }>(['user-list', 'list1'], initialUserList);

      const mutationFn = vi.fn().mockRejectedValue(new Error('fail'));
      const mutation = useProfileMutation({
        mutationFn,
        optimisticUpdateFn,
      });

      await mutation.mutateAsync({
        action: 'follow',
        username: initialUser.username,
      });

      const rolledBack = qc.getQueryData<User>(['profile', initialUser.username]);
      expect(rolledBack).toEqual(
        expect.objectContaining({
          followersCount: 0,
          relationship: expect.objectContaining({ following: false }),
        }),
      );
      const rolledBackUserList = qc.getQueryData<{
        pages: ApiSuccessResponse<CompactUser[]>[];
      }>(['user-list', 'list1']);
      expect(rolledBackUserList?.pages?.[0]?.data?.[0]).toEqual(
        expect.objectContaining({
          relationship: expect.objectContaining({ following: false }),
        }),
      );
      expect(setQuerySpy).toHaveBeenCalledWith(['profile', initialUser.username], initialUser);
      expect(setQuerySpy).toHaveBeenCalledWith(['user-list', 'list1'], initialUserList);
      expect(optimisticUpdateFn).toHaveBeenCalledTimes(2); // once for profile, once for list
    });
  });

  it('show toaster on error', async () => {
    const showToasterMock = vi.fn();
    vi.stubGlobal('showToaster', showToasterMock);

    runInVueContext(async () => {
      const mutationFn = vi.fn().mockRejectedValue({
        data: {
          data: {
            error: {
              code: 'SOME_ERROR_CODE',
            },
          },
        },
      });
      const mutation = useProfileMutation({
        mutationFn,
        optimisticUpdateFn,
      });

      await mutation.mutateAsync({
        action: 'follow',
        username: initialUser.username,
      });

      expect(showToasterMock).toHaveBeenCalledWith('error', 'errors.SOME_ERROR_CODE');
    });
  });

  it('handle Noop error gracefully', async () => {
    runInVueContext(async () => {
      const qc = useQueryClient();
      const mutationFn = vi.fn().mockRejectedValue({
        data: {
          data: {
            error: { code: 'ALREADY_FOLLOWING' },
          },
        },
      });
      const invalidateQueriesSpy = vi.spyOn(qc, 'invalidateQueries');
      const mutation = useProfileMutation<'follow' | 'unfollow'>({
        mutationFn,
        optimisticUpdateFn,
      });

      await mutation.mutateAsync({
        action: 'follow',
        username: initialUser.username,
      });

      // optimistic update stays
      const data = qc.getQueryData<User>(['profile', initialUser.username]);
      expect(data).toEqual(
        expect.objectContaining({
          followersCount: 1,
          relationship: expect.objectContaining({ following: true }),
        }),
      );
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['profile', initialUser.username],
      });

      const updatedUserList = qc.getQueryData<{
        pages: ApiSuccessResponse<CompactUser[]>[];
      }>(['user-list', 'list1']);
      expect(updatedUserList?.pages?.[0]?.data?.[0]).toEqual(
        expect.objectContaining({
          relationship: expect.objectContaining({ following: true }),
        }),
      );
    });
  });

  it('handle not having old data gracefully', async () => {
    runInVueContext(async () => {
      const qc = useQueryClient();
      const mutationFn = vi.fn().mockResolvedValue({});
      const mutation = useProfileMutation({
        mutationFn,
        optimisticUpdateFn,
      });

      await mutation.mutateAsync({
        action: 'follow',
        username: initialUser.username,
      });

      const data = qc.getQueryData<User>(['profile', initialUser.username]);
      expect(data).toBeUndefined();
      const updatedUserList = qc.getQueryData<{
        pages: ApiSuccessResponse<CompactUser[]>[];
      }>(['user-list', 'list1']);
      expect(updatedUserList).toBeUndefined();
    });
  });

  it('handle rollback with no old data gracefully', async () => {
    runInVueContext(async () => {
      const qc = useQueryClient();
      const mutationFn = vi.fn().mockRejectedValue(new Error('fail'));
      const invalidateQueriesSpy = vi.spyOn(qc, 'invalidateQueries');
      const mutation = useProfileMutation({
        mutationFn,
        optimisticUpdateFn,
      });
      await mutation.mutateAsync({
        action: 'follow',
        username: initialUser.username,
      });

      const data = qc.getQueryData<User>(['profile', initialUser.username]);
      expect(data).toBeUndefined();
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['profile', initialUser.username],
      });

      const updatedUserList = qc.getQueryData<{
        pages: ApiSuccessResponse<CompactUser[]>[];
      }>(['user-list', 'list1']);
      expect(updatedUserList).toBeUndefined();
    });
  });

  it('noop handle actions outside of follow/mute/block', async () => {
    runInVueContext(async () => {
      const qc = useQueryClient();
      qc.setQueryData(['profile', initialUser.username], initialUser);
      const mutationFn = vi.fn().mockRejectedValue({});
      const setQueryDataSpy = vi.spyOn(qc, 'setQueryData');
      const mutation = useProfileMutation({
        mutationFn,
        optimisticUpdateFn,
      });

      await mutation.mutateAsync({
        action: 'some-other-action' as 'follow', // force cast to satisfy type
        username: initialUser.username,
      });

      const data = qc.getQueryData<User>(['profile', initialUser.username]);
      expect(data).toEqual(initialUser);
      expect(setQueryDataSpy).toHaveBeenCalledTimes(2);
    });
  });

  it('skips invalidation when other mutations are still running', async () => {
    runInVueContext(async () => {
      const qc = useQueryClient();
      qc.setQueryData(['profile', 'john'], structuredClone(initialUser));
      const mutationFn = vi.fn().mockRejectedValue({});
      const invalidateSpy = vi.spyOn(qc, 'invalidateQueries');
      const isMutatingSpy = vi.spyOn(qc, 'isMutating');

      // Mock isMutating to return 1 (another mutation still running)
      isMutatingSpy.mockReturnValue(1);

      const mutation = useProfileMutation({
        mutationFn,
        optimisticUpdateFn,
      });
      await mutation.mutateAsync({ username: 'john', action: 'follow' });

      // Should NOT invalidate when other mutations are running
      expect(invalidateSpy).not.toHaveBeenCalled();
    });
  });

  it('performs invalidation when no other mutations are running', async () => {
    runInVueContext(async () => {
      const qc = useQueryClient();
      qc.setQueryData(['profile', 'john'], structuredClone(initialUser));
      const mutationFn = vi.fn().mockRejectedValue({});
      const invalidateSpy = vi.spyOn(qc, 'invalidateQueries');
      const isMutatingSpy = vi.spyOn(qc, 'isMutating');

      // Mock isMutating to return 0 (no other mutations running)
      isMutatingSpy.mockReturnValue(0);

      const mutation = useProfileMutation({
        mutationFn,
        optimisticUpdateFn,
      });
      await mutation.mutateAsync({ username: 'john', action: 'follow' });

      // Should invalidate when no other mutations are running
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['profile', 'john'],
      });
    });
  });
});

const profileInteractionServiceMock = vi.hoisted(() => {
  return {
    followUser: vi.fn(),
    unfollowUser: vi.fn(),
    muteUser: vi.fn(),
    unmuteUser: vi.fn(),
    blockUser: vi.fn(),
    unblockUser: vi.fn(),
  };
});

vi.mock('@/services/profileInteractionService', () => {
  return {
    profileInteractionService: profileInteractionServiceMock,
  };
});

describe('useFollowMutation', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    initialUser.followersCount = 0;
    initialUser.relationship.following = false;
  });
  it('calls followUser service and updates user optimistically', async () => {
    runInVueContext(async () => {
      const qc = useQueryClient();
      qc.setQueryData(['profile', 'john'], initialUser);

      const mutation = useFollowMutation();
      await mutation.mutateAsync({ username: 'john', action: 'follow' });

      expect(profileInteractionServiceMock.followUser).toHaveBeenCalledWith('john');

      const updated = qc.getQueryData<User>(['profile', 'john']);
      expect(updated?.relationship.following).toBe(true);
      expect(updated?.followersCount).toBe(11);
    });
  });

  it('calls unfollowUser service and updates user optimistically', async () => {
    runInVueContext(async () => {
      const qc = useQueryClient();
      const followedUser = structuredClone(initialUser);
      followedUser.relationship.following = true;
      followedUser.followersCount = 10;
      qc.setQueryData(['profile', 'john'], followedUser);

      const mutation = useFollowMutation();
      await mutation.mutateAsync({ username: 'john', action: 'unfollow' });

      expect(profileInteractionServiceMock.unfollowUser).toHaveBeenCalledWith('john');

      const updated = qc.getQueryData<User>(['profile', 'john']);
      expect(updated?.relationship.following).toBe(false);
      expect(updated?.followersCount).toBe(9);
    });
  });

  it('rolls back on error', async () => {
    runInVueContext(async () => {
      const qc = useQueryClient();
      qc.setQueryData(['profile', 'john'], initialUser);

      vi.spyOn(profileInteractionServiceMock, 'followUser').mockRejectedValue(new Error('fail'));

      const mutation = useFollowMutation();
      await mutation.mutateAsync({ username: 'john', action: 'follow' });

      const rolledBack = qc.getQueryData<User>(['profile', 'john']);
      expect(rolledBack).toEqual(
        expect.objectContaining({
          followersCount: 0,
          relationship: expect.objectContaining({ following: false }),
        }),
      );
    });
  });

  it('handles noop follow error gracefully', async () => {
    runInVueContext(async () => {
      const qc = useQueryClient();
      qc.setQueryData(['profile', 'john'], initialUser);

      profileInteractionServiceMock.followUser.mockRejectedValue({
        data: {
          data: {
            error: { code: 'ALREADY_FOLLOWING' },
          },
        },
      });

      const mutation = useFollowMutation();
      await mutation.mutateAsync({ username: 'john', action: 'follow' });

      const data = qc.getQueryData<User>(['profile', 'john']);
      expect(data).toEqual(
        expect.objectContaining({
          followersCount: 1,
          relationship: expect.objectContaining({ following: true }),
        }),
      );
    });
  });

  it('handles noop unfollow error gracefully', async () => {
    runInVueContext(async () => {
      const qc = useQueryClient();
      const followedUser = structuredClone(initialUser);
      followedUser.relationship.following = true;
      followedUser.followersCount = 10;
      qc.setQueryData(['profile', 'john'], followedUser);

      profileInteractionServiceMock.unfollowUser.mockRejectedValue({
        data: {
          data: {
            error: { code: 'ALREADY_NOT_FOLLOWING' },
          },
        },
      });

      const mutation = useFollowMutation();
      await mutation.mutateAsync({ username: 'john', action: 'unfollow' });

      const data = qc.getQueryData<User>(['profile', 'john']);
      expect(data).toEqual(
        expect.objectContaining({
          followersCount: 9,
          relationship: expect.objectContaining({ following: false }),
        }),
      );
    });
  });

  it('handles case-insensitive usernames', async () => {
    runInVueContext(async () => {
      const mutation = useFollowMutation();
      await mutation.mutateAsync({ username: 'JoHn', action: 'follow' });

      expect(profileInteractionServiceMock.followUser).toHaveBeenCalledWith('john');
    });
  });
});

describe('useMuteMutation', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('calls muteUser service and updates user optimistically', async () => {
    runInVueContext(async () => {
      const qc = useQueryClient();
      qc.setQueryData(['profile', 'john'], initialUser);

      const mutation = useMuteMutation();
      await mutation.mutateAsync({ username: 'john', action: 'mute' });

      expect(profileInteractionServiceMock.muteUser).toHaveBeenCalledWith('john');

      const updated = qc.getQueryData<User>(['profile', 'john']);
      expect(updated?.relationship.muted).toBe(true);
    });
  });

  it('calls unmuteUser service and updates user optimistically', async () => {
    runInVueContext(async () => {
      const qc = useQueryClient();
      const mutedUser = structuredClone(initialUser);
      mutedUser.relationship.muted = true;
      qc.setQueryData(['profile', 'john'], mutedUser);

      const mutation = useMuteMutation();
      await mutation.mutateAsync({ username: 'john', action: 'unmute' });

      expect(profileInteractionServiceMock.unmuteUser).toHaveBeenCalledWith('john');

      const updated = qc.getQueryData<User>(['profile', 'john']);
      expect(updated?.relationship.muted).toBe(false);
    });
  });

  it('rolls back on error', async () => {
    runInVueContext(async () => {
      const qc = useQueryClient();
      qc.setQueryData(['profile', 'john'], initialUser);

      vi.spyOn(profileInteractionServiceMock, 'muteUser').mockRejectedValue(new Error('fail'));

      const mutation = useMuteMutation();
      await mutation.mutateAsync({ username: 'john', action: 'mute' });

      const rolledBack = qc.getQueryData<User>(['profile', 'john']);
      expect(rolledBack).toEqual(
        expect.objectContaining({
          relationship: expect.objectContaining({ muted: false }),
        }),
      );
    });
  });

  it('handles noop mute error gracefully', async () => {
    runInVueContext(async () => {
      const qc = useQueryClient();
      qc.setQueryData(['profile', 'john'], initialUser);

      profileInteractionServiceMock.muteUser.mockRejectedValue({
        data: {
          data: {
            error: { code: 'ALREADY_MUTED' },
          },
        },
      });

      const mutation = useMuteMutation();
      await mutation.mutateAsync({ username: 'john', action: 'mute' });

      const data = qc.getQueryData<User>(['profile', 'john']);
      expect(data).toEqual(
        expect.objectContaining({
          relationship: expect.objectContaining({ muted: true }),
        }),
      );
    });
  });

  it('handles noop unmute error gracefully', async () => {
    runInVueContext(async () => {
      const qc = useQueryClient();
      const mutedUser = structuredClone(initialUser);
      mutedUser.relationship.muted = true;
      qc.setQueryData(['profile', 'john'], mutedUser);

      profileInteractionServiceMock.unmuteUser.mockRejectedValue({
        data: {
          data: {
            error: { code: 'NOT_MUTED' },
          },
        },
      });

      const mutation = useMuteMutation();
      await mutation.mutateAsync({ username: 'john', action: 'unmute' });

      const data = qc.getQueryData<User>(['profile', 'john']);
      expect(data).toEqual(
        expect.objectContaining({
          relationship: expect.objectContaining({ muted: false }),
        }),
      );
    });
  });

  it('handles case-insensitive usernames', async () => {
    runInVueContext(async () => {
      const mutation = useMuteMutation();
      await mutation.mutateAsync({ username: 'JoHn', action: 'mute' });

      expect(profileInteractionServiceMock.muteUser).toHaveBeenCalledWith('john');
    });
  });
});

describe('useBlockMutation', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('calls blockUser service and updates user optimistically', async () => {
    runInVueContext(async () => {
      const qc = useQueryClient();
      qc.setQueryData(['profile', 'john'], initialUser);

      const mutation = useBlockMutation();
      await mutation.mutateAsync({ username: 'john', action: 'block' });

      expect(profileInteractionServiceMock.blockUser).toHaveBeenCalledWith('john');

      const updated = qc.getQueryData<User>(['profile', 'john']);
      expect(updated?.relationship.blocking).toBe(true);
      expect(updated?.relationship.following).toBe(false);
    });
  });

  it('calls unblockUser service and updates user optimistically', async () => {
    runInVueContext(async () => {
      const qc = useQueryClient();
      const blockedUser = structuredClone(initialUser);
      blockedUser.relationship.blocking = true;
      qc.setQueryData(['profile', 'john'], blockedUser);

      const mutation = useBlockMutation();
      await mutation.mutateAsync({ username: 'john', action: 'unblock' });

      expect(profileInteractionServiceMock.unblockUser).toHaveBeenCalledWith('john');

      const updated = qc.getQueryData<User>(['profile', 'john']);
      expect(updated?.relationship.blocking).toBe(false);
      expect(updated?.relationship.following).toBe(false);
    });
  });

  it('handle noop block error gracefully', async () => {
    runInVueContext(async () => {
      const qc = useQueryClient();
      qc.setQueryData(['profile', 'john'], initialUser);

      profileInteractionServiceMock.blockUser.mockRejectedValue({
        data: {
          data: {
            error: { code: 'ALREADY_BLOCKING' },
          },
        },
      });

      const mutation = useBlockMutation();
      await mutation.mutateAsync({ username: 'john', action: 'block' });

      const data = qc.getQueryData<User>(['profile', 'john']);
      expect(data).toEqual(
        expect.objectContaining({
          relationship: expect.objectContaining({ blocking: true }),
        }),
      );
    });
  });

  it('handle noop unblock error gracefully', async () => {
    runInVueContext(async () => {
      const qc = useQueryClient();
      const blockedUser = structuredClone(initialUser);
      blockedUser.relationship.blocking = true;
      qc.setQueryData(['profile', 'john'], blockedUser);

      profileInteractionServiceMock.unblockUser.mockRejectedValue({
        data: {
          data: {
            error: { code: 'NOT_BLOCKING' },
          },
        },
      });

      const mutation = useBlockMutation();
      await mutation.mutateAsync({ username: 'john', action: 'unblock' });

      const data = qc.getQueryData<User>(['profile', 'john']);
      expect(data).toEqual(
        expect.objectContaining({
          relationship: expect.objectContaining({ blocking: false }),
        }),
      );
    });
  });

  it('rolls back on error', async () => {
    runInVueContext(async () => {
      const qc = useQueryClient();
      qc.setQueryData(['profile', 'john'], initialUser);

      profileInteractionServiceMock.blockUser.mockRejectedValue(new Error('fail'));

      const mutation = useBlockMutation();
      await mutation.mutateAsync({ username: 'john', action: 'block' });

      const rolledBack = qc.getQueryData<User>(['profile', 'john']);
      expect(rolledBack).toEqual(
        expect.objectContaining({ relationship: expect.objectContaining({ blocking: false }) }),
      );
    });
  });

  it('handles case-insensitive usernames', async () => {
    runInVueContext(async () => {
      const mutation = useBlockMutation();
      await mutation.mutateAsync({ username: 'JoHn', action: 'block' });

      expect(profileInteractionServiceMock.blockUser).toHaveBeenCalledWith('john');
    });
  });
});
