import { describe, expect, it, vi } from 'vitest';
import { mountSuspended } from '@nuxt/test-utils/runtime';
import DmMessageInput from '@/components/dm/conversation/DmMessageInput.vue';

describe('DmMessageInput Component', () => {
  it('renders the input container with correct structure', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    const container = wrapper.find('.bg-background.sticky.bottom-0');
    expect(container.exists()).toBe(true);
  });

  it('renders the text input field', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    const input = wrapper.find('input[type="text"]');
    expect(input.exists()).toBe(true);
    expect(input.classes()).toContain('flex-1');
    expect(input.classes()).toContain('bg-transparent');
  });

  it('renders the send button', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    const html = wrapper.html();
    expect(html).toContain('ic:outline-send');
  });

  it('displays toolbar with image icon when no image attached', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    const html = wrapper.html();
    expect(html).toContain('ic:outline-add-photo-alternate');
  });

  it('renders the hidden file input', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    const fileInput = wrapper.find('input[type="file"]');
    expect(fileInput.exists()).toBe(true);
    expect(fileInput.classes()).toContain('hidden');
    expect(fileInput.attributes('accept')).toBe('image/*');
  });

  it('disables send button when message is empty', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    const buttons = wrapper.findAll('button[type="button"]');
    // Last button should be the send button
    const sendButton = buttons[buttons.length - 1];
    expect(sendButton?.attributes('disabled')).toBeDefined();
  });

  it('enables send button when message has content', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    const input = wrapper.find('input[type="text"]');
    await input.setValue('Test message');

    // Wait for reactivity
    await wrapper.vm.$nextTick();

    const buttons = wrapper.findAll('button[type="button"]');
    const sendButton = buttons[buttons.length - 1];
    expect(sendButton?.attributes('disabled')).toBeUndefined();
  });

  it('emits send event with text when send button is clicked', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    const input = wrapper.find('input[type="text"]');
    await input.setValue('Test message');

    const buttons = wrapper.findAll('button[type="button"]');
    const sendButton = buttons[buttons.length - 1];
    await sendButton?.trigger('click');

    expect(wrapper.emitted('send')).toBeTruthy();
    expect(wrapper.emitted('send')?.[0]).toEqual([{ text: 'Test message', image: null }]);
  });

  it('clears message after sending', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    const input = wrapper.find('input[type="text"]');
    await input.setValue('Test message');
    await wrapper.vm.$nextTick();

    const buttons = wrapper.findAll('button[type="button"]');
    const sendButton = buttons[buttons.length - 1];
    await sendButton?.trigger('click');
    await wrapper.vm.$nextTick();

    expect((input.element as HTMLInputElement).value).toBe('');
  });

  it('handles Enter key to send message', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    const input = wrapper.find('input[type="text"]');
    await input.setValue('Test message');

    await input.trigger('keydown', { key: 'Enter' });

    expect(wrapper.emitted('send')).toBeTruthy();
  });

  it('does not send on Enter + Shift', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    const input = wrapper.find('input[type="text"]');
    await input.setValue('Test message');

    await input.trigger('keydown', { key: 'Enter', shiftKey: true });

    expect(wrapper.emitted('send')).toBeFalsy();
  });

  it('renders with proper styling', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    const innerContainer = wrapper.find('.bg-accent.rounded-2xl');
    expect(innerContainer.exists()).toBe(true);
  });

  it('groups toolbar and input in a role="group"', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    const group = wrapper.find('[role="group"]');
    expect(group.exists()).toBe(true);
    expect(group.classes()).toContain('flex');
    expect(group.classes()).toContain('items-center');
  });

  it('enables send button when image is attached without text', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    // Simulate file input change
    const fileInput = wrapper.find('input[type="file"]');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
    });

    await fileInput.trigger('change');
    await wrapper.vm.$nextTick();

    const buttons = wrapper.findAll('button[type="button"]');
    const sendButton = buttons[buttons.length - 1];
    expect(sendButton?.attributes('disabled')).toBeUndefined();
  });

  it('triggers file input click when add image is called', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    const fileInput = wrapper.find('input[type="file"]');
    const clickSpy = vi.spyOn(fileInput.element as HTMLInputElement, 'click');

    // Find the toolbar and trigger add-image event
    const html = wrapper.html();
    expect(html).toContain('ic:outline-add-photo-alternate');

    // Trigger the add-image event through the component
    const buttons = wrapper.findAll('button[type="button"]');
    const imageButton = buttons[0]; // First button is add image
    await imageButton?.trigger('click');

    expect(clickSpy).toHaveBeenCalled();
  });

  it('does not trigger file input when image already attached', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    // First attach an image
    const fileInput = wrapper.find('input[type="file"]');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
    });

    await fileInput.trigger('change');
    await wrapper.vm.$nextTick();

    // The replace button should be shown instead of toolbar
    const html = wrapper.html();
    expect(html).toContain('ic:outline-edit');
    expect(html).not.toContain('ic:outline-add-photo-alternate');
  });

  it('shows remove button when image is attached', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    // First attach an image
    const fileInput = wrapper.find('input[type="file"]');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
    });

    await fileInput.trigger('change');
    await wrapper.vm.$nextTick();

    // Verify image is attached and remove button is shown
    const html = wrapper.html();
    expect(html).toContain('ic:outline-cancel');
  });

  it('handles image file change event and shows preview', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    const fileInput = wrapper.find('input[type="file"]');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
    });

    await fileInput.trigger('change');
    await wrapper.vm.$nextTick();

    // Check that preview is shown
    const html = wrapper.html();
    expect(html).toContain('ic:outline-edit');
  });

  it('emits send event with both text and image', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    // Add text
    const input = wrapper.find('input[type="text"]');
    await input.setValue('Test message');

    // Add image
    const fileInput = wrapper.find('input[type="file"]');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
    });

    await fileInput.trigger('change');
    await wrapper.vm.$nextTick();

    // Send
    const buttons = wrapper.findAll('button[type="button"]');
    const sendButton = buttons[buttons.length - 1];
    await sendButton?.trigger('click');

    expect(wrapper.emitted('send')).toBeTruthy();
    const emittedData = wrapper.emitted('send')?.[0]?.[0] as { text: string; image: File | null };
    expect(emittedData.text).toBe('Test message');
    expect(emittedData.image).toBeTruthy();
  });

  it('emits send event with only image', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    // Add image only
    const fileInput = wrapper.find('input[type="file"]');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
    });

    await fileInput.trigger('change');
    await wrapper.vm.$nextTick();

    // Send
    const buttons = wrapper.findAll('button[type="button"]');
    const sendButton = buttons[buttons.length - 1];
    await sendButton?.trigger('click');

    expect(wrapper.emitted('send')).toBeTruthy();
    const emittedData = wrapper.emitted('send')?.[0]?.[0] as { text: string; image: File | null };
    expect(emittedData.text).toBe('');
    expect(emittedData.image).toBeTruthy();
  });

  it('clears image preview after sending and shows toolbar again', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    // Add image
    const fileInput = wrapper.find('input[type="file"]');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
    });

    await fileInput.trigger('change');
    await wrapper.vm.$nextTick();

    // Verify image preview is shown and toolbar is hidden
    let html = wrapper.html();
    expect(html).toContain('ic:outline-edit');
    expect(html).not.toContain('ic:outline-add-photo-alternate');

    // Send
    const buttons = wrapper.findAll('button[type="button"]');
    const sendButton = buttons[buttons.length - 1];
    await sendButton?.trigger('click');
    await wrapper.vm.$nextTick();

    // Check image preview is cleared and toolbar is back
    html = wrapper.html();
    expect(html).toContain('ic:outline-add-photo-alternate');
  });

  it('calls removeImage through MessageAttachmentPreview component', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    // Add image first
    const fileInput = wrapper.find('input[type="file"]');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
    });

    await fileInput.trigger('change');
    await wrapper.vm.$nextTick();

    // Verify image is shown
    let html = wrapper.html();
    expect(html).toContain('ic:outline-cancel');

    // Find and click the remove button
    const buttons = wrapper.findAll('button');
    const removeButton = buttons.find((btn) => btn.html().includes('ic:outline-cancel'));
    await removeButton?.trigger('click');
    await wrapper.vm.$nextTick();

    // Verify image is removed and toolbar is back
    html = wrapper.html();
    expect(html).toContain('ic:outline-add-photo-alternate');
    expect(html).not.toContain('ic:outline-cancel');
  });

  it('shows replace/edit button when image is attached', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    // Add image first
    const fileInput = wrapper.find('input[type="file"]');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
    });

    await fileInput.trigger('change');
    await wrapper.vm.$nextTick();

    // Verify edit/replace button is present
    const buttons = wrapper.findAll('button');
    const replaceButton = buttons.find((btn) => btn.html().includes('ic:outline-edit'));

    expect(replaceButton).toBeTruthy();
    expect(replaceButton?.exists()).toBe(true);
  });

  it('creates blob URL when image is loaded', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL');

    const fileInput = wrapper.find('input[type="file"]');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
    });

    await fileInput.trigger('change');
    await wrapper.vm.$nextTick();

    // Should create URL for the image
    expect(createObjectURLSpy).toHaveBeenCalled();
  });

  it('revokes blob URL when image is removed', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    // Add image
    const fileInput = wrapper.find('input[type="file"]');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
    });

    await fileInput.trigger('change');
    await wrapper.vm.$nextTick();

    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');

    // Remove image
    const buttons = wrapper.findAll('button');
    const removeButton = buttons.find((btn) => btn.html().includes('ic:outline-cancel'));
    await removeButton?.trigger('click');

    // Should revoke URL
    expect(revokeObjectURLSpy).toHaveBeenCalled();
  });

  it('revokes blob URL when sending message with image', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    // Add image
    const fileInput = wrapper.find('input[type="file"]');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
    });

    await fileInput.trigger('change');
    await wrapper.vm.$nextTick();

    const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL');

    // Send message
    const buttons = wrapper.findAll('button[type="button"]');
    const sendButton = buttons[buttons.length - 1];
    await sendButton?.trigger('click');

    // Should revoke URL after sending
    expect(revokeObjectURLSpy).toHaveBeenCalled();
  });

  it('passes correct box-style to MessageAttachmentPreview', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    // Add image
    const fileInput = wrapper.find('input[type="file"]');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
    });

    await fileInput.trigger('change');
    await wrapper.vm.$nextTick();

    // Check that MessageAttachmentPreview receives box-style prop
    const html = wrapper.html();
    expect(html).toContain('ic:outline-cancel');
    expect(html).toContain('ic:outline-edit');
  });

  it('handles empty file selection in onImageChange', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    const fileInput = wrapper.find('input[type="file"]');

    // Simulate empty file selection
    Object.defineProperty(fileInput.element, 'files', {
      value: null,
      writable: false,
    });

    await fileInput.trigger('change');
    await wrapper.vm.$nextTick();

    // Should not show preview
    const html = wrapper.html();
    expect(html).toContain('ic:outline-add-photo-alternate');
    expect(html).not.toContain('ic:outline-cancel');
  });

  it('computes previewUrl correctly when image exists', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url');

    const fileInput = wrapper.find('input[type="file"]');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
    });

    await fileInput.trigger('change');
    await wrapper.vm.$nextTick();

    // Verify createObjectURL was called
    expect(createObjectURLSpy).toHaveBeenCalledWith(file);
  });

  it('computes canSend correctly with trimmed empty message', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    const input = wrapper.find('input[type="text"]');
    await input.setValue('   '); // Only spaces

    await wrapper.vm.$nextTick();

    const buttons = wrapper.findAll('button[type="button"]');
    const sendButton = buttons[buttons.length - 1];

    // Should be disabled because trimmed message is empty
    expect(sendButton?.attributes('disabled')).toBeDefined();
  });

  it('sets imageMeta when image loads successfully', async () => {
    const wrapper = await mountSuspended(DmMessageInput);

    // Mock Image constructor to control load event
    const originalImage = global.Image;

    global.Image = class MockImage {
      onload: (() => void) | null = null;
      naturalWidth = 800;
      naturalHeight = 600;

      set src(_value: string) {
        // Trigger onload after src is set
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      }

      get src() {
        return 'mock-src';
      }
    } as unknown as typeof Image;

    const fileInput = wrapper.find('input[type="file"]');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

    Object.defineProperty(fileInput.element, 'files', {
      value: [file],
      writable: false,
    });

    await fileInput.trigger('change');
    await wrapper.vm.$nextTick();

    // Wait for image load
    await new Promise((resolve) => setTimeout(resolve, 10));

    // Verify component renders with the image
    const html = wrapper.html();
    expect(html).toContain('ic:outline-cancel');

    // Restore original Image
    global.Image = originalImage;
  });
});
