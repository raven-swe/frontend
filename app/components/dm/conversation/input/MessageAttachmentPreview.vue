<script lang="ts" setup>
interface Props {
  file: File | null;
  previewUrl: string;
  boxStyle: Record<string, string>;
}
const props = defineProps<Props>();
const emit = defineEmits<{ remove: [] }>();
</script>
<template>
  <div
    v-if="props.file"
    class="relative mb-3 overflow-hidden rounded-xl"
    :style="props.boxStyle"
    data-cy="dm-message-attachment-preview"
  >
    <img :src="props.previewUrl" alt="" class="h-full w-full object-cover" />
    <div class="absolute inset-0 flex items-start justify-between p-1">
      <button
        type="button"
        class="bg-background/60 text-foreground hover:bg-background/80 flex rounded-full p-1 backdrop-blur"
        data-cy="dm-message-attachment-remove-button"
        @click="emit('remove')"
      >
        <Icon name="ic:outline-cancel" size="16" />
      </button>
    </div>
  </div>
</template>
