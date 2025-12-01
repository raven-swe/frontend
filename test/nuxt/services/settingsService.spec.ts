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
});
