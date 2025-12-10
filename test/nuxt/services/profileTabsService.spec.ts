import { registerEndpoint } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { profileTabsService } from '@/services/profile/profileTabsService';

const apiModule = await import('~/api');
const { DEFAULT_PAGE_SIZE } = await import('~/constants/pagination');

describe('profileTabsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    vi.resetModules();
  });

  it('calls apiFetch correctly for getProfile', async () => {
    registerEndpoint('/api/users/john/profile', () => ({
      data: { id: 'user1', username: 'john' },
    }));

    const apiFetchSpy = vi.spyOn(apiModule, 'apiFetch');
    const controller = new AbortController();

    const result = await profileTabsService.getProfile('john', controller.signal);

    expect(result).toEqual({ id: 'user1', username: 'john' });

    expect(apiFetchSpy).toHaveBeenCalledWith('/api/users/john/profile', {
      method: 'GET',
      signal: controller.signal,
    });
  });

  it('calls apiFetch correctly for getProfileTweetsPaginated with tab "" (tweets)', async () => {
    registerEndpoint('/api/users/john/tweets', () => ({
      data: [{ id: 't1' }],
      pagination: { cursor: '0', nextCursor: '2', hasNextPage: true },
    }));

    const apiFetchSpy = vi.spyOn(apiModule, 'apiFetch');
    const result = await profileTabsService.getProfileTweetsPaginated('john', 'tweets', '0', 5);

    expect(result).toEqual({
      data: [{ id: 't1' }],
      pagination: { cursor: '0', nextCursor: '2', hasNextPage: true },
    });

    expect(apiFetchSpy).toHaveBeenCalledWith('/api/users/john/tweets', {
      method: 'GET',
      query: {
        cursor: '0',
        limit: '5',
      },
    });
  });

  it('calls apiFetch correctly for getProfileTweetsPaginated with non-empty tab', async () => {
    registerEndpoint('/api/users/john/replies', () => ({
      data: [{ id: 'r1' }],
      pagination: { cursor: '0', nextCursor: '2', hasNextPage: true },
    }));

    const apiFetchSpy = vi.spyOn(apiModule, 'apiFetch');
    const result = await profileTabsService.getProfileTweetsPaginated(
      'john',
      'replies',
      null,
      undefined,
    );

    expect(result).toEqual({
      data: [{ id: 'r1' }],
      pagination: { cursor: '0', nextCursor: '2', hasNextPage: true },
    });

    expect(apiFetchSpy).toHaveBeenCalledWith('/api/users/john/replies', {
      method: 'GET',
      query: {
        cursor: null,
        limit: DEFAULT_PAGE_SIZE.toString(),
      },
    });
  });

  it('calls apiFetch correctly for getFollowersPaginated with explicit limit', async () => {
    registerEndpoint('/api/users/john/followers', () => ({
      data: [{ id: 'f1' }],
      pagination: { cursor: '0', nextCursor: '2', hasNextPage: true },
    }));

    const apiFetchSpy = vi.spyOn(apiModule, 'apiFetch');
    const controller = new AbortController();

    const result = await profileTabsService.getFollowersPaginated({
      username: 'john',
      cursor: '0',
      limit: 3,
      signal: controller.signal,
    });

    expect(result).toEqual({
      data: [{ id: 'f1' }],
      pagination: { cursor: '0', nextCursor: '2', hasNextPage: true },
    });

    expect(apiFetchSpy).toHaveBeenCalledWith('/api/users/john/followers', {
      method: 'GET',
      query: {
        cursor: '0',
        limit: '3',
      },
      signal: controller.signal,
    });
  });

  it('uses default limit in getFollowersPaginated when limit is not provided', async () => {
    registerEndpoint('/api/users/john/followers', () => ({
      data: [{ id: 'f2' }],
      pagination: { cursor: '0', nextCursor: '2', hasNextPage: true },
    }));

    const apiFetchSpy = vi.spyOn(apiModule, 'apiFetch');

    const result = await profileTabsService.getFollowersPaginated({
      username: 'john',
      cursor: null,
    });

    expect(result).toEqual({
      data: [{ id: 'f2' }],
      pagination: { cursor: '0', nextCursor: '2', hasNextPage: true },
    });

    expect(apiFetchSpy).toHaveBeenCalledWith('/api/users/john/followers', {
      method: 'GET',
      query: {
        cursor: null,
        limit: DEFAULT_PAGE_SIZE.toString(),
      },
      signal: undefined,
    });
  });

  it('calls apiFetch correctly for getFollowingPaginated with explicit limit', async () => {
    registerEndpoint('/api/users/john/following', () => ({
      data: [{ id: 'f1' }],
      pagination: { cursor: '0', nextCursor: '2', hasNextPage: true },
    }));

    const apiFetchSpy = vi.spyOn(apiModule, 'apiFetch');
    const controller = new AbortController();

    const result = await profileTabsService.getFollowingPaginated({
      username: 'john',
      cursor: '0',
      limit: 4,
      signal: controller.signal,
    });

    expect(result).toEqual({
      data: [{ id: 'f1' }],
      pagination: { cursor: '0', nextCursor: '2', hasNextPage: true },
    });

    expect(apiFetchSpy).toHaveBeenCalledWith('/api/users/john/following', {
      method: 'GET',
      query: {
        cursor: '0',
        limit: '4',
      },
      signal: controller.signal,
    });
  });

  it('uses default limit in getFollowingPaginated when limit is not provided', async () => {
    registerEndpoint('/api/users/john/following', () => ({
      data: [{ id: 'f3' }],
      pagination: { cursor: '0', nextCursor: '2', hasNextPage: true },
    }));

    const apiFetchSpy = vi.spyOn(apiModule, 'apiFetch');

    const result = await profileTabsService.getFollowingPaginated({
      username: 'john',
      cursor: null,
    });

    expect(result).toEqual({
      data: [{ id: 'f3' }],
      pagination: { cursor: '0', nextCursor: '2', hasNextPage: true },
    });

    expect(apiFetchSpy).toHaveBeenCalledWith('/api/users/john/following', {
      method: 'GET',
      query: {
        cursor: null,
        limit: DEFAULT_PAGE_SIZE.toString(),
      },
      signal: undefined,
    });
  });

  it('calls apiFetch correctly for getFollowerMutualFollowers', async () => {
    registerEndpoint('/api/users/john/mutual', () => ({
      data: [{ id: 'm1' }],
      pagination: { cursor: '0', nextCursor: '2', hasNextPage: true },
    }));

    const apiFetchSpy = vi.spyOn(apiModule, 'apiFetch');
    const controller = new AbortController();

    const result = await profileTabsService.getMutualFollowersPaginated({
      username: 'john',
      cursor: '0',
      limit: 6,
      signal: controller.signal,
    });

    expect(result).toEqual({
      data: [{ id: 'm1' }],
      pagination: { cursor: '0', nextCursor: '2', hasNextPage: true },
    });

    expect(apiFetchSpy).toHaveBeenCalledWith('/api/users/john/mutual', {
      method: 'GET',
      query: {
        cursor: '0',
        limit: '6',
      },
      signal: controller.signal,
    });
  });

  it('uses default limit in getMutualFollowersPaginated when limit is not provided', async () => {
    registerEndpoint('/api/users/john/mutual', () => ({
      data: [{ id: 'm2' }],
      pagination: { cursor: '0', nextCursor: '2', hasNextPage: true },
    }));
    const apiFetchSpy = vi.spyOn(apiModule, 'apiFetch');

    const result = await profileTabsService.getMutualFollowersPaginated({
      username: 'john',
      cursor: null,
    });

    expect(result).toEqual({
      data: [{ id: 'm2' }],
      pagination: { cursor: '0', nextCursor: '2', hasNextPage: true },
    });

    expect(apiFetchSpy).toHaveBeenCalledWith('/api/users/john/mutual', {
      method: 'GET',
      query: {
        cursor: null,
        limit: DEFAULT_PAGE_SIZE.toString(),
      },
      signal: undefined,
    });
  });
});
