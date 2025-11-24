import { describe, expect, it } from 'vitest';

import { profileInteractionService } from '@/services/profile/profileInteractionService';
import { registerEndpoint } from '@nuxt/test-utils/runtime';

describe('profileInteractionService', () => {
  it('follow user service', async () => {
    registerEndpoint('/api/users/username/following', () => {
      return { success: true };
    });
    const response = await profileInteractionService.followUser('username');
    expect(response).toEqual({ success: true });
  });

  it('unfollow user service', async () => {
    registerEndpoint('/api/users/username/following', () => {
      return { success: true };
    });
    const response = await profileInteractionService.unfollowUser('username');
    expect(response).toEqual({ success: true });
  });

  it('block user service', async () => {
    registerEndpoint('/api/me/blocks/username', () => {
      return { success: true };
    });
    const response = await profileInteractionService.blockUser('username');
    expect(response).toEqual({ success: true });
  });

  it('unblock user service', async () => {
    registerEndpoint('/api/me/blocks/username', () => {
      return { success: true };
    });
    const response = await profileInteractionService.unblockUser('username');
    expect(response).toEqual({ success: true });
  });

  it('mute user service', async () => {
    registerEndpoint('/api/me/mutes/username', () => {
      return { success: true };
    });
    const response = await profileInteractionService.muteUser('username');
    expect(response).toEqual({ success: true });
  });

  it('unmute user service', async () => {
    registerEndpoint('/api/me/mutes/username', () => {
      return { success: true };
    });
    const response = await profileInteractionService.unmuteUser('username');
    expect(response).toEqual({ success: true });
  });
});
