import { registerEndpoint } from '@nuxt/test-utils/runtime';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { settingsService } from '@/services/settingsService';

const apiFetch = await import('~/api');
const { DEFAULT_PAGE_SIZE } = await import('~/constants/pagination');

describe('settingsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    vi.resetModules();
  });

  it('calls apiFetch correctly for getBlockedPaginated with explicit limit', async () => {
    registerEndpoint('/api/settings/blocks', () => {
      return {
        data: [{ id: 'user1' }, { id: 'user2' }],
        pagination: { cursor: '0', nextCursor: '2', hasNextPage: true },
      };
    });

    const apiFetchSpy = vi.spyOn(apiFetch, 'apiFetch');
    const controller = new AbortController();

    const payload = { limit: 2, cursor: null, signal: controller.signal };
    const result = await settingsService.getBlockedPaginated(payload);

    expect(result).toEqual({
      data: [{ id: 'user1' }, { id: 'user2' }],
      pagination: { cursor: '0', nextCursor: '2', hasNextPage: true },
    });

    expect(apiFetchSpy).toHaveBeenCalledWith('/api/settings/blocks', {
      method: 'GET',
      query: {
        cursor: null,
        limit: '2',
      },
      signal: controller.signal,
    });
  });

  it('uses DEFAULT_PAGE_SIZE when limit is not provided in getBlockedPaginated', async () => {
    registerEndpoint('/api/settings/blocks', () => {
      return {
        data: [{ id: 'user5' }, { id: 'user6' }],
        pagination: { cursor: '0', nextCursor: '2', hasNextPage: true },
      };
    });

    const apiFetchSpy = vi.spyOn(apiFetch, 'apiFetch');

    const payload = { cursor: null }; // no limit, no signal
    const result = await settingsService.getBlockedPaginated(payload);

    expect(result).toEqual({
      data: [{ id: 'user5' }, { id: 'user6' }],
      pagination: { cursor: '0', nextCursor: '2', hasNextPage: true },
    });

    expect(apiFetchSpy).toHaveBeenCalledWith('/api/settings/blocks', {
      method: 'GET',
      query: {
        cursor: null,
        limit: DEFAULT_PAGE_SIZE.toString(),
      },
      signal: undefined,
    });
  });

  it('calls apiFetch correctly for getMutedPaginated with explicit limit', async () => {
    registerEndpoint('/api/settings/mutes', () => {
      return {
        data: [{ id: 'user3' }, { id: 'user4' }],
        pagination: { cursor: '0', nextCursor: '2', hasNextPage: true },
      };
    });

    const apiFetchSpy = vi.spyOn(apiFetch, 'apiFetch');
    const controller = new AbortController();

    const payload = { limit: 2, cursor: null, signal: controller.signal };
    const result = await settingsService.getMutedPaginated(payload);

    expect(result).toEqual({
      data: [{ id: 'user3' }, { id: 'user4' }],
      pagination: { cursor: '0', nextCursor: '2', hasNextPage: true },
    });

    expect(apiFetchSpy).toHaveBeenCalledWith('/api/settings/mutes', {
      method: 'GET',
      query: {
        cursor: null,
        limit: '2',
      },
      signal: controller.signal,
    });
  });

  it('uses DEFAULT_PAGE_SIZE when limit is not provided in getMutedPaginated', async () => {
    registerEndpoint('/api/settings/mutes', () => {
      return {
        data: [{ id: 'user7' }, { id: 'user8' }],
        pagination: { cursor: '0', nextCursor: '2', hasNextPage: true },
      };
    });

    const apiFetchSpy = vi.spyOn(apiFetch, 'apiFetch');

    const payload = { cursor: null }; // no limit, no signal
    const result = await settingsService.getMutedPaginated(payload);

    expect(result).toEqual({
      data: [{ id: 'user7' }, { id: 'user8' }],
      pagination: { cursor: '0', nextCursor: '2', hasNextPage: true },
    });

    expect(apiFetchSpy).toHaveBeenCalledWith('/api/settings/mutes', {
      method: 'GET',
      query: {
        cursor: null,
        limit: DEFAULT_PAGE_SIZE.toString(),
      },
      signal: undefined,
    });
  });

  it('calls apiFetch correctly for getFollowSuggestions with explicit limit', async () => {
    registerEndpoint('/api/onboarding/follow-suggestions', () => {
      return {
        data: [{ id: 'user9' }, { id: 'user10' }],
        pagination: { cursor: '0', nextCursor: '2', hasNextPage: true },
      };
    });

    const apiFetchSpy = vi.spyOn(apiFetch, 'apiFetch');
    const controller = new AbortController();

    const payload = { limit: 2, cursor: null, signal: controller.signal };
    const result = await settingsService.getFollowSuggestions(payload);

    expect(result).toEqual({
      data: [{ id: 'user9' }, { id: 'user10' }],
      pagination: { cursor: '0', nextCursor: '2', hasNextPage: true },
    });

    expect(apiFetchSpy).toHaveBeenCalledWith('/api/onboarding/follow-suggestions', {
      method: 'GET',
      query: {
        cursor: null,
        limit: '2',
      },
      signal: controller.signal,
    });
  });

  it('uses DEFAULT_PAGE_SIZE when limit is not provided in getFollowSuggestions', async () => {
    registerEndpoint('/api/onboarding/follow-suggestions', () => {
      return {
        data: [{ id: 'user11' }, { id: 'user12' }],
        pagination: { cursor: '0', nextCursor: '2', hasNextPage: true },
      };
    });

    const apiFetchSpy = vi.spyOn(apiFetch, 'apiFetch');

    const payload = { cursor: null }; // no limit, no signal
    const result = await settingsService.getFollowSuggestions(payload);

    expect(result).toEqual({
      data: [{ id: 'user11' }, { id: 'user12' }],
      pagination: { cursor: '0', nextCursor: '2', hasNextPage: true },
    });

    expect(apiFetchSpy).toHaveBeenCalledWith('/api/onboarding/follow-suggestions', {
      method: 'GET',
      query: {
        cursor: null,
        limit: DEFAULT_PAGE_SIZE.toString(),
      },
      signal: undefined,
    });
  });

  it('calls apiFetch correctly for updateUsername', async () => {
    registerEndpoint('/api/settings/username/update', {
      method: 'PATCH',
      handler: () => {
        return { success: true };
      },
    });

    const apiFetchSpy = vi.spyOn(apiFetch, 'apiFetch');

    const result = await settingsService.updateUsername('newUsername');

    expect(result).toEqual({ success: true });

    expect(apiFetchSpy).toHaveBeenCalledWith('/api/settings/username/update', {
      method: 'PATCH',
      query: { newUsername: 'newUsername' },
    });
  });

  it('calls apiFetch correctly for getUsernameSuggestions', async () => {
    registerEndpoint('/api/settings/username/suggestions', {
      method: 'GET',
      handler: () => {
        return { data: ['user1', 'user2'] };
      },
    });

    const apiFetchSpy = vi.spyOn(apiFetch, 'apiFetch');

    const result = await settingsService.getUsernameSuggestions('baseUser');

    expect(result).toEqual({ data: ['user1', 'user2'] });

    expect(apiFetchSpy).toHaveBeenCalledWith('/api/settings/username/suggestions', {
      method: 'GET',
      query: { baseUsername: 'baseUser' },
    });
  });

  it('calls apiFetch correctly for updateInterests', async () => {
    registerEndpoint('/api/settings/interests', {
      method: 'PUT',
      handler: () => {
        return { success: true };
      },
    });

    const apiFetchSpy = vi.spyOn(apiFetch, 'apiFetch');

    const result = await settingsService.updateInterests(['music', 'sports']);

    expect(result).toEqual({ success: true });

    expect(apiFetchSpy).toHaveBeenCalledWith('/api/settings/interests', {
      method: 'PUT',
      body: { interests: ['music', 'sports'] },
    });
  });

  it('calls apiFetch correctly for getInterests', async () => {
    registerEndpoint('/api/settings/interests', {
      method: 'GET',
      handler: () => {
        return { data: ['music', 'sports'] };
      },
    });

    const apiFetchSpy = vi.spyOn(apiFetch, 'apiFetch');

    const result = await settingsService.getInterests();

    expect(result).toEqual({ data: ['music', 'sports'] });

    expect(apiFetchSpy).toHaveBeenCalledWith('/api/settings/interests', {
      method: 'GET',
    });
  });
});
