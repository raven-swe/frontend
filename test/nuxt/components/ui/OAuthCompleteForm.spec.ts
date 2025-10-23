import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import OAuthCompleteForm from '@/components/ui/OAuthCompleteForm.vue';

// Mock the composable
const submitMock = vi.fn();
vi.mock('@/composables/useOAuthComplete', () => ({
  useOAuthComplete: () => ({
    loading: ref(false),
    error: ref(null),
    result: ref(null),
    submit: submitMock,
  }),
}));

describe('OAuthCompleteForm', () => {
  it('renders and submits birth date', async () => {
    const wrapper = mount(OAuthCompleteForm, {
      props: { creationToken: 'mocktoken' },
      global: {
        mocks: {
          $t: (key: string) => key,
        },
      },
    });
    const input = wrapper.find('input[type="date"]');
    await input.setValue('2000-01-01');
    const button = wrapper.find('button');
    await button.trigger('click');
    expect(submitMock).toHaveBeenCalledWith('mocktoken', '2000-01-01');
  });
});
