import { describe, it, expect, vi } from 'vitest';
import { mockNuxtImport, mountSuspended } from '@nuxt/test-utils/runtime';
import AccountSetup from '~/components/profile/account-setup/index.vue';
import EditUsernameDialog from '~/components/profile/account-setup/EditUsernameDialog.vue';
import FollowUserDialog from '~/components/profile/account-setup/FollowUserDialog.vue';
import SelectInterestsDialog from '~/components/profile/account-setup/SelectInterestsDialog.vue';
import ProfilePictureDialog from '~/components/profile/setup/ProfilePictureDialog.vue';

import en from '~~/i18n/locales/en.json';
import { createI18n } from 'vue-i18n';

const i18n = createI18n({
  locale: 'en',
  messages: { en },
});

const useAccountSetupMock = vi.hoisted(() => ({
  setupStep: 'profile-picture',
  handleProfilePictureSubmit: vi.fn(),
}));

mockNuxtImport('useAccountSetup', () => {
  return () => useAccountSetupMock;
});

describe('AccountSetupDialogs', () => {
  it('opens profile picture dialog on profile-picture step', async () => {
    const wrapper = await mountSuspended(AccountSetup, {
      global: {
        plugins: [i18n],
      },
    });

    const profile = wrapper.getComponent(ProfilePictureDialog);
    expect(profile.props('open')).toBe(true);

    expect(wrapper.getComponent(EditUsernameDialog).props('open')).toBe(false);
    expect(wrapper.getComponent(SelectInterestsDialog).props('open')).toBe(false);
    expect(wrapper.getComponent(FollowUserDialog).props('open')).toBe(false);
  });
});
