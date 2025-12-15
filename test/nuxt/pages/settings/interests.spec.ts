import { describe, it, expect, vi, beforeEach } from 'vitest';
import InterestsPage from '~/pages/settings/interests.vue';
import { createI18n } from 'vue-i18n';
import en from '~~/i18n/locales/en.json';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import type { Interest } from '~~/shared/types/interests';
import { flushPromises } from '@vue/test-utils';

const i18n = createI18n({
  locale: 'en',
  messages: {
    en,
  },
});

const routerMock = vi.hoisted(() => ({
  push: vi.fn(),
  back: vi.fn(),
  replace: vi.fn(),
}));

const useInterestsFormMock = vi.hoisted(() => {
  return {
    isLoading: false,
    isSubmitting: false,
    interests: [
      { code: 'technology', name: 'Technology', isSelected: true },
      { code: 'sports', name: 'Sports', isSelected: false },
      { code: 'music', name: 'Music', isSelected: true },
    ] as Interest[] | undefined,
    selectedOne: true,
    onSubmit: vi.fn(),
    handleToggleInterest: vi.fn(),
    isInterestActive: (code: string) => {
      return code === 'technology' || code === 'music';
    },
  };
});

vi.mock('~/composables/useInterestsForm', () => {
  return {
    useInterestsForm: () => useInterestsFormMock,
  };
});

const createWrapper = async () => {
  return await mountSuspended(InterestsPage, {
    global: {
      mocks: {
        $router: routerMock,
      },
      plugins: [i18n],
      stubs: {
        UiSpinner: {
          template: '<div data-test="loading-spinner">Loading...</div>',
        },
        InterestEntry: {
          props: ['interest', 'isActive'],
          emits: ['toggle-interest'],
          template: `
            <div data-test="interest-item">
              <span>{{ interest.code }}</span>
              <input
                type="checkbox"
                :checked="isActive"
                @change="$emit('toggle-interest', interest.code)"
              >
            </div>
          `,
        },
      },
    },
  });
};

describe('Settings Interests Page', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });
  it('render header and description', async () => {
    const wrapper = await createWrapper();
    expect(wrapper.text()).toContain('Interests');
    expect(wrapper.text()).toContain(
      "These are some of the interests selected. These are used to personalize your experience across Raven. You can adjust your interests if something doesn't look right. Any changes you make may take a little while to go into effect.",
    );
  });

  it('back button works', async () => {
    const wrapper = await createWrapper();
    const backButton = wrapper.find('header button');
    await backButton.trigger('click');
    expect(routerMock.back).toHaveBeenCalled();
  });

  it('submit enabled when at least one interest is selected', async () => {
    const wrapper = await createWrapper();
    const submitButton = wrapper.find('form button[type="submit"]');
    expect(submitButton.attributes('disabled')).toBeUndefined();
  });

  it('submit disabled when no interests are selected', async () => {
    useInterestsFormMock.selectedOne = false;
    const wrapper = await createWrapper();
    const submitButton = wrapper.find('form button[type="submit"]');
    expect(submitButton.attributes('disabled')).toBeDefined();
  });

  it('disable button on submit', async () => {
    useInterestsFormMock.isSubmitting = true;
    const wrapper = await createWrapper();
    const submitButton = wrapper.find('form button[type="submit"]');
    expect(submitButton.attributes('disabled')).toBeDefined();
  });

  it('renders interests correctly', async () => {
    const wrapper = await createWrapper();
    const interestItems = wrapper.findAll('[data-test="interest-item"]');
    expect(interestItems.length).toBe(3);

    const technologyItem = interestItems[0];
    expect(technologyItem).toBeDefined();
    expect(technologyItem!.text()).toContain('technology');
    const technologyCheckbox = technologyItem!.find('input[type="checkbox"]');
    expect((technologyCheckbox.element as HTMLInputElement).checked).toBe(true);

    const sportsItem = interestItems[1];
    expect(sportsItem).toBeDefined();
    expect(sportsItem!.text()).toContain('sports');
    const sportsCheckbox = sportsItem!.find('input[type="checkbox"]');
    expect((sportsCheckbox.element as HTMLInputElement).checked).toBe(false);

    const musicItem = interestItems[2];
    expect(musicItem).toBeDefined();
    expect(musicItem!.text()).toContain('music');
    const musicCheckbox = musicItem!.find('input[type="checkbox"]');
    expect((musicCheckbox.element as HTMLInputElement).checked).toBe(true);
  });

  it('correclty handle emitting toggle-interest event', async () => {
    const wrapper = await createWrapper();
    const interestItems = wrapper.findAll('[data-test="interest-item"]');

    const sportsItem = interestItems[1];
    const sportsInput = sportsItem?.find('input');
    await sportsInput?.trigger('change');

    expect(useInterestsFormMock.handleToggleInterest).toHaveBeenCalledWith('sports');
  });

  it('renders loading spinner when isLoading is true', async () => {
    useInterestsFormMock.isLoading = true;
    useInterestsFormMock.interests = undefined;
    const wrapper = await createWrapper();
    expect(wrapper.find('[data-test="interests-container"]').exists()).toBe(false);
    expect(wrapper.find('[data-test="loading-spinner"]').exists()).toBe(true);
    expect(wrapper.find('form button[type="submit"]').attributes('disabled')).toBeDefined();
  });

  it('calls onSubmit when form is submitted', async () => {
    const wrapper = await createWrapper();
    const form = wrapper.find('form');
    await form.trigger('submit.prevent');
    await flushPromises();
    expect(useInterestsFormMock.onSubmit).toHaveBeenCalled();
  });
});
