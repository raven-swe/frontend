import { describe, expect, it, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import { flushPromises } from '@vue/test-utils';
import DmConversationEmptyState from '@/components/dm/DmConversationEmptyState.vue';

// Mock the DmNewMessageDialog
vi.mock('@/components/dm/DmNewMessageDialog.vue', () => ({
  default: {
    name: 'DmNewMessageDialog',
    props: ['open'],
    emits: ['update:open'],
    template: '<div data-test="new-message-dialog" :data-open="open"></div>',
  },
}));

// Mock the Button component
vi.mock('@/components/ui/Button.vue', () => ({
  default: {
    name: 'Button',
    props: ['size', 'variant'],
    template: '<button data-test="new-message-button"><slot /></button>',
  },
}));

describe('DmConversationEmptyState Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders successfully', async () => {
    const wrapper = await mountSuspended(DmConversationEmptyState);
    expect(wrapper.html()).toBeTruthy();
  });

  it('renders the heading text', async () => {
    const wrapper = await mountSuspended(DmConversationEmptyState);

    const heading = wrapper.find('h2');
    expect(heading.exists()).toBe(true);
    expect(heading.classes()).toContain('text-3xl');
    expect(heading.classes()).toContain('font-bold');
  });

  it('renders the description text', async () => {
    const wrapper = await mountSuspended(DmConversationEmptyState);

    const description = wrapper.find('p');
    expect(description.exists()).toBe(true);
    expect(description.classes()).toContain('text-muted-foreground');
    expect(description.classes()).toContain('text-sm');
  });

  it('renders the new message button', async () => {
    const wrapper = await mountSuspended(DmConversationEmptyState);

    const button = wrapper.find('[data-test="new-message-button"]');
    expect(button.exists()).toBe(true);
  });

  it('renders the DmNewMessageDialog component', async () => {
    const wrapper = await mountSuspended(DmConversationEmptyState);

    const dialog = wrapper.find('[data-test="new-message-dialog"]');
    expect(dialog.exists()).toBe(true);
  });

  it('opens dialog when button is clicked', async () => {
    const wrapper = await mountSuspended(DmConversationEmptyState);

    const button = wrapper.find('[data-test="new-message-button"]');
    await button.trigger('click');
    await flushPromises();

    const dialog = wrapper.find('[data-test="new-message-dialog"]');
    expect(dialog.attributes('data-open')).toBe('true');
  });

  it('has correct container layout', async () => {
    const wrapper = await mountSuspended(DmConversationEmptyState);

    const container = wrapper.find('div');
    expect(container.classes()).toContain('flex');
    expect(container.classes()).toContain('h-full');
    expect(container.classes()).toContain('items-center');
    expect(container.classes()).toContain('justify-center');
  });

  it('has correct inner content layout', async () => {
    const wrapper = await mountSuspended(DmConversationEmptyState);

    // Find the inner div that contains the heading
    const innerContainer = wrapper.find('div.flex.max-w-sm');
    expect(innerContainer.exists()).toBe(true);
    expect(innerContainer.classes()).toContain('flex');
    expect(innerContainer.classes()).toContain('flex-col');
    expect(innerContainer.classes()).toContain('items-start');
    expect(innerContainer.classes()).toContain('gap-4');
    expect(innerContainer.classes()).toContain('max-w-sm');
  });

  it('dialog is initially closed', async () => {
    const wrapper = await mountSuspended(DmConversationEmptyState);

    const dialog = wrapper.find('[data-test="new-message-dialog"]');
    expect(dialog.attributes('data-open')).toBe('false');
  });
});
