import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, VueQueryPlugin, useQueryClient } from '@tanstack/vue-query';
import { mount } from '@vue/test-utils';
import { h, defineComponent } from 'vue';
import { useProfileMutation } from '@/composables/useProfileMutation';
import type { ApiSuccessResponse } from '#shared/types/api';
import type { User } from '#shared/types/user';

function runInVueContext(fn: () => void) {
  mount(defineComponent({ setup: fn, render: () => h('div') }), {
    global: {
      plugins: [[VueQueryPlugin, { queryClient: new QueryClient() }]],
    },
  });
}

describe('useProfileMutation', () => {
  const initialUser: ApiSuccessResponse<User> = {
    success: true,
    message: 'User profile fetched successfully',
    data: {
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
    },
  };

  const optimisticUpdateFn = vi.fn((user: User, _action: 'follow') => {
    user.followersCount += 1;
    user.relationship.following = true;
  });

  beforeEach(() => {
    vi.resetAllMocks();
    initialUser.data.followersCount = 0;
    initialUser.data.relationship.following = false;
  });

  it('applies optimistic update onMutate', async () => {
    runInVueContext(async () => {
      const qc = useQueryClient();
      qc.setQueryData(['profile', initialUser.data.username], initialUser);
      const setQuerySpy = vi.spyOn(qc, 'setQueryData');
      const invalidateQueriesSpy = vi.spyOn(qc, 'invalidateQueries');

      const mutationFn = vi.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return {};
      });
      const mutation = useProfileMutation({
        mutationFn,
        username: initialUser.data.username,
        optimisticUpdateFn,
      });

      mutation.mutate('follow');

      expect(setQuerySpy).toHaveBeenCalledWith(
        ['profile', initialUser.data.username],
        expect.objectContaining({
          data: expect.objectContaining({
            followersCount: 1,
            relationship: expect.objectContaining({ following: true }),
          }),
        }),
      );

      const updated = qc.getQueryData<ApiSuccessResponse<User>>([
        'profile',
        initialUser.data.username,
      ]);
      expect(updated?.data.followersCount).toBe(1);
      expect(optimisticUpdateFn).toHaveBeenCalledWith(initialUser.data, 'follow');
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['profile', initialUser.data.username],
      });
    });
  });

  it('rolls back on error', async () => {
    runInVueContext(async () => {
      const qc = useQueryClient();
      qc.setQueryData(['profile', initialUser.data.username], initialUser);

      const mutationFn = vi.fn().mockRejectedValue(new Error('fail'));
      const mutation = useProfileMutation({
        mutationFn,
        username: initialUser.data.username,
        optimisticUpdateFn,
      });

      await mutation.mutate('follow');

      const rolledBack = qc.getQueryData(['profile', initialUser.data.username]);
      expect(rolledBack).toEqual(
        expect.objectContaining({
          data: expect.objectContaining({
            followersCount: 0,
            relationship: expect.objectContaining({ following: false }),
          }),
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
        username: initialUser.data.username,
        optimisticUpdateFn,
      });

      await mutation.mutate('follow');

      const data = qc.getQueryData(['profile', initialUser.data.username]);
      expect(data).toBeUndefined();
    });
  });

  it('handle rollback with no old data gracefully', async () => {
    runInVueContext(async () => {
      const qc = useQueryClient();
      const mutationFn = vi.fn().mockRejectedValue(new Error('fail'));
      const mutation = useProfileMutation({
        mutationFn,
        username: initialUser.data.username,
        optimisticUpdateFn,
      });
      await mutation.mutate('follow');

      const data = qc.getQueryData(['profile', initialUser.data.username]);
      expect(data).toBeUndefined();
    });
  });
});
