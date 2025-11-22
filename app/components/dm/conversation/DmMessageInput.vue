<script lang="ts" setup>
import MessageAttachmentPreview from './input/MessageAttachmentPreview.vue';
import MessageSendButton from './input/MessageSendButton.vue';
import MessageTextField from './input/MessageTextField.vue';
import MessageToolbar from './input/MessageToolbar.vue';

const message = ref('');
const imageFile = ref<File | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);
const imageMeta = ref<{ width: number; height: number } | null>(null);
const previewUrl = computed(() => (imageFile.value ? URL.createObjectURL(imageFile.value) : ''));

const emit = defineEmits<{ send: [payload: { text: string; image?: File | null }] }>();

const canSend = computed(() => message.value.trim().length > 0 || !!imageFile.value);

function handleSend() {
  const text = message.value.trim();
  if (!text && !imageFile.value) return;
  emit('send', { text, image: imageFile.value });
  message.value = '';
  if (imageFile.value) URL.revokeObjectURL(previewUrl.value);
  imageFile.value = null;
  imageMeta.value = null;
  if (fileInputRef.value) fileInputRef.value.value = '';
}

function onAddImage() {
  if (imageFile.value) return;
  fileInputRef.value?.click();
}

function onImageChange(e: Event) {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  imageFile.value = file;
  const tmp = new Image();
  tmp.onload = () => {
    imageMeta.value = { width: tmp.naturalWidth, height: tmp.naturalHeight };
  };
  tmp.src = URL.createObjectURL(file);
}

function removeImage() {
  if (imageFile.value) URL.revokeObjectURL(previewUrl.value);
  imageFile.value = null;
  imageMeta.value = null;
  if (fileInputRef.value) fileInputRef.value.value = '';
}

// Dynamic sizing logic
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
        <template v-if="!imageFile">
          <MessageToolbar @add-image="onAddImage" />
        </template>
        <MessageTextField v-model="message" @enter="handleSend" />
        <MessageSendButton :disabled="!canSend" @send="handleSend" />
      </div>

      <input
        ref="fileInputRef"
        type="file"
        accept="image/*"
        class="hidden"
        @change="onImageChange"
      />
    </div>
  </div>
</template>
