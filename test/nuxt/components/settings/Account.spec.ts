import { describe, it, expect, beforeEach } from 'vitest';
import { ref, type Ref } from 'vue';
import { mountSuspended, mockNuxtImport } from '@nuxt/test-utils/runtime';

// Reactive locale to control i18n per test
const localeRef: Ref<string> = ref('en');
mockNuxtImport('useI18n', () => {
  return () => ({
    t: (key: string) => key,
    locale: localeRef,
  });
});

// Mock Pinia user store
type UserShape = { username?: string; email?: string; birthDate?: string | undefined };
type MockStore = { user: UserShape | undefined };
let store: MockStore;
mockNuxtImport('useUserStore', () => {
  return () => store;
});

// Import after mocks
/* eslint-disable import/first */
import AccountPage from '@/pages/settings/account.vue';
/* eslint-enable import/first */

const stubSettingsItem = {
  template:
    '<div class="settings-item"><div class="title">{{ title }}</div><div class="subtitle">{{ subtitle }}</div><div class="to">{{ to }}</div></div>',
  props: ['title', 'subtitle', 'to'],
};

describe('Settings Account Page', () => {
  beforeEach(() => {
    localeRef.value = 'en';
  });

  it('renders settings items with user data and formatted birth date (en locale)', async () => {
    const user = {
      username: 'aesthetics',
      email: 'user@example.com',
      birthDate: '1999-05-15T00:00:00.000Z',
    };
    store = { user } as MockStore;

    const wrapper = await mountSuspended(AccountPage, {
      global: {
        stubs: { SettingsItem: stubSettingsItem },
        mocks: { $t: (k: string) => k },
      },
    });

    const html = wrapper.html();
    // Header title and description use t()
    expect(html).toContain('setting.account-information');
    expect(html).toContain('setting.account-information-details');

    const items = wrapper.findAll('.settings-item');
    expect(items.length).toBe(4);
    const i0 = items[0]!;
    const i1 = items[1]!;
    const i2 = items[2]!;
    const i3 = items[3]!;

    // Username item
    expect(i0.find('.title').text()).toBe('setting.username.username');
    expect(i0.find('.subtitle').text()).toBe(`@${user.username}`);
    expect(i0.find('.to').text()).toBe('/settings/username');

    // Email item
    expect(i1.find('.title').text()).toBe('setting.change-email.label');
    expect(i1.find('.subtitle').text()).toBe(user.email);
    expect(i1.find('.to').text()).toBe('/settings/email');

    // Birth date item (formatted via Intl using current locale)
    expect(i2.find('.title').text()).toBe('setting.date-of-birth');
    const expectedEn = new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(user.birthDate));
    expect(i2.find('.subtitle').text()).toBe(expectedEn);
    expect(i2.find('.to').text()).toBe('/settings/profile');

    // Change password item (subtitle via i18n key)
    expect(i3.find('.title').text()).toBe('setting.change-password');
    expect(i3.find('.subtitle').text()).toBe('setting.change-password-subtitle');
    expect(i3.find('.to').text()).toBe('/settings/changePasswordEditor');

    // No explicit call assertion needed; value is derived from computed
  });

  it('uses i18n locale when formatting birth date (ar locale)', async () => {
    const user = {
      username: 'aesthetics',
      email: 'user@example.com',
      birthDate: '2010-01-01T00:00:00.000Z',
    };
    store = { user } as MockStore;
    localeRef.value = 'ar';

    const wrapper = await mountSuspended(AccountPage, {
      global: {
        stubs: { SettingsItem: stubSettingsItem },
        mocks: { $t: (k: string) => k },
      },
    });

    const items = wrapper.findAll('.settings-item');
    const i2 = items[2]!;
    const expectedAr = new Intl.DateTimeFormat('ar-EG', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(user.birthDate));
    expect(i2.find('.subtitle').text()).toBe(expectedAr);
  });

  it('renders error state when user is missing (v-else branch)', async () => {
    store = { user: undefined } as MockStore;
    const wrapper = await mountSuspended(AccountPage, {
      global: {
        stubs: { SettingsItem: stubSettingsItem },
        mocks: { $t: (k: string) => k },
      },
    });

    expect(wrapper.text()).toContain('setting.failed-to-load-user');
  });

  it('shows empty subtitle for birth date when missing', async () => {
    const user: UserShape = {
      username: 'no-bday',
      email: 'nobday@example.com',
      birthDate: undefined,
    };
    store = { user } as MockStore;

    const wrapper = await mountSuspended(AccountPage, {
      global: {
        stubs: { SettingsItem: stubSettingsItem },
        mocks: { $t: (k: string) => k },
      },
    });

    const items = wrapper.findAll('.settings-item');
    const i2 = items[2]!;
    expect(i2.find('.subtitle').text()).toBe('');
  });
});
