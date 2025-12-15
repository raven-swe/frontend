import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import DmMessageDropDown from '~/components/dm/conversation/DmMessageDropDown.vue';
import { apiFetch } from '~/api';
import * as toasterUtils from '~/utils/showToaster';

vi.mock('~/api', () => ({
  apiFetch: vi.fn(),
}));

vi.mock('~/utils/showToaster', () => ({
  showToaster: vi.fn(),
}));

describe('DmMessageDropDown Component', () => {
  const defaultProps = {
    conversationId: 'conv-123',
    messageId: 'msg-456',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', async () => {
    const wrapper = await mountSuspended(DmMessageDropDown, {
      props: defaultProps,
    });

    expect(wrapper.find('[data-test="dm-message-actions-trigger"]').exists()).toBe(true);
  });

  it('calls delete API and emits deleted event on success', async () => {
    vi.mocked(apiFetch).mockResolvedValue({ success: true, message: 'Deleted' });

    const wrapper = await mountSuspended(DmMessageDropDown, {
      props: defaultProps,
      global: {
        stubs: {
          UiDropdownMenu: {
            template: '<div><slot /><slot name="content" /></div>',
          },
          UiDropdownMenuTrigger: {
            template: '<div @click="$attrs.onClick"><slot /></div>',
          },
          UiDropdownMenuContent: {
            template: '<div><slot /></div>',
          },
          UiDropdownMenuItem: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
        },
      },
    });

    const deleteBtn = wrapper.find('[data-test="delete-message-button"]');
    expect(deleteBtn.exists()).toBe(true);

    await deleteBtn.trigger('click');

    expect(apiFetch).toHaveBeenCalledWith(
      `/api/conversations/${defaultProps.conversationId}/messages/${defaultProps.messageId}`,
      expect.objectContaining({
        method: 'DELETE',
      }),
    );

    expect(wrapper.emitted('deleted')).toBeTruthy();
  });

  it('handles error during deletion', async () => {
    const error = new Error('API Error');
    vi.mocked(apiFetch).mockRejectedValue(error);
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const wrapper = await mountSuspended(DmMessageDropDown, {
      props: defaultProps,
      global: {
        stubs: {
          UiDropdownMenu: { template: '<div><slot /></div>' },
          UiDropdownMenuTrigger: { template: '<div><slot /></div>' },
          UiDropdownMenuContent: { template: '<div><slot /></div>' },
          UiDropdownMenuItem: {
            template: '<button @click="$emit(\'click\')"><slot /></button>',
          },
        },
      },
    });

    const deleteBtn = wrapper.find('[data-test="delete-message-button"]');
    await deleteBtn.trigger('click');

    expect(apiFetch).toHaveBeenCalled();
    expect(wrapper.emitted('deleted')).toBeFalsy();
    // Check if showToaster from the mocked module was called
    expect(toasterUtils.showToaster).toHaveBeenCalledWith('error', 'Failed to delete message');

    consoleSpy.mockRestore();
  });

  it('prevents multiple delete calls while loading', async () => {
    // Mock a slow response
    vi.mocked(apiFetch).mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 100)),
    );

    const wrapper = await mountSuspended(DmMessageDropDown, {
      props: defaultProps,
      global: {
        stubs: {
          UiDropdownMenu: { template: '<div><slot /></div>' },
          UiDropdownMenuTrigger: { template: '<div><slot /></div>' },
          UiDropdownMenuContent: { template: '<div><slot /></div>' },
          UiDropdownMenuItem: {
            template: '<button @click="$emit(\'click\')" :disabled="disabled"><slot /></button>',
            props: ['disabled'],
          },
        },
      },
    });

    const deleteBtn = wrapper.find('[data-test="delete-message-button"]');

    // First click
    await deleteBtn.trigger('click');
    // Second click immediately
    await deleteBtn.trigger('click');

    expect(apiFetch).toHaveBeenCalledTimes(1);
  });
});
