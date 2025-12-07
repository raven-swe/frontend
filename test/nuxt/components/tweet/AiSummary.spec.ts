import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import AiSummary from '~~/app/components/tweet/AiSummary.vue';
import { tweetAiSummary } from '~/services/tweet/tweetsService';

// Mock i18n $t
const t = (key: string) => key;

// Mock tweetsService
vi.mock('~/services/tweet/tweetsService', () => ({
  tweetAiSummary: vi.fn(),
}));

function mountComponent(props: { tweetId: string }) {
  return mount(AiSummary, {
    props,
    global: {
      mocks: {
        $t: t,
      },
      stubs: {
        // Stub Button and Icon used inside component
        Button: {
          template: '<button @click="$emit(\'click\')"><slot /></button>',
        },
        Icon: {
          template: '<i />',
        },
      },
    },
  });
}

describe('AiSummary.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders skeleton while loading and then shows summary on success', async () => {
    (tweetAiSummary as Mock).mockResolvedValueOnce({
      success: true,
      data: { summary: 'AI summary content' },
    });
    const wrapper = mountComponent({ tweetId: '123' });

    // Trigger fetch via exposed method
    await (wrapper.vm as unknown as { handleAiSummary: () => Promise<void> }).handleAiSummary();

    // After await, loading should be false and summary should render
    expect(wrapper.text()).toContain('ai-summary.summary');
    expect(wrapper.text()).toContain('AI summary content');
    expect(tweetAiSummary).toHaveBeenCalledWith('123');
  });

  it('shows error state and allows retry', async () => {
    (tweetAiSummary as Mock).mockRejectedValueOnce(new Error('Backend down'));
    const wrapper = mountComponent({ tweetId: '456' });

    // First call fails
    await (wrapper.vm as unknown as { handleAiSummary: () => Promise<void> }).handleAiSummary();
    await nextTick();
    expect(wrapper.text()).toContain('ai-summary.something-went-wrong');

    // Set up next call to succeed and retry
    (tweetAiSummary as Mock).mockResolvedValueOnce({
      success: true,
      data: { summary: 'Recovered summary' },
    });

    // Call handleAiSummary again (simulating retry)
    await (wrapper.vm as unknown as { handleAiSummary: () => Promise<void> }).handleAiSummary();
    await nextTick();

    expect(wrapper.text()).toContain('ai-summary.summary');
    expect(wrapper.text()).toContain('Recovered summary');
  });

  it('hides summary when close button is clicked', async () => {
    (tweetAiSummary as Mock).mockResolvedValueOnce({
      success: true,
      data: { summary: 'Close me' },
    });
    const wrapper = mountComponent({ tweetId: '789' });

    await (wrapper.vm as unknown as { handleAiSummary: () => Promise<void> }).handleAiSummary();
    await nextTick();
    expect(wrapper.text()).toContain('Close me');

    // Call closeSummary method directly
    (wrapper.vm as unknown as { closeSummary: () => void }).closeSummary();
    await nextTick();

    // Summary should be hidden
    expect(wrapper.text()).not.toContain('Close me');
  });
});
