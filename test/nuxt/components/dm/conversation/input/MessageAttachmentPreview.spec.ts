import { describe, expect, it } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import MessageAttachmentPreview from '@/components/dm/conversation/input/MessageAttachmentPreview.vue';

describe('MessageAttachmentPreview Component', () => {
  const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
  const mockPreviewUrl = 'blob:http://localhost/test-preview';
  const mockBoxStyle = { width: '200px', height: '150px' };

  it('renders nothing when no file is provided', async () => {
    const wrapper = await mountSuspended(MessageAttachmentPreview, {
      props: {
        file: null,
        previewUrl: '',
        boxStyle: mockBoxStyle,
      },
    });

    const container = wrapper.find('.relative');
    expect(container.exists()).toBe(false);
  });

  it('renders preview when file is provided', async () => {
    const wrapper = await mountSuspended(MessageAttachmentPreview, {
      props: {
        file: mockFile,
        previewUrl: mockPreviewUrl,
        boxStyle: mockBoxStyle,
      },
    });

    const container = wrapper.find('.relative');
    expect(container.exists()).toBe(true);
  });

  it('displays the preview image', async () => {
    const wrapper = await mountSuspended(MessageAttachmentPreview, {
      props: {
        file: mockFile,
        previewUrl: mockPreviewUrl,
        boxStyle: mockBoxStyle,
      },
    });

    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
    expect(img.attributes('src')).toBe(mockPreviewUrl);
  });

  it('applies custom box styling', async () => {
    const customStyle = { width: '300px', height: '200px' };
    const wrapper = await mountSuspended(MessageAttachmentPreview, {
      props: {
        file: mockFile,
        previewUrl: mockPreviewUrl,
        boxStyle: customStyle,
      },
    });

    const container = wrapper.find('.relative');
    expect(container.attributes('style')).toContain('width: 300px');
    expect(container.attributes('style')).toContain('height: 200px');
  });

  it('renders edit button', async () => {
    const wrapper = await mountSuspended(MessageAttachmentPreview, {
      props: {
        file: mockFile,
        previewUrl: mockPreviewUrl,
        boxStyle: mockBoxStyle,
      },
    });

    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBe(2);

    const html = wrapper.html();
    expect(html).toContain('ic:outline-edit');
  });

  it('renders remove button', async () => {
    const wrapper = await mountSuspended(MessageAttachmentPreview, {
      props: {
        file: mockFile,
        previewUrl: mockPreviewUrl,
        boxStyle: mockBoxStyle,
      },
    });

    const html = wrapper.html();
    expect(html).toContain('ic:outline-cancel');
  });

  it('emits edit event when edit button is clicked', async () => {
    const wrapper = await mountSuspended(MessageAttachmentPreview, {
      props: {
        file: mockFile,
        previewUrl: mockPreviewUrl,
        boxStyle: mockBoxStyle,
      },
    });

    const buttons = wrapper.findAll('button');
    const editButton = buttons[0];
    if (!editButton) throw new Error('Edit button not found');
    await editButton.trigger('click');

    expect(wrapper.emitted('edit')).toBeTruthy();
    expect(wrapper.emitted('edit')?.length).toBe(1);
  });

  it('emits remove event when remove button is clicked', async () => {
    const wrapper = await mountSuspended(MessageAttachmentPreview, {
      props: {
        file: mockFile,
        previewUrl: mockPreviewUrl,
        boxStyle: mockBoxStyle,
      },
    });

    const buttons = wrapper.findAll('button');
    const removeButton = buttons[1];
    if (!removeButton) throw new Error('Remove button not found');
    await removeButton.trigger('click');

    expect(wrapper.emitted('remove')).toBeTruthy();
    expect(wrapper.emitted('remove')?.length).toBe(1);
  });

  it('has proper styling for buttons', async () => {
    const wrapper = await mountSuspended(MessageAttachmentPreview, {
      props: {
        file: mockFile,
        previewUrl: mockPreviewUrl,
        boxStyle: mockBoxStyle,
      },
    });

    const buttons = wrapper.findAll('button');
    buttons.forEach((button) => {
      expect(button.classes()).toContain('rounded-full');
      expect(button.classes()).toContain('backdrop-blur');
    });
  });

  it('renders image with proper styling', async () => {
    const wrapper = await mountSuspended(MessageAttachmentPreview, {
      props: {
        file: mockFile,
        previewUrl: mockPreviewUrl,
        boxStyle: mockBoxStyle,
      },
    });

    const img = wrapper.find('img');
    expect(img.classes()).toContain('h-full');
    expect(img.classes()).toContain('w-full');
    expect(img.classes()).toContain('object-cover');
  });

  it('positions buttons in overlay', async () => {
    const wrapper = await mountSuspended(MessageAttachmentPreview, {
      props: {
        file: mockFile,
        previewUrl: mockPreviewUrl,
        boxStyle: mockBoxStyle,
      },
    });

    const overlay = wrapper.find('.absolute.inset-0');
    expect(overlay.exists()).toBe(true);
    expect(overlay.classes()).toContain('flex');
    expect(overlay.classes()).toContain('items-start');
    expect(overlay.classes()).toContain('justify-between');
  });

  it('has rounded corners', async () => {
    const wrapper = await mountSuspended(MessageAttachmentPreview, {
      props: {
        file: mockFile,
        previewUrl: mockPreviewUrl,
        boxStyle: mockBoxStyle,
      },
    });

    const container = wrapper.find('.relative');
    expect(container.classes()).toContain('rounded-xl');
    expect(container.classes()).toContain('overflow-hidden');
  });
});
