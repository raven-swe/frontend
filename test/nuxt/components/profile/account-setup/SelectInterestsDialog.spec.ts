import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import SelectInterestsDialog from '~/components/profile/account-setup/SelectInterestsDialog.vue';

import en from '~~/i18n/locales/en.json';
import { createI18n } from 'vue-i18n';
import { flushPromises } from '@vue/test-utils';
import { nextTick } from 'vue';

const i18n = createI18n({
  locale: 'en',
  messages: { en },
});

const settingsServiceMock = vi.hoisted(() => {
  return {
    getInterests: vi.fn(() => {
      return {
        data: [
          { code: 'NEWS', name: 'News', isSelected: false },
          { code: 'SPORTS', name: 'Sports', isSelected: false },
          { code: 'MUSIC', name: 'Music', isSelected: false },
          { code: 'ART', name: 'Art', isSelected: false },
        ],
      };
    }),
  };
});

vi.mock('~/services/settingsService', async () => {
  return {
    settingsService: settingsServiceMock,
  };
});

const handleInterestsSubmitMock = vi.hoisted(() => vi.fn());

// Mock the composable
vi.mock('~/composables/useAccountSetup', () => ({
  default: () => {
    return { handleInterestsSubmit: handleInterestsSubmitMock };
  },
}));

describe('SelectInterestsDialog', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('renders correctly', async () => {
    const wrapper = await mountSuspended(SelectInterestsDialog, {
      props: { open: true },
      global: {
        plugins: [i18n],
        stubs: {
          UiDialogContent: {
            template: "<div><slot /> <slot name='header' /></div>",
          },
          LogoRaven: {
            template: '<div data-test="logo-raven">LogoRaven</div>',
          },
        },
      },
    });
    expect(wrapper.text()).toContain('What do you want to see on Raven?');
    expect(wrapper.text()).toContain('News');
    expect(wrapper.text()).toContain('Sports');
    expect(wrapper.text()).toContain('Music');
    expect(wrapper.text()).toContain('Art');

    // Check that the submit button is disabled initially
    const submitBtn = wrapper.find('button[type="submit"]');
    expect(submitBtn.exists()).toBe(true);
    expect(submitBtn.attributes('disabled')).toBeDefined();

    const logo = wrapper.find('[data-test="logo-raven"]');
    expect(logo.exists()).toBe(true);
  });

  it('handle selecting interests', async () => {
    const InterestItem = {
      props: ['interest', 'isActive'],
      template:
        '<div @click="$emit(\'toggle-interest\')">{{ interest }} - {{ isActive ? "Active" : "Inactive" }}</div>',
    };

    const wrapper = await mountSuspended(SelectInterestsDialog, {
      props: { open: true },
      global: {
        plugins: [i18n],
        stubs: {
          UiDialogContent: {
            template: '<div><slot /></div>',
          },
          InterestItem,
        },
      },
    });

    const interestItems = wrapper.findAllComponents(InterestItem);
    await interestItems[0]?.trigger('click'); // Select News
    await interestItems[2]?.trigger('click'); // Select Music
    expect(interestItems[0]?.text()).toContain('Active');
    expect(interestItems[1]?.text()).toContain('Inactive');
    expect(interestItems[2]?.text()).toContain('Active');
    expect(interestItems[3]?.text()).toContain('Inactive');
    expect(wrapper.text()).toContain('Great work 🎉');

    // check if toggle works
    await interestItems[0]?.trigger('click'); // Deselect News
    expect(interestItems[0]?.text()).toContain('Inactive');
    wrapper.unmount();
  });

  it('submits selected interests', async () => {
    handleInterestsSubmitMock.mockResolvedValueOnce(undefined);

    const InterestItem = {
      props: ['interest', 'isActive'],
      template:
        '<div @click="$emit(\'toggle-interest\')">{{ interest }} - {{ isActive ? "Active" : "Inactive" }}</div>',
    };

    const wrapper = await mountSuspended(SelectInterestsDialog, {
      props: { open: true },
      global: {
        plugins: [i18n],
        stubs: {
          UiDialogContent: {
            template: '<div><slot /></div>',
          },
          InterestItem,
        },
      },
    });

    await nextTick();

    const interestItems = wrapper.findAllComponents(InterestItem);

    await interestItems[0]?.trigger('click'); // Select News
    await interestItems[2]?.trigger('click'); // Select Music

    const form = wrapper.find('form');
    await form.trigger('submit');
    await nextTick();
    await flushPromises();
    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(handleInterestsSubmitMock).toHaveBeenCalled();
    expect(handleInterestsSubmitMock).toHaveBeenCalledWith(['NEWS', 'MUSIC']);
  });
});
