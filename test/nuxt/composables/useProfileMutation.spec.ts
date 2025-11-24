import { describe, it, expect, vi, beforeEach } from 'vitest';
import { QueryClient, VueQueryPlugin, useQueryClient } from '@tanstack/vue-query';
import { mount } from '@vue/test-utils';
import { h, defineComponent } from 'vue';
import { useProfileMutation } from '@/composables/useProfileMutation';
import type { User } from '#shared/types/user';
import { createI18n } from 'vue-i18n';

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

describe('useProfileMutation', () => {
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

  const optimisticUpdateFn = vi.fn((user: User, _action: 'follow') => {
    user.followersCount += 1;
    user.relationship.following = true;
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
      const setQuerySpy = vi.spyOn(qc, 'setQueryData');
      const invalidateQueriesSpy = vi.spyOn(qc, 'invalidateQueries');

      const mutationFn = vi.fn().mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        return {};
      });
      const mutation = useProfileMutation({
        mutationFn,
        username: initialUser.username,
        optimisticUpdateFn,
      });

      await mutation.mutateAsync('follow');

      expect(setQuerySpy).toHaveBeenCalledWith(
        ['profile', initialUser.username],
        expect.objectContaining({
          followersCount: 1,
          relationship: expect.objectContaining({ following: true }),
        }),
      );

      const updated = qc.getQueryData<User>(['profile', initialUser.username]);
      expect(updated?.followersCount).toBe(1);
      expect(optimisticUpdateFn).toHaveBeenCalledWith(initialUser, 'follow');
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['profile', initialUser.username],
      });
    });
  });

  it('rolls back on error', async () => {
    runInVueContext(async () => {
      const qc = useQueryClient();
      qc.setQueryData(['profile', initialUser.username], initialUser);

      const mutationFn = vi.fn().mockRejectedValue(new Error('fail'));
      const mutation = useProfileMutation({
        mutationFn,
        username: initialUser.username,
        optimisticUpdateFn,
      });

      await mutation.mutateAsync('follow');

      const rolledBack = qc.getQueryData<User>(['profile', initialUser.username]);
      expect(rolledBack).toEqual(
        expect.objectContaining({
          followersCount: 0,
          relationship: expect.objectContaining({ following: false }),
        }),
      );
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
        username: initialUser.username,
        optimisticUpdateFn,
      });

      await mutation.mutateAsync('follow');

      expect(showToasterMock).toHaveBeenCalledWith('error', 'errors.SOME_ERROR_CODE');
    });
  });

  it('handle not having old data gracefully', async () => {
    runInVueContext(async () => {
      const qc = useQueryClient();
      const mutationFn = vi.fn().mockResolvedValue({});
      const mutation = useProfileMutation({
        mutationFn,
        username: initialUser.username,
        optimisticUpdateFn,
      });

      await mutation.mutateAsync('follow');

      const data = qc.getQueryData<User>(['profile', initialUser.username]);
      expect(data).toBeUndefined();
    });
  });

  it('handle rollback with no old data gracefully', async () => {
    runInVueContext(async () => {
      const qc = useQueryClient();
      const mutationFn = vi.fn().mockRejectedValue(new Error('fail'));
      const invalidateQueriesSpy = vi.spyOn(qc, 'invalidateQueries');
      const mutation = useProfileMutation({
        mutationFn,
        username: initialUser.username,
        optimisticUpdateFn,
      });
      await mutation.mutateAsync('follow');

      const data = qc.getQueryData<User>(['profile', initialUser.username]);
      expect(data).toBeUndefined();
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['profile', initialUser.username],
      });
    });
  });
});
