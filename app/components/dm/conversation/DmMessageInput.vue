<script lang="ts" setup>
import MessageAttachmentPreview from './input/MessageAttachmentPreview.vue';
import MessageSendButton from './input/MessageSendButton.vue';
import MessageTextField from './input/MessageTextField.vue';
import MessageToolbar from './input/MessageToolbar.vue';
import { showToaster } from '@/utils/showToaster';
import { uploadMediaService } from '@/services/tweet/uploadMediaService';
import type { useDmSocketIO } from '@/composables/useDmSocketIO';
import type { MediaItem } from '~~/shared/types/shared';

const message = ref('');
const media = ref<MediaItem | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const isUploading = ref(false);
const imageMeta = ref<{ width: number; height: number } | null>(null);
const imageFile = computed(() => media.value?.file ?? null);
const previewUrl = computed(() => media.value?.url ?? '');

const route = useRoute();
const conversationId = computed(() => route.params.conversationId as string);

const ws = inject<ReturnType<typeof useDmSocketIO>>('dmSocket');
const scrollToBottom = inject<() => void>('scrollToBottom');
const { uploadImage } = uploadMediaService();

const canSend = computed(
  () => (message.value.trim().length > 0 || !!media.value) && !isUploading.value,
);

async function handleSend() {
  const text = message.value.trim();

  if (!text && !media.value) {
    return;
  }

  if (!ws) {
    showToaster('error', 'WebSocket not initialized');
    return;
  }

  if (!ws.isConnected.value) {
    showToaster('error', 'Socket not connected');
    return;
  }

  if (!conversationId.value) {
    showToaster('error', 'No conversation selected');
    return;
  }

  isUploading.value = true;

  try {
    let mediaId: string | undefined;

    if (media.value && media.value.type === 'image') {
      try {
        mediaId = await uploadImage(media.value.file, 'messages');
      } catch {
        showToaster('error', 'Failed to upload image');
        return;
      }
    }

    ws.sendMessage(conversationId.value, text || '', mediaId);

    message.value = '';
    if (media.value) {
      URL.revokeObjectURL(media.value.url);
      media.value = null;
    }
    imageMeta.value = null;
    if (fileInputRef.value) fileInputRef.value.value = '';

    // Scroll to bottom after sending
    scrollToBottom?.();
  } catch {
    showToaster('error', 'Failed to send message');
  } finally {
    isUploading.value = false;
  }
}

function onAddImage() {
  // Only allow one image in DMs
  if (media.value) return;
  fileInputRef.value?.click();
}

function onImageChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  if (media.value) return;

  const url = URL.createObjectURL(file);
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const type = file.type.startsWith('video') ? 'video' : 'image';

  media.value = { id, file, url, type };

  const tmp = new Image();
  tmp.onload = () => {
    imageMeta.value = { width: tmp.naturalWidth, height: tmp.naturalHeight };
  };
  tmp.src = url;
}

function removeImage() {
  if (media.value) {
    URL.revokeObjectURL(media.value.url);
    media.value = null;
    imageMeta.value = null;
    if (fileInputRef.value) fileInputRef.value.value = '';
  }
}

const MAX_W = 240;
const MAX_H = 180;
const previewBoxStyle = computed(() => {
  const meta = imageMeta.value;
  if (!meta) return { width: '160px', height: '120px' };
  let { width, height } = meta;
  if (width === 0 || height === 0) return { width: '160px', height: '120px' };
  const scale = Math.min(MAX_W / width, MAX_H / height, 1);
  width = Math.round(width * scale);
  height = Math.round(height * scale);
  return { width: width + 'px', height: height + 'px' };
});
</script>

<template>
  <div class="bg-background sticky bottom-0">
    <div class="bg-accent m-4 rounded-2xl px-4 pt-4 pb-2">
      <MessageAttachmentPreview
        :file="imageFile"
        :preview-url="previewUrl"
        :box-style="previewBoxStyle"
        @replace="onAddImage"
        @remove="removeImage"
      />

      <div role="group" class="flex items-center gap-3">
        <template v-if="!media && !isUploading">
          <MessageToolbar @add-image="onAddImage" />
        </template>
        <MessageTextField v-model="message" :disabled="isUploading" @enter="handleSend" />
        <MessageSendButton :disabled="!canSend || isUploading" @send="handleSend" />
      </div>

      <div v-if="isUploading" class="text-muted-foreground mt-2 text-sm">
        {{ $t('dm.message-input.uploading') }}
      </div>

      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        class="hidden"
        data-cy="dm-message-attachment-input"
        @change="onImageChange"
      />
    </div>
  </div>
</template>
