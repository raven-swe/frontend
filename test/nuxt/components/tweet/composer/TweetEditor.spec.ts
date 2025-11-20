/* eslint-disable @typescript-eslint/no-explicit-any */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import TweetEditor from '~/components/tweet/composer/TweetEditor.vue';
import { createI18n } from 'vue-i18n';
import messages from '@@/i18n/locales/en.json';

const i18n = createI18n({
  locale: 'en',
  messages: { en: messages },
});

describe('TweetEditor', () => {
  const mockProps = {
    modelValue: '',
    placeholder: "What's happening?",
    maxLength: 280,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with default props', async () => {
    const wrapper = await mountSuspended(TweetEditor, {
      props: mockProps,
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.find('textarea').exists()).toBe(true);
    expect(wrapper.find('.text-muted-foreground').text()).toBe("What's happening?");
  });

  it('displays modelValue correctly', async () => {
    const wrapper = await mountSuspended(TweetEditor, {
      props: { ...mockProps, modelValue: 'Hello world' },
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.find('textarea').element.value).toBe('Hello world');
    expect(wrapper.text()).toContain('Hello world');
  });

  it('shows placeholder when modelValue is empty', async () => {
    const wrapper = await mountSuspended(TweetEditor, {
      props: mockProps,
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.find('.text-muted-foreground').exists()).toBe(true);
    expect(wrapper.find('.text-muted-foreground').text()).toBe("What's happening?");
  });

  it('hides placeholder when modelValue has content', async () => {
    const wrapper = await mountSuspended(TweetEditor, {
      props: { ...mockProps, modelValue: 'Test content' },
      global: {
        plugins: [i18n],
      },
    });

    expect(wrapper.find('.text-muted-foreground').exists()).toBe(false);
  });

  it('emits update:modelValue on input', async () => {
    const wrapper = await mountSuspended(TweetEditor, {
      props: mockProps,
      global: {
        plugins: [i18n],
      },
    });

    const textarea = wrapper.find('textarea');
    await textarea.setValue('New content');
    await textarea.trigger('input');

    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('New content');
  });

  it('calculates character count correctly', async () => {
    const wrapper = await mountSuspended(TweetEditor, {
      props: { ...mockProps, modelValue: 'Hello' },
      global: {
        plugins: [i18n],
      },
    });

    const component = wrapper.vm as any;
    expect(component.characterCount).toBe(5);
  });

  it('detects when over character limit', async () => {
    const longText = 'a'.repeat(300);
    const wrapper = await mountSuspended(TweetEditor, {
      props: { ...mockProps, modelValue: longText, maxLength: 280 },
      global: {
        plugins: [i18n],
      },
    });

    const component = wrapper.vm as any;
    expect(component.isOverLimit).toBe(true);
  });

  it('splits text correctly when over limit', async () => {
    const longText = 'a'.repeat(300);
    const wrapper = await mountSuspended(TweetEditor, {
      props: { ...mockProps, modelValue: longText, maxLength: 280 },
      global: {
        plugins: [i18n],
      },
    });

    const component = wrapper.vm as any;
    expect(component.validText).toBe('a'.repeat(280));
    expect(component.overLimitText).toBe('a'.repeat(20));
  });

  it('shows over-limit text with correct styling', async () => {
    const longText = 'a'.repeat(300);
    const wrapper = await mountSuspended(TweetEditor, {
      props: { ...mockProps, modelValue: longText, maxLength: 280 },
      global: {
        plugins: [i18n],
      },
    });

    const overLimitSpan = wrapper.find('.bg-destructive\\/50');
    expect(overLimitSpan.exists()).toBe(true);
    expect(overLimitSpan.text()).toBe('a'.repeat(20));
  });

  it('adjusts textarea height on input', async () => {
    const wrapper = await mountSuspended(TweetEditor, {
      props: mockProps,
      global: {
        plugins: [i18n],
      },
    });

    const textarea = wrapper.find('textarea');
    Object.defineProperty(textarea.element, 'scrollHeight', { value: 100 });

    await textarea.setValue('Line 1\nLine 2\nLine 3');
    await textarea.trigger('input');

    expect(textarea.element.style.height).toBe('100px');
  });

  it('exposes resetHeight method', async () => {
    const wrapper = await mountSuspended(TweetEditor, {
      props: mockProps,
      global: {
        plugins: [i18n],
      },
    });

    const exposed = (wrapper.vm as any).$?.exposed;
    expect(typeof exposed.resetHeight).toBe('function');

    // insert some text
    await wrapper.setProps({ modelValue: 'Some text' });
    // call resetHeight
    exposed.resetHeight();
    const textarea = wrapper.find('textarea');
    expect(textarea.element.style.height).toBe('auto');
  });

  it('exposes isOverLimit method', async () => {
    const wrapper = await mountSuspended(TweetEditor, {
      props: { ...mockProps, modelValue: 'a'.repeat(300) },
      global: {
        plugins: [i18n],
      },
    });
    const exposed = (wrapper.vm as any).$?.exposed;

    expect(typeof exposed.resetHeight).toBe('function');
    expect(exposed.isOverLimit()).toBe(true);
  });

  it('exposes characterCount', async () => {
    const wrapper = await mountSuspended(TweetEditor, {
      props: { ...mockProps, modelValue: 'Hello' },
      global: {
        plugins: [i18n],
      },
    });

    const exposed = (wrapper.vm as any).$?.exposed;
    expect(typeof exposed.characterCount).toBe('function');
    expect(exposed.characterCount()).toBe(5);
  });

  it('handles empty over-limit text when not over limit', async () => {
    const wrapper = await mountSuspended(TweetEditor, {
      props: { ...mockProps, modelValue: 'Short text' },
      global: {
        plugins: [i18n],
      },
    });

    const component = wrapper.vm as any;
    expect(component.overLimitText).toBe('');
    expect(wrapper.find('.bg-destructive\\/50').exists()).toBe(false);
  });

  it('maintains valid text when not over limit', async () => {
    const wrapper = await mountSuspended(TweetEditor, {
      props: { ...mockProps, modelValue: 'Normal text' },
      global: {
        plugins: [i18n],
      },
    });

    const component = wrapper.vm as any;
    expect(component.validText).toBe('Normal text');
  });

  it('highlights hashtags, mentions and links with .text-primary spans', async () => {
    const content = '#tag @user https://example.com www.example.com';
    const wrapper = await mountSuspended(TweetEditor, {
      props: { ...mockProps, modelValue: content },
      global: {
        plugins: [i18n],
      },
    });

    const highlights = wrapper.findAll('.text-primary');
    // Expect four highlighted items: #tag, @user, https://example.com, www.example.com
    expect(highlights.length).toBeGreaterThanOrEqual(4);

    const texts = highlights.map((h) => h.text());
    expect(texts.some((t) => t.includes('#tag'))).toBe(true);
    expect(texts.some((t) => t.includes('@user'))).toBe(true);
    expect(texts.some((t) => t.includes('https://example.com'))).toBe(true);
    expect(texts.some((t) => t.includes('www.example.com'))).toBe(true);
  });

  it('adjustHeight sets textarea.style.height to "auto" then to "<scrollHeight>px"', async () => {
    const wrapper = await mountSuspended(TweetEditor, {
      props: mockProps,
      global: {
        plugins: [i18n],
      },
    });
    const textarea = wrapper.find('textarea');

    // initial height
    textarea.element.style.height = '50px';

    // capture assignments to style.height
    const calls: string[] = [];
    Object.defineProperty(textarea.element.style, 'height', {
      configurable: true,
      set(v: string) {
        calls.push(v);
      },
      get() {
        return calls[calls.length - 1] || '';
      },
    });

    // mock scrollHeight used by adjustHeight
    Object.defineProperty(textarea.element, 'scrollHeight', {
      value: 150,
      configurable: true,
    });

    await textarea.setValue('Line 1\nLine 2');
    await textarea.trigger('input');

    expect(calls[0]).toBe('auto');
    expect(calls[1]).toBe('150px');
    expect(textarea.element.style.height).toBe('150px');
  });

  it('adjustHeight updates height on subsequent inputs when scrollHeight changes', async () => {
    const wrapper = await mountSuspended(TweetEditor, {
      props: mockProps,
      global: {
        plugins: [i18n],
      },
    });
    const textarea = wrapper.find('textarea');

    const calls: string[] = [];
    Object.defineProperty(textarea.element.style, 'height', {
      configurable: true,
      set(v: string) {
        calls.push(v);
      },
      get() {
        return calls[calls.length - 1] || '';
      },
    });

    // first input
    Object.defineProperty(textarea.element, 'scrollHeight', {
      value: 80,
      configurable: true,
    });
    await textarea.setValue('A\nB');
    await textarea.trigger('input');

    // update scrollHeight and input again
    Object.defineProperty(textarea.element, 'scrollHeight', {
      value: 120,
      configurable: true,
    });
    await textarea.setValue('A\nB\nC\nD');
    await textarea.trigger('input');

    // last two assignments should be ['auto', '120px']
    expect(calls.slice(-2)).toEqual(['auto', '120px']);
    expect(textarea.element.style.height).toBe('120px');
  });
});
